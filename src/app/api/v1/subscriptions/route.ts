import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { subscriptions, subscriptionItems, productVariants } from "@/db/schema";
import { ApiError, handle, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  return handle(async () => {
    const user = await requireUser();
    const list = await db
      .select({
        id: subscriptions.id,
        frequency: subscriptions.frequency,
        deliverySlot: subscriptions.deliverySlot,
        status: subscriptions.status,
        createdAt: subscriptions.createdAt,
      })
      .from(subscriptions)
      .where(and(eq(subscriptions.profileId, user.id), eq(subscriptions.status, "active")));

    return ok({ subscriptions: list });
  });
}

export async function POST(request: Request) {
  return handle(async () => {
    const user = await requireUser();
    const body = (await request.json()) as {
      productId?: string;
      variantId?: string;
      frequency?: string;
      deliverySlot?: string;
    };

    const { productId, variantId, frequency, deliverySlot } = body;

    if (!productId || !variantId) {
      throw new ApiError("Product and Variant ID are required", 400, "BAD_REQUEST");
    }

    const [variant] = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.id, variantId))
      .limit(1);

    if (!variant) {
      throw new ApiError("Variant not found", 404, "NOT_FOUND");
    }

    const [sub] = await db
      .insert(subscriptions)
      .values({
        profileId: user.id,
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

    return ok({ subscriptionId: sub.id, message: "Subscription activated successfully!" });
  });
}
