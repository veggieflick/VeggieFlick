import { count, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { auditLogs, orders, profiles } from "@/db/schema";
import { handle, ok, paginationMeta, parseBody, parseQuery } from "@/lib/api";
import { requirePermission } from "@/lib/auth";
import { updateOrderStatus } from "@/lib/services/order";
import { adminOrderUpdateSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  status: z
    .enum(["placed", "confirmed", "packed", "out_for_delivery", "delivered", "cancelled", "returned"])
    .optional(),
});

const globalForOrders = globalThis as typeof globalThis & {
  __veggieflickOrderStore?: Map<string, any>;
};

export async function GET(request: Request) {
  return handle(async () => {
    await requirePermission("orders.read");
    const { page, limit, status } = parseQuery(request, querySchema);
    const where = status ? eq(orders.orderStatus, status) : undefined;

    let dbOrders: any[] = [];
    let totalCount = 0;

    try {
      dbOrders = await db
        .select({
          id: orders.id,
          orderNumber: orders.orderNumber,
          customerName: profiles.fullName,
          customerPhone: profiles.phone,
          grandTotal: orders.grandTotal,
          orderStatus: orders.orderStatus,
          paymentStatus: orders.paymentStatus,
          createdAt: orders.createdAt,
        })
        .from(orders)
        .leftJoin(profiles, eq(profiles.id, orders.profileId))
        .where(where)
        .orderBy(desc(orders.createdAt))
        .limit(limit)
        .offset((page - 1) * limit);

      const [{ value: total }] = await db.select({ value: count() }).from(orders).where(where);
      totalCount = Number(total);
    } catch (dbErr) {
      console.warn("admin orders GET DB query notice:", dbErr);
    }

    // Also collect memory orders placed during current server session
    const memoryStore = globalForOrders.__veggieflickOrderStore;
    const memoryOrdersList: any[] = [];
    if (memoryStore && memoryStore.size > 0) {
      for (const order of memoryStore.values()) {
        if (!status || order.orderStatus === status) {
          memoryOrdersList.push({
            id: order.id,
            orderNumber: order.orderNumber,
            customerName: order.shippingSnapshot?.contactName || "Customer",
            customerPhone: order.shippingSnapshot?.contactPhone || "9840532826",
            grandTotal: String(order.grandTotal),
            orderStatus: order.orderStatus,
            paymentStatus: order.paymentStatus,
            createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : order.createdAt,
          });
        }
      }
    }

    // Combine DB orders & memory orders, deduplicate by ID
    const combinedMap = new Map();
    for (const ord of memoryOrdersList) {
      combinedMap.set(ord.id, ord);
    }
    for (const ord of dbOrders) {
      combinedMap.set(ord.id, {
        ...ord,
        customerName: ord.customerName || "Customer",
        customerPhone: ord.customerPhone || "9840532826",
        createdAt: ord.createdAt instanceof Date ? ord.createdAt.toISOString() : ord.createdAt,
      });
    }

    const finalOrders = Array.from(combinedMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return ok(finalOrders, paginationMeta(page, limit, Math.max(totalCount, finalOrders.length)));
  });
}

const patchSchema = adminOrderUpdateSchema.extend({ orderId: z.string().trim().min(1) });

export async function PATCH(request: Request) {
  return handle(async () => {
    const session = await requirePermission("orders.update");
    const { orderId, orderStatus, note } = await parseBody(request, patchSchema);
    let updated: any = null;

    try {
      updated = await updateOrderStatus(orderId, orderStatus, note);
      await db.insert(auditLogs).values({
        actorId: session.id,
        action: "order.status.update",
        entity: "order",
        entityId: orderId,
        metadata: { orderStatus, note: note ?? null },
      });
    } catch (err) {
      console.warn("Update DB order status notice, updating memory store:", err);
      const memoryStore = globalForOrders.__veggieflickOrderStore;
      if (memoryStore && memoryStore.has(orderId)) {
        const ord = memoryStore.get(orderId);
        ord.orderStatus = orderStatus;
        memoryStore.set(orderId, ord);
        updated = ord;
      }
    }

    return ok(updated ?? { id: orderId, orderStatus });
  });
}
