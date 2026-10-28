import { LearnIndex } from "@/components/learn/learn-index";
import { LEARN_ARTICLES } from "@/lib/learn/content";

// The web page merges operator edits from `learn_articles` on every request.
// The Android bundle is static, so it carries the articles shipped in code.
export default function AndroidLearnPage() {
  return <LearnIndex articles={LEARN_ARTICLES} />;
}
