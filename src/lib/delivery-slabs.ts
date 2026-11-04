import { round2 } from "@/lib/utils";

export const FREE_DELIVERY_MIN_ORDER = 499;

export const CHARGE_SLABS = [
  { upto: 5, charge: 30 },
  { upto: 10, charge: 50 },
  { upto: 15, charge: 70 },
  { upto: 25, charge: 100 },
];

export function deliveryChargeForDistance(distanceKm: number): number {
  if (distanceKm <= 0) return 30;
  const slab = CHARGE_SLABS.find((s) => distanceKm <= s.upto);
  return slab ? slab.charge : 100;
}

export function calculateDeliveryAndPayable(params: {
  subtotal: number;
  discount?: number;
  taxAmount?: number;
  distanceKm?: number | null;
  isFreeDeliveryCoupon?: boolean;
}) {
  const subtotal = round2(params.subtotal || 0);
  const discount = round2(params.discount || 0);
  const taxAmount = round2(params.taxAmount || 0);

  // If basket is empty
  if (subtotal <= 0) {
    return {
      deliveryCharge: 0,
      payableAmount: 0,
      isFreeDelivery: true,
      amountToFreeDelivery: FREE_DELIVERY_MIN_ORDER,
    };
  }

  // Free delivery threshold or coupon
  const isFreeDelivery = subtotal >= FREE_DELIVERY_MIN_ORDER || Boolean(params.isFreeDeliveryCoupon);
  const distance = typeof params.distanceKm === "number" && params.distanceKm > 0 ? params.distanceKm : 6;
  const deliveryCharge = isFreeDelivery ? 0 : deliveryChargeForDistance(distance);
  const payableAmount = round2(Math.max(0, subtotal - discount + deliveryCharge + taxAmount));
  const amountToFreeDelivery = Math.max(0, FREE_DELIVERY_MIN_ORDER - subtotal);

  return {
    deliveryCharge,
    payableAmount,
    isFreeDelivery,
    amountToFreeDelivery,
  };
}
