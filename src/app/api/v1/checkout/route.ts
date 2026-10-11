import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { addresses } from "@/db/schema";
import { handle, ok, parseBody } from "@/lib/api";
import { ensureValidProfileUuid, requireUser } from "@/lib/auth";
import { getCartSummary } from "@/lib/services/cart";
import { estimateDistanceFromAddress, listDeliverySlots, MAX_RADIUS_KM } from "@/lib/services/delivery";
import { placeOrder } from "@/lib/services/order";
import { checkoutSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

/** GET /api/v1/checkout — everything needed to render the checkout flow. */
export async function GET() {
  return handle(async () => {
    const session = await requireUser();
    const profileId = await ensureValidProfileUuid(session.id, session.phone, session.email, session.name);
    let savedAddresses: any[] = [];
    try {
      savedAddresses = await db
        .select()
        .from(addresses)
        .where(eq(addresses.profileId, profileId))
        .orderBy(desc(addresses.isDefault), desc(addresses.createdAt));
    } catch (err) {
      console.warn("GET checkout address fallback:", err);
    }

    const [cart, slots] = await Promise.all([
      getCartSummary(false),
      listDeliverySlots(),
    ]);

    return ok({
      cart,
      slots,
      user: {
        id: profileId,
        name: session.name || "Customer",
        phone: session.phone || "9840532826",
      },
      addresses: savedAddresses.map((address) => {
        const distanceKm = estimateDistanceFromAddress(address);
        return { ...address, distanceKm, serviceable: distanceKm <= MAX_RADIUS_KM };
      }),
      maxRadiusKm: MAX_RADIUS_KM,
    });
  });
}

/** POST /api/v1/checkout — place the order inside a single transaction. */
export async function POST(request: Request) {
  return handle(async () => {
    const session = await requireUser();
    const payload = await parseBody(request, checkoutSchema);
    const { order, duplicated } = await placeOrder(session.id, payload);
    return ok(
      {
        orderId: order.id,
        orderNumber: order.orderNumber,
        grandTotal: order.grandTotal,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        duplicated,
      },
      undefined,
      { status: duplicated ? 200 : 201 },
    );
  });
}
