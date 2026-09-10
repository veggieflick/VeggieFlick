import { NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { subscriptions, subscriptionItems, products, productVariants } from "@/db/schema";
import { apiError, apiOk } from "@/lib/api";
import { verifySessionToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await verifySessionToken(req);
  if (!auth.authenticated || !auth.user) {
    return apiError("UNAUTHORIZED", "Please sign in to view your subscriptions", 401);
  }

  try {
    const list = await db
      .select({
        id: subscriptions.id,
        frequency: subscriptions.frequency,
        deliverySlot: subscriptions.deliverySlot,
        status: subscriptions.status,
        createdAt: subscriptions.createdAt,
      })
      .from(subscriptions)
      .where(and(eq(subscriptions.profileId, auth.user.id), eq(subscriptions.status, "active")));

    return apiOk({ subscriptions: list });
  } catch (err) {
    return apiError("INTERNAL_ERROR", "Failed to fetch subscriptions", 500);
  }
}

export async function POST(req: NextRequest) {
  const auth = await verifySessionToken(req);
  if (!auth.authenticated || !auth.user) {
    return apiError("UNAUTHORIZED", "Please sign in to subscribe", 401);
  }

  try {
    const body = await req.json();
    const { productId, variantId, frequency, deliverySlot } = body;

    if (!productId || !variantId) {
      return apiError("BAD_REQUEST", "Product and Variant ID are required", 400);
    }

    const [variant] = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.id, variantId))
      .limit(1);

    if (!variant) return apiError("NOT_FOUND", "Variant not found", 404);

    const [sub] = await db
      .insert(subscriptions)
      .values({
        profileId: auth.user.id,
        frequency: frequency || "daily",
        deliverySlot: deliverySlot || "06:00 - 08:00 AM",
        status: "active",
      })
      .returning();

    await db.insert(subscriptionItems).values({
      subscriptionId: sub.id,
      productId,
      variantId,
      quantity: 1,
      unitPrice: variant.sellingPrice,
    });

    return apiOk({ subscriptionId: sub.id, message: "Subscription activated successfully!" }, 201);
  } catch (err) {
    return apiError("INTERNAL_ERROR", "Failed to create subscription", 500);
  }
}
