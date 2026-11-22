// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import Link from "next/link";

import { API_BASE, IS_NATIVE_APP } from "@/lib/app-target";
import { parseInline, resolveLegalHref, type Inline, type LegalBlock, type LegalDoc } from "@/lib/privacy/legal-doc";
import { Badge } from "@/components/ui/badge";

/**
 * Draws a LegalDoc (the privacy policy, /delete-account). When the text is in a
 * fallback language, `lang` is that language and `badge` says so in the UI's.
 */
export function LegalDocument({
  doc,
  lang,
  badge,
  children,
}: {
  doc: LegalDoc;
  lang?: string;
  badge?: string;
  children?: React.ReactNode;
}) {
  return (
    <article className="flex flex-col gap-6 text-sm leading-6">
      <header className="flex flex-col gap-2">
        <h1 lang={lang} className="text-2xl font-semibold text-balance">
          {doc.title}
        </h1>
        {badge ? <Badge className="self-start">{badge}</Badge> : null}
        <div lang={lang} className="flex flex-col gap-2">
          {doc.updated ? <p className="text-xs text-muted-foreground">{doc.updated}</p> : null}
          {doc.intro.map((block, index) => (
            <LegalBlockView key={index} block={block} />
          ))}
        </div>
      </header>
      {doc.sections.map((section) => (
        <section key={section.id} id={section.id} lang={lang} className="flex scroll-mt-20 flex-col gap-3">
          <h2 className="text-lg font-semibold text-balance">{section.title}</h2>
          {section.blocks.map((block, index) => (
            <LegalBlockView key={index} block={block} />
          ))}
        </section>
      ))}
      {children}
    </article>
  );
}

function LegalBlockView({ block }: { block: LegalBlock }) {
  if (block.kind === "p") {
    return (
      <p>
        <InlineText text={block.text} />
      </p>
    );
  }
  if (block.kind === "list") {
    const ListTag = block.ordered ? "ol" : "ul";
    return (
      <ListTag className={block.ordered ? "flex list-decimal flex-col gap-2 pl-5" : "flex list-disc flex-col gap-2 pl-5"}>
        {block.items.map((item, index) => (
          <li key={index}>
            <InlineText text={item} />
          </li>
        ))}
      </ListTag>
    );
  }
  return (
    <div className="rounded-2xl border border-border bg-card p-4 text-card-foreground">
      <h3 className="font-semibold">{block.title}</h3>
      <dl className="mt-2 flex flex-col gap-2">
        {block.rows.map((row) => (
          <div key={row.label}>
            <dt className="text-xs font-semibold tracking-wide text-primary uppercase">{row.label}</dt>
            <dd className="text-muted-foreground">
              <InlineText text={row.text} />
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function InlineText({ text }: { text: Inline }) {
  return (
    <>
      {parseInline(text).map((token, index) => {
        if (token.kind === "bold") {
          return (
            <strong key={index} className="font-semibold text-foreground">
              {token.text}
            </strong>
          );
        }
        if (token.kind === "link") {
          const link = resolveLegalHref(token.href, { android: IS_NATIVE_APP, webOrigin: API_BASE });
          return link.internal ? (
            <Link key={index} href={link.href} className="font-medium text-primary underline">
              {token.text}
            </Link>
          ) : (
            <a
              key={index}
              href={link.href}
              className="font-medium text-primary underline"
              {...(/^https?:\/\//.test(link.href) ? { target: "_blank", rel: "noreferrer" } : {})}
            >
              {token.text}
            </a>
          );
        }
        return token.text;
      })}
    </>
  );
}
