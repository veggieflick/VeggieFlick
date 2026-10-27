import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { blogs, recipes } from "@/db/schema";
import { handle, ok, parseQuery } from "@/lib/api";

export const dynamic = "force-dynamic";

const schema = z.object({
  type: z.enum(["blogs", "recipes", "all"]).default("all"),
  limit: z.coerce.number().int().min(1).max(30).default(12),
});

import { FALLBACK_BLOGS, FALLBACK_RECIPES } from "@/lib/data/fallback-content";

export async function GET(request: Request) {
  return handle(async () => {
    const { type, limit } = parseQuery(request, schema);

    let blogRows: any[] = [];
    if (type !== "recipes") {
      try {
        blogRows = await db
          .select({
            id: blogs.id,
            title: blogs.title,
            slug: blogs.slug,
            emoji: blogs.emoji,
            author: blogs.author,
            shortDescription: blogs.shortDescription,
            publishedAt: blogs.publishedAt,
          })
          .from(blogs)
          .where(eq(blogs.status, "active"))
          .orderBy(desc(blogs.publishedAt))
          .limit(limit);
      } catch (err) {
        console.warn("api/v1/content blogs query error:", err);
      }
      if (!blogRows || blogRows.length === 0) {
        blogRows = FALLBACK_BLOGS.slice(0, limit).map((b) => ({
          id: b.id,
          title: b.title,
          slug: b.slug,
          emoji: b.emoji,
          author: b.author,
          shortDescription: b.shortDescription,
          publishedAt: b.publishedAt,
        }));
      }
    }

    let recipeRows: any[] = [];
    if (type !== "blogs") {
      try {
        recipeRows = await db
          .select({
            id: recipes.id,
            title: recipes.title,
            slug: recipes.slug,
            emoji: recipes.emoji,
            summary: recipes.summary,
            preparationTime: recipes.preparationTime,
            cookingTime: recipes.cookingTime,
            difficulty: recipes.difficulty,
          })
          .from(recipes)
          .where(eq(recipes.status, "active"))
          .orderBy(desc(recipes.createdAt))
          .limit(limit);
      } catch (err) {
        console.warn("api/v1/content recipes query error:", err);
      }
      if (!recipeRows || recipeRows.length === 0) {
        recipeRows = FALLBACK_RECIPES.slice(0, limit).map((r) => ({
          id: r.id,
          title: r.title,
          slug: r.slug,
          emoji: r.emoji,
          summary: r.summary,
          preparationTime: r.preparationTime,
          cookingTime: r.cookingTime,
          difficulty: r.difficulty,
        }));
      }
    }

    return ok({ blogs: blogRows, recipes: recipeRows });
  });
}
