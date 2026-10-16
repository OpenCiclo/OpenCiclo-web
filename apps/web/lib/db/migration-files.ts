// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

// Test helper: reads drizzle/*.sql and parses the small DDL subset those files
// use. Anything outside that subset throws, so a new migration either fits the
// subset or extends this parser on purpose.

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const MIGRATIONS_DIR = join(dirname(fileURLToPath(import.meta.url)), "../../drizzle");

export type Migration = { file: string; sql: string };

export type SqlColumn = {
  type: string;
  notNull: boolean;
  primaryKey: boolean;
  unique: boolean;
  check: boolean;
  references: { table: string; column: string; onDelete: string } | null;
};

export type SqlTable = {
  columns: Record<string, SqlColumn>;
  primaryKey: string[] | null;
};

export type SqlIndex = {
  table: string;
  columns: string[];
  unique: boolean;
  partial: boolean;
};

export type SqlSchema = {
  tables: Record<string, SqlTable>;
  indexes: Record<string, SqlIndex>;
};

/** drizzle/*.sql in apply order, with `--` comments removed. */
export function readMigrations(): Migration[] {
  return readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith(".sql"))
    .sort()
    .map((file) => ({
      file,
      sql: readFileSync(join(MIGRATIONS_DIR, file), "utf8").replace(/--[^\n]*/g, ""),
    }));
}

export function statements(sql: string): string[] {
  return splitTopLevel(sql, ";")
    .map((statement) => statement.trim().replace(/\s+/g, " "))
    .filter(Boolean);
}

/** Replays every migration in order and returns the resulting schema. */
export function parseMigrations(migrations: Migration[]): SqlSchema {
  const schema: SqlSchema = { tables: {}, indexes: {} };
  for (const { file, sql } of migrations) {
    for (const statement of statements(sql)) {
      applyStatement(schema, statement, file);
    }
  }
  return schema;
}

function applyStatement(schema: SqlSchema, statement: string, file: string) {
  const createTable = /^CREATE TABLE (?:IF NOT EXISTS )?(\w+) \((.*)\)$/i.exec(statement);
  if (createTable) {
    const [, name, body] = createTable;
    const table: SqlTable = { columns: {}, primaryKey: null };
    for (const item of splitTopLevel(body, ",").map((part) => part.trim())) {
      const primaryKey = /^PRIMARY KEY \(([^)]*)\)$/i.exec(item);
      if (primaryKey) {
        table.primaryKey = primaryKey[1].split(",").map((column) => column.trim());
      } else if (/^(CONSTRAINT|CHECK|UNIQUE|FOREIGN KEY|EXCLUDE)\b/i.test(item)) {
        throw new Error(`${file}: table-level "${item}" is not supported by migration-files.ts`);
      } else {
        addColumn(table, item);
      }
    }
    schema.tables[name] = table;
    return;
  }

  const alterTable = /^ALTER TABLE (\w+) (.*)$/i.exec(statement);
  if (alterTable) {
    const [, name, actions] = alterTable;
    const table = schema.tables[name];
    if (!table) throw new Error(`${file}: ALTER TABLE on unknown table ${name}`);
    for (const action of splitTopLevel(actions, ",").map((part) => part.trim())) {
      const addColumnAction = /^ADD COLUMN (?:IF NOT EXISTS )?(.*)$/i.exec(action);
      if (!addColumnAction) {
        throw new Error(`${file}: "ALTER TABLE ${name} ${action}" is not supported by migration-files.ts`);
      }
      addColumn(table, addColumnAction[1]);
    }
    return;
  }

  const createIndex =
    /^CREATE (UNIQUE )?INDEX (?:IF NOT EXISTS )?(\w+) ON (\w+) \(([^)]*)\)( WHERE .*)?$/i.exec(
      statement,
    );
  if (createIndex) {
    const [, unique, name, table, columns, where] = createIndex;
    schema.indexes[name] = {
      table,
      columns: columns.split(",").map((column) => column.trim()),
      unique: Boolean(unique),
      partial: Boolean(where),
    };
    return;
  }

  if (/^UPDATE\b/i.test(statement)) return;

  throw new Error(`${file}: statement is not supported by migration-files.ts: ${statement}`);
}

function addColumn(table: SqlTable, definition: string) {
  const match = /^(\w+) (\w+(?:\[\])?)(.*)$/.exec(definition);
  if (!match) throw new Error(`Cannot parse column definition: ${definition}`);
  const [, name, type, rest] = match;
  const references = /\bREFERENCES (\w+)\((\w+)\)(?: ON DELETE (CASCADE|SET NULL|SET DEFAULT|RESTRICT|NO ACTION))?/i.exec(
    rest,
  );
  table.columns[name] = {
    type: type.toUpperCase(),
    notNull: /\bNOT NULL\b/i.test(rest),
    primaryKey: /\bPRIMARY KEY\b/i.test(rest),
    unique: /\bUNIQUE\b/i.test(rest),
    check: /\bCHECK\s*\(/i.test(rest),
    references: references
      ? {
          table: references[1],
          column: references[2],
          onDelete: (references[3] ?? "NO ACTION").toLowerCase(),
        }
      : null,
  };
}

function splitTopLevel(text: string, separator: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let quoted = false;
  let current = "";
  for (const char of text) {
    if (char === "'") quoted = !quoted;
    if (!quoted && char === "(") depth += 1;
    if (!quoted && char === ")") depth -= 1;
    if (!quoted && depth === 0 && char === separator) {
      parts.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  parts.push(current);
  return parts;
}
