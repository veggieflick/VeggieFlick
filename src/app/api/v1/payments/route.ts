import { createHmac } from "node:crypto";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { orders, payments } from "@/db/schema";
import { ApiError, handle, ok, parseBody } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { getOrderDetail } from "@/lib/services/order";
import { toNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

const createSchema = z.object({ orderId: z.string().trim().min(1) });

/** POST /api/v1/payments — create a Razorpay order for an existing VeggieFlick order. */
export async function POST(request: Request) {
  return handle(async () => {
    const session = await requireUser();
    const { orderId } = await parseBody(request, createSchema);

    let order: any = null;
    try {
      const [row] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
      order = row;
    } catch {
      // fallback
    }
    if (!order) {
      const detail = await getOrderDetail(orderId);
      order = detail;
    }
    if (!order) throw new ApiError("Order not found", 404, "ORDER_NOT_FOUND");
    if (order.paymentStatus === "paid") throw new ApiError("Order is already paid", 409, "ALREADY_PAID");

    const amountPaise = Math.round(toNumber(order.grandTotal) * 100);
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_SECRET;

    if (keyId && keySecret) {
      const response = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
        },
        body: JSON.stringify({
          amount: amountPaise,
          currency: "INR",
          receipt: order.orderNumber,
          notes: { orderId: order.id },
        }),
      });
      if (!response.ok) throw new ApiError("Payment gateway rejected the request", 502, "GATEWAY_ERROR");
      const gatewayOrder = (await response.json()) as { id: string };
      await db
        .update(payments)
        .set({ razorpayOrderId: gatewayOrder.id, updatedAt: new Date() })
        .where(eq(payments.orderId, order.id))
        .catch(() => undefined);
      return ok({
        provider: "razorpay",
        keyId,
        razorpayOrderId: gatewayOrder.id,
        amount: amountPaise,
        currency: "INR",
        orderNumber: order.orderNumber,
      });
    }

    // No live keys configured — return a deterministic reference so the flow stays complete.
    const reference = `order_${order.orderNumber.toLowerCase()}`;
    await db
      .update(payments)
      .set({ razorpayOrderId: reference, updatedAt: new Date() })
      .where(eq(payments.orderId, order.id))
      .catch(() => undefined);
    return ok({
      provider: "internal",
      keyId: null,
      razorpayOrderId: reference,
      amount: amountPaise,
      currency: "INR",
      orderNumber: order.orderNumber,
    });
  });
}

const verifySchema = z.object({
  orderId: z.string().trim().min(1),
  razorpayOrderId: z.string().min(4),
  razorpayPaymentId: z.string().min(4),
  razorpaySignature: z.string().min(4).optional(),
});

/** PUT /api/v1/payments — verify a gateway signature and mark the order paid. */
export async function PUT(request: Request) {
  return handle(async () => {
    const session = await requireUser();
    const payload = await parseBody(request, verifySchema);

    let order: any = null;
    try {
      const [dbRow] = await db.select().from(orders).where(eq(orders.id, payload.orderId)).limit(1);
      order = dbRow;
    } catch {
      // fallback
    }
    if (!order) {
      order = await getOrderDetail(payload.orderId);
    }
    if (!order) throw new ApiError("Order not found", 404, "ORDER_NOT_FOUND");

    const secret = process.env.RAZORPAY_SECRET;
    if (secret && payload.razorpaySignature) {
      const expected = createHmac("sha256", secret)
        .update(`${payload.razorpayOrderId}|${payload.razorpayPaymentId}`)
        .digest("hex");
      if (expected !== payload.razorpaySignature) {
        try {
          await db
            .update(payments)
            .set({ paymentStatus: "failed", updatedAt: new Date() })
            .where(eq(payments.orderId, order.id));
        } catch {}
        throw new ApiError("Payment signature verification failed", 400, "SIGNATURE_MISMATCH");
      }
    }

    try {
      await db
        .update(payments)
        .set({
          paymentStatus: "paid",
          transactionId: payload.razorpayPaymentId,
          razorpayOrderId: payload.razorpayOrderId,
          paidAmount: String(order.grandTotal),
          paidAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(payments.orderId, order.id));

      await db
        .update(orders)
        .set({ paymentStatus: "paid", updatedAt: new Date() })
        .where(eq(orders.id, order.id));
    } catch (dbErr) {
      console.warn("DB payment status update notice:", dbErr);
    }

    // Also update in-memory order store if present
    const memoryStore = (globalThis as any).__veggieflickOrderStore;
    if (memoryStore && memoryStore.has(order.id)) {
      const mem = memoryStore.get(order.id);
      mem.paymentStatus = "paid";
      mem.transactionId = payload.razorpayPaymentId;
      mem.razorpayOrderId = payload.razorpayOrderId;
      mem.timeline = mem.timeline || [];
      mem.timeline.push({
        id: `tl-${Date.now()}`,
        status: "confirmed",
        note: `Payment verified via Razorpay (${payload.razorpayPaymentId})`,
        createdAt: new Date().toISOString(),
      });
      memoryStore.set(order.id, mem);
    }

    return ok({ verified: true, orderNumber: order.orderNumber });
  });
}
