import { LearnArticleView } from "@/components/learn/learn-article-view";
import { relatedArticles } from "@/lib/learn/articles";
import { LEARN_ARTICLES } from "@/lib/learn/content";

// Static twin of the web page next to it: shipped articles only, one page per slug.
export const dynamicParams = false;

export function generateStaticParams() {
  return LEARN_ARTICLES.map((article) => ({ slug: article.slug }));
}

export default async function AndroidLearnArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = LEARN_ARTICLES.find((item) => item.slug === slug) ?? null;
  const related = article ? relatedArticles(article, LEARN_ARTICLES) : [];
  return <LearnArticleView article={article} related={related} />;
}
