import type { Post } from "./types";
import { post as howToRankOnChatgpt } from "./posts/how-to-rank-on-chatgpt";
import { post as whyNotShowingUp } from "./posts/why-your-business-doesnt-show-up-in-chatgpt";
import { post as whatIsAeo } from "./posts/what-is-answer-engine-optimization";
import { post as perplexityCitations } from "./posts/how-to-get-cited-by-perplexity";
import { post as aiOverviews } from "./posts/how-to-appear-in-google-ai-overviews";
import { post as schemaForAi } from "./posts/schema-markup-for-ai-search";
import { post as llmsTxt } from "./posts/llms-txt-guide";

/**
 * Publication order — newest intent first. The array order is the index order,
 * so this is also the editorial ranking; it isn't sorted by date, because every
 * post in the first batch shares a publication date.
 */
export const POSTS: Post[] = [
  howToRankOnChatgpt,
  whyNotShowingUp,
  whatIsAeo,
  perplexityCitations,
  aiOverviews,
  schemaForAi,
  llmsTxt,
];

export function getPost(slug: string) {
  return POSTS.find((p) => p.slug === slug);
}

/** Up to `limit` other posts, preferring ones sharing a category. */
export function relatedPosts(slug: string, limit = 3) {
  const current = getPost(slug);
  if (!current) return POSTS.slice(0, limit);
  const others = POSTS.filter((p) => p.slug !== slug);
  const sameCategory = others.filter((p) => p.category === current.category);
  const rest = others.filter((p) => p.category !== current.category);
  return [...sameCategory, ...rest].slice(0, limit);
}

export type { Post, PostBlock } from "./types";
