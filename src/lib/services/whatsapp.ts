/**
 * WhatsApp Notification Service for VeggieFlick
 * Sends direct WhatsApp alerts to Admin and Customer upon new order placement.
 */

export type OrderNotificationData = {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  grandTotal: number | string;
  paymentMethod: string;
  address: string;
  slot?: string;
  items: Array<{ name: string; quantity: number; price: number | string }>;
};

export async function sendWhatsAppOrderAlert(data: OrderNotificationData) {
  const rawAdminPhone = process.env.WHATSAPP_ADMIN_NUMBER || "9840532826";
  const cleanAdminPhone = rawAdminPhone.replace(/[^0-9]/g, "");
  const formattedAdminPhone = cleanAdminPhone.length === 10 ? `91${cleanAdminPhone}` : cleanAdminPhone;
  const fast2smsKey = process.env.FAST2SMS_API_KEY;

  const itemsFormatted = (data.items || [])
    .map((item) => `• ${item.name} x ${item.quantity} (₹${item.price})`)
    .join("\n");

  const messageText =
    `🛒 *NEW ORDER RECEIVED - VeggieFlick*\n\n` +
    `*Order #:* ${data.orderNumber}\n` +
    `*Customer:* ${data.customerName}\n` +
    `*Phone:* ${data.customerPhone}\n` +
    `*Total Amount:* ₹${data.grandTotal}\n` +
    `*Payment Method:* ${data.paymentMethod.toUpperCase()}\n` +
    `*Address:* ${data.address}\n` +
    (data.slot ? `*Slot:* ${data.slot}\n` : "") +
    `\n*Items Ordered:*\n${itemsFormatted || "• Standard Fresh Vegetable Pack"}\n\n` +
    `🔗 View in Admin: https://www.veggieflick.com/admin/orders`;

  console.log("=== WhatsApp Order Alert Generated ===");
  console.log(messageText);

  // Generate deep link for WhatsApp Web / App direct messaging
  const encodedText = encodeURIComponent(messageText);
  const whatsappWebUrl = `https://wa.me/${formattedAdminPhone}?text=${encodedText}`;

  // If Fast2SMS API key is configured, also dispatch instant SMS alert to admin phone
  if (fast2smsKey) {
    try {
      await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: fast2smsKey,
        },
        body: JSON.stringify({
          route: "q",
          message: `[VeggieFlick] New Order #${data.orderNumber} received for ₹${data.grandTotal} from ${data.customerName} (${data.customerPhone}). View details: https://www.veggieflick.com/admin/orders`,
          language: "english",
          flash: "0",
          numbers: cleanAdminPhone.length === 10 ? cleanAdminPhone : cleanAdminPhone.slice(-10),
        }),
      }).catch(() => undefined);
    } catch (smsErr) {
      console.warn("WhatsApp/SMS API alert notice:", smsErr);
    }
  }

  return { messageText, whatsappWebUrl };
}
