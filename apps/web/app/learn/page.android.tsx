import { LearnIndex } from "@/components/learn/learn-index";
import { toLearnSummary } from "@/lib/learn/articles";
import { LEARN_ARTICLES } from "@/lib/learn/content";

// The web page merges operator edits from `learn_articles`. The Android bundle
// is static, so it carries the articles shipped in code: summaries here, each
// body loaded from its category's chunk when it opens (lib/learn/bodies.ts).
export default function AndroidLearnPage() {
  return <LearnIndex articles={LEARN_ARTICLES.map(toLearnSummary)} />;
}
