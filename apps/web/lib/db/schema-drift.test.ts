// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { is } from "drizzle-orm";
import { PgTable, getTableConfig } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";

import { parseMigrations, readMigrations } from "@/lib/db/migration-files";
import * as schema from "@/lib/db/schema";

// schema.ts must describe the database the SQL files build. A plain .unique()
// on a column that SQL indexes partially once broke every pool upload.

const SQL_TYPES: Record<string, string> = {
  UUID: "uuid",
  TEXT: "text",
  INTEGER: "integer",
  TIMESTAMPTZ: "timestamp with time zone",
  JSONB: "jsonb",
  DATE: "date",
};

function sqlType(type: string): string {
  const base = type.replace(/\[\]$/, "");
  const mapped = SQL_TYPES[base];
  if (!mapped) throw new Error(`Add ${base} to SQL_TYPES in schema-drift.test.ts`);
  return type.endsWith("[]") ? `${mapped}[]` : mapped;
}

function shapeFromSql() {
  const { tables, indexes } = parseMigrations(readMigrations());
  return Object.fromEntries(
    Object.entries(tables).map(([tableName, table]) => [
      tableName,
      {
        columns: Object.fromEntries(
          Object.entries(table.columns).map(([name, column]) => [
            name,
            {
              type: sqlType(column.type),
              notNull: column.notNull || column.primaryKey || Boolean(table.primaryKey?.includes(name)),
              primaryKey: column.primaryKey,
              unique: column.unique ? `${tableName}_${name}_key` : null,
              references: column.references
                ? `${column.references.table}.${column.references.column} on delete ${column.references.onDelete}`
                : null,
            },
          ]),
        ),
        primaryKey: table.primaryKey,
        checks: Object.entries(table.columns)
          .filter(([, column]) => column.check)
          .map(([name]) => `${tableName}_${name}_check`)
          .sort(),
        indexes: Object.fromEntries(
          Object.entries(indexes)
            .filter(([, index]) => index.table === tableName)
            .map(([name, index]) => [
              name,
              { columns: index.columns, unique: index.unique, partial: index.partial },
            ]),
        ),
      },
    ]),
  );
}

function shapeFromDrizzle() {
  const tables = Object.values(schema).filter((value) => is(value, PgTable));
  return Object.fromEntries(
    tables.map((table) => {
      const config = getTableConfig(table);
      const compositeKey = config.primaryKeys[0]?.columns.map((column) => column.name) ?? null;
      const references = new Map(
        config.foreignKeys.map((foreignKey) => {
          const reference = foreignKey.reference();
          const target = `${getTableConfig(reference.foreignTable).name}.${reference.foreignColumns[0].name}`;
          return [
            reference.columns[0].name,
            `${target} on delete ${foreignKey.onDelete ?? "no action"}`,
          ] as const;
        }),
      );
      return [
        config.name,
        {
          columns: Object.fromEntries(
            config.columns.map((column) => [
              column.name,
              {
                type: column.getSQLType(),
                notNull: column.notNull,
                primaryKey: column.primary,
                unique: column.isUnique ? (column.uniqueName ?? null) : null,
                references: references.get(column.name) ?? null,
              },
            ]),
          ),
          primaryKey: compositeKey,
          checks: config.checks.map((item) => item.name).sort(),
          indexes: Object.fromEntries(
            config.indexes.map((item) => [
              item.config.name,
              {
                columns: item.config.columns.map((column) => ("name" in column ? column.name : "?")),
                unique: item.config.unique,
                partial: Boolean(item.config.where),
              },
            ]),
          ),
        },
      ];
    }),
  );
}

describe("schema.ts mirrors drizzle/*.sql", () => {
  it("has the same tables, columns, keys, checks, and indexes", () => {
    expect(shapeFromDrizzle()).toEqual(shapeFromSql());
  });
});
