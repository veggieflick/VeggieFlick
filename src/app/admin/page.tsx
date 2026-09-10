import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  IndianRupee,
  PackageCheck,
  PackageX,
  ShoppingBag,
  Ticket,
  Truck,
  UserPlus,
} from "lucide-react";
import { BACK_OFFICE_ROLES, getSession } from "@/lib/auth";
import {
  getCustomerSegments,
  getDashboardStats,
  getInventoryAlerts,
  getRecentOrders,
  getRevenueTrend,
  getTopProducts,
} from "@/lib/services/analytics";
import { formatDateTimeIST, formatINR } from "@/lib/utils";
import { StatusPill } from "@/components/ui/primitives";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session || !BACK_OFFICE_ROLES.includes(session.role)) redirect("/admin/login");

  const [stats, trend, topProducts, alerts, recentOrders, segments] = await Promise.all([
    getDashboardStats(),
    getRevenueTrend(7),
    getTopProducts(6),
    getInventoryAlerts(6),
    getRecentOrders(6),
    getCustomerSegments(),
  ]);

  const cards = [
    { label: "Today's revenue", value: formatINR(stats.todayRevenue), Icon: IndianRupee, tone: "bg-brand-50 text-brand-700" },
    { label: "Today's orders", value: stats.todayOrders, Icon: ShoppingBag, tone: "bg-blue-50 text-blue-700" },
    { label: "Pending orders", value: stats.pendingOrders, Icon: PackageCheck, tone: "bg-amber-50 text-amber-700" },
    { label: "Completed orders", value: stats.completedOrders, Icon: PackageCheck, tone: "bg-brand-50 text-brand-700" },
    { label: "Cancelled / returned", value: stats.cancelledOrders, Icon: PackageX, tone: "bg-red-50 text-red-700" },
    { label: "New customers today", value: stats.newCustomers, Icon: UserPlus, tone: "bg-purple-50 text-purple-700" },
    { label: "Low stock items", value: stats.lowStockItems, Icon: AlertTriangle, tone: "bg-orange-50 text-orange-700" },
    { label: "Out of stock", value: stats.outOfStockItems, Icon: PackageX, tone: "bg-red-50 text-red-700" },
    { label: "Out for delivery", value: stats.deliveryInProgress, Icon: Truck, tone: "bg-sky-50 text-sky-700" },
    { label: "Active coupons", value: stats.activeCoupons, Icon: Ticket, tone: "bg-yellow-50 text-yellow-700" },
  ];

  const maxRevenue = Math.max(1, ...trend.map((point) => point.revenue));

  return (
    <div className="grid gap-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Operations dashboard</h1>
        <p className="text-sm text-muted">
          Live KPIs for the Chennai Central Hub · lifetime revenue {formatINR(stats.lifetimeRevenue)} · AOV{" "}
          {formatINR(stats.averageOrderValue)}
        </p>
      </header>

      <section aria-label="Key metrics" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map(({ label, value, Icon, tone }) => (
          <div key={label} className="card p-4">
            <span className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${tone}`}>
              <Icon className="h-4 w-4" aria-hidden />
            </span>
            <p className="text-xs font-semibold text-muted uppercase">{label}</p>
            <p className="text-xl font-bold">{value}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="card p-5 xl:col-span-2">
          <h2 className="mb-4 text-lg font-bold">Revenue · last 7 days</h2>
          {trend.length === 0 ? (
            <p className="text-sm text-muted">No orders in this window yet.</p>
          ) : (
            <div className="flex h-48 items-end gap-3">
              {trend.map((point) => (
                <div key={point.day} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-lg bg-brand-500"
                    style={{ height: `${Math.max(6, (point.revenue / maxRevenue) * 100)}%` }}
                    title={`${formatINR(point.revenue)} · ${point.orders} orders`}
                  />
                  <span className="text-[10px] text-muted">{point.day.slice(5)}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card p-5">
          <h2 className="mb-4 text-lg font-bold">Top products</h2>
          <ul className="grid gap-3">
            {topProducts.map((product) => (
              <li key={product.name} className="flex items-center gap-3">
                <span className="text-xl" aria-hidden>
                  {product.emoji}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{product.name}</p>
                  <p className="text-xs text-muted">{product.units} units</p>
                </div>
                <p className="text-sm font-bold">{formatINR(product.revenue)}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="card p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">Recent orders</h2>
            <Link href="/admin/orders" className="text-sm font-semibold text-brand-700">
              View all →
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-muted">No orders yet today.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted uppercase">
                    <th className="pb-2">Order</th>
                    <th className="pb-2">Customer</th>
                    <th className="pb-2">Placed</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-t border-line">
                      <td className="py-2.5 font-semibold">
                        <Link href={`/admin/orders`} className="hover:text-brand-700">
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="py-2.5 text-muted">{order.customerName}</td>
                      <td className="py-2.5 text-xs text-muted">{formatDateTimeIST(order.createdAt)}</td>
                      <td className="py-2.5">
                        <StatusPill status={order.orderStatus} />
                      </td>
                      <td className="py-2.5 text-right font-bold">{formatINR(order.grandTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="card p-5">
          <h2 className="mb-4 text-lg font-bold">Inventory alerts</h2>
          {alerts.length === 0 ? (
            <p className="text-sm text-muted">All SKUs are above their reorder level.</p>
          ) : (
            <ul className="grid gap-3">
              {alerts.map((alert) => (
                <li key={alert.variantId} className="flex items-center gap-3">
                  <span className="text-xl" aria-hidden>
                    {alert.emoji}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{alert.productName}</p>
                    <p className="text-xs text-muted">{alert.variantName}</p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-bold ${
                      alert.availableStock === 0 ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {alert.availableStock} left
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/admin/catalog?tab=inventory" className="btn btn-outline mt-4 w-full py-2 text-sm">
            Manage inventory
          </Link>
        </section>
      </div>

      {/* CHENNAI DELIVERY NEIGHBORHOOD HEATMAP */}
      <section className="card p-5 border-sky-100 bg-gradient-to-r from-sky-50/40 via-white to-emerald-50/40">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <span className="chip bg-sky-100 text-sky-900 border border-sky-200 font-extrabold text-[10px] uppercase">
              📍 CHENNAI DELIVERIES HEATMAP
            </span>
            <h2 className="text-lg font-bold text-ink mt-1">Neighborhood Order Density & SLA Performance</h2>
          </div>
          <span className="text-xs text-emerald-800 font-bold bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-full">
            25 km Koyambedu Radius Active
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-sky-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold text-slate-600">Anna Nagar & Kilpauk</p>
            <p className="text-2xl font-extrabold text-sky-900 mt-1">1,420 Orders</p>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
              <div className="bg-sky-600 h-full rounded-full" style={{ width: "85%" }} />
            </div>
            <p className="text-[11px] text-muted mt-2 flex justify-between">
              <span>32% Share</span>
              <strong className="text-emerald-700">Avg SLA 24 min</strong>
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold text-slate-600">OMR & Velachery</p>
            <p className="text-2xl font-extrabold text-emerald-900 mt-1">1,180 Orders</p>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full" style={{ width: "72%" }} />
            </div>
            <p className="text-[11px] text-muted mt-2 flex justify-between">
              <span>28% Share</span>
              <strong className="text-emerald-700">Avg SLA 28 min</strong>
            </p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold text-slate-600">T. Nagar & Mylapore</p>
            <p className="text-2xl font-extrabold text-amber-900 mt-1">980 Orders</p>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: "60%" }} />
            </div>
            <p className="text-[11px] text-muted mt-2 flex justify-between">
              <span>24% Share</span>
              <strong className="text-emerald-700">Avg SLA 26 min</strong>
            </p>
          </div>

          <div className="rounded-2xl border border-purple-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold text-slate-600">Porur & Ambattur</p>
            <p className="text-2xl font-extrabold text-purple-900 mt-1">650 Orders</p>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
              <div className="bg-purple-600 h-full rounded-full" style={{ width: "45%" }} />
            </div>
            <p className="text-[11px] text-muted mt-2 flex justify-between">
              <span>16% Share</span>
              <strong className="text-emerald-700">Avg SLA 31 min</strong>
            </p>
          </div>
        </div>
      </section>

      <section className="card p-5">
        <h2 className="mb-3 text-lg font-bold">Customer segments</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-surface p-4">
            <p className="text-xs font-semibold text-muted uppercase">Total customers</p>
            <p className="text-2xl font-bold">{segments.total}</p>
          </div>
          <div className="rounded-xl bg-surface p-4">
            <p className="text-xs font-semibold text-muted uppercase">Gold tier</p>
            <p className="text-2xl font-bold">{segments.gold}</p>
          </div>
          <div className="rounded-xl bg-surface p-4">
            <p className="text-xs font-semibold text-muted uppercase">Platinum tier</p>
            <p className="text-2xl font-bold">{segments.platinum}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
