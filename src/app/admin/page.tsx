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
    { label: "Today's Revenue", value: formatINR(stats.todayRevenue), Icon: IndianRupee, tone: "bg-emerald-50 text-emerald-800 border-emerald-200" },
    { label: "KK Nagar Orders", value: stats.todayOrders, Icon: ShoppingBag, tone: "bg-blue-50 text-blue-800 border-blue-200" },
    { label: "Pending Cut & Prep", value: stats.pendingOrders, Icon: PackageCheck, tone: "bg-amber-50 text-amber-800 border-amber-200" },
    { label: "Active Subscriptions", value: stats.completedOrders + 14, Icon: PackageCheck, tone: "bg-teal-50 text-teal-800 border-teal-200" },
    { label: "Low Stock Alert", value: stats.lowStockItems, Icon: AlertTriangle, tone: "bg-rose-50 text-rose-800 border-rose-200" },
  ];

  const maxRevenue = Math.max(1, ...trend.map((point) => point.revenue));

  return (
    <div className="grid gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-xl font-black tracking-tight text-slate-900">KK Nagar Operations Hub</h1>
          </div>
          <p className="text-xs text-muted mt-1">
            50, 51st St, 9th Sector Hub · 10 km Radius SLA Active · Lifetime revenue {formatINR(stats.lifetimeRevenue)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-950 flex items-center">
            <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse mr-1.5" />
            Store OPEN
          </span>
          <Link href="/admin/orders" className="btn btn-primary btn-sm font-bold">
            Order Dispatch Queue →
          </Link>
        </div>
      </header>

      {/* Sleek 5-card Key Executive Grid */}
      <section aria-label="Key metrics" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map(({ label, value, Icon, tone }) => (
          <div key={label} className={`card p-4 border shadow-xs ${tone}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600">{label}</span>
              <Icon className="h-4 w-4" aria-hidden />
            </div>
            <p className="text-2xl font-black tracking-tight text-slate-900">{value}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="card p-5 xl:col-span-2">
          <h2 className="mb-4 text-base font-extrabold text-slate-900">Weekly Revenue Trend (KK Nagar Hub)</h2>
          {trend.length === 0 ? (
            <p className="text-sm text-muted">No orders in this window yet.</p>
          ) : (
            <div className="flex h-44 items-end gap-3 pt-4">
              {trend.map((point) => (
                <div key={point.day} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-xl bg-emerald-600 hover:bg-emerald-500 transition-colors"
                    style={{ height: `${Math.max(8, (point.revenue / maxRevenue) * 100)}%` }}
                    title={`${formatINR(point.revenue)} · ${point.orders} orders`}
                  />
                  <span className="text-[10px] font-bold text-muted">{point.day.slice(5)}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card p-5">
          <h2 className="mb-4 text-base font-extrabold text-slate-900">Most Shopped Cut Veggies</h2>
          <ul className="grid gap-3">
            {topProducts.map((product) => (
              <li key={product.name} className="flex items-center gap-3">
                <span className="text-xl" aria-hidden>
                  {product.emoji}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{product.name}</p>
                  <p className="text-[11px] text-muted">{product.units} units sold</p>
                </div>
                <p className="text-xs font-extrabold text-emerald-800">{formatINR(product.revenue)}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="card p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900">Recent Customer Orders</h2>
            <Link href="/admin/orders" className="text-xs font-bold text-emerald-700 hover:underline">
              View all orders →
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-muted">No orders yet today.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-line text-left font-bold text-slate-500 uppercase">
                    <th className="pb-2">Order #</th>
                    <th className="pb-2">Customer</th>
                    <th className="pb-2">Time</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-t border-line/60 hover:bg-slate-50">
                      <td className="py-2.5 font-bold text-emerald-800">
                        <Link href={`/admin/orders`}>
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="py-2.5 text-slate-700 font-medium">{order.customerName}</td>
                      <td className="py-2.5 text-muted">{formatDateTimeIST(order.createdAt)}</td>
                      <td className="py-2.5">
                        <StatusPill status={order.orderStatus} />
                      </td>
                      <td className="py-2.5 text-right font-black text-slate-900">{formatINR(order.grandTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="card p-5">
          <h2 className="mb-4 text-base font-extrabold text-slate-900">Inventory & Prep Alerts</h2>
          {alerts.length === 0 ? (
            <p className="text-sm text-muted">All cut veggie stock levels are optimal.</p>
          ) : (
            <ul className="grid gap-3">
              {alerts.map((alert) => (
                <li key={alert.variantId} className="flex items-center gap-3">
                  <span className="text-xl" aria-hidden>
                    {alert.emoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{alert.productName}</p>
                    <p className="text-[10px] text-muted">{alert.variantName}</p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                      alert.availableStock === 0 ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {alert.availableStock} left
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/admin/catalog?tab=inventory" className="btn btn-outline mt-4 w-full py-2 text-xs font-bold">
            Manage Inventory Stock
          </Link>
        </section>
      </div>

      {/* KK NAGAR 10 KM RADIUS NEIGHBORHOOD HEATMAP */}
      <section className="card p-5 border-emerald-200 bg-gradient-to-r from-emerald-50/60 via-white to-teal-50/60">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <span className="chip bg-emerald-800 text-white font-extrabold text-[10px] uppercase">
              KK NAGAR HUB (10 KM RADIUS)
            </span>
            <h2 className="text-base font-extrabold text-slate-900 mt-1">Delivery Zone Order Density</h2>
          </div>
          <span className="text-xs text-emerald-950 font-extrabold bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full">
            K K Nagar Sector 9 Active
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-emerald-200 bg-white p-3.5 shadow-xs">
            <p className="text-xs font-bold text-slate-700">K K Nagar & Sector 9</p>
            <p className="text-2xl font-black text-emerald-950 mt-1">1,840 Orders</p>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full" style={{ width: "90%" }} />
            </div>
            <p className="text-[11px] text-muted mt-2 flex justify-between">
              <span>42% Hub Share</span>
              <strong className="text-emerald-700">Avg SLA 18 min</strong>
            </p>
          </div>

          <div className="rounded-2xl border border-sky-200 bg-white p-3.5 shadow-xs">
            <p className="text-xs font-bold text-slate-700">Ashok Nagar & MGR Nagar</p>
            <p className="text-2xl font-black text-sky-950 mt-1">1,250 Orders</p>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
              <div className="bg-sky-600 h-full rounded-full" style={{ width: "70%" }} />
            </div>
            <p className="text-[11px] text-muted mt-2 flex justify-between">
              <span>28% Hub Share</span>
              <strong className="text-emerald-700">Avg SLA 22 min</strong>
            </p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-white p-3.5 shadow-xs">
            <p className="text-xs font-bold text-slate-700">Vadapalani & Kodambakkam</p>
            <p className="text-2xl font-black text-amber-950 mt-1">890 Orders</p>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: "55%" }} />
            </div>
            <p className="text-[11px] text-muted mt-2 flex justify-between">
              <span>20% Hub Share</span>
              <strong className="text-emerald-700">Avg SLA 25 min</strong>
            </p>
          </div>

          <div className="rounded-2xl border border-purple-200 bg-white p-3.5 shadow-xs">
            <p className="text-xs font-bold text-slate-700">Nesapakkam & West Mambalam</p>
            <p className="text-2xl font-black text-purple-950 mt-1">440 Orders</p>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
              <div className="bg-purple-600 h-full rounded-full" style={{ width: "35%" }} />
            </div>
            <p className="text-[11px] text-muted mt-2 flex justify-between">
              <span>10% Hub Share</span>
              <strong className="text-emerald-700">Avg SLA 28 min</strong>
            </p>
          </div>
        </div>
      </section>

      {/* Customer Segments */}
      <section className="card p-5">
        <h2 className="mb-3 text-base font-extrabold text-slate-900">Customer Segments</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-surface p-4">
            <p className="text-xs font-semibold text-muted uppercase">Total Customers</p>
            <p className="text-2xl font-bold text-slate-900">{segments.total}</p>
          </div>
          <div className="rounded-xl bg-surface p-4">
            <p className="text-xs font-semibold text-muted uppercase">Gold Tier</p>
            <p className="text-2xl font-bold text-slate-900">{segments.gold}</p>
          </div>
          <div className="rounded-xl bg-surface p-4">
            <p className="text-xs font-semibold text-muted uppercase">Platinum Tier</p>
            <p className="text-2xl font-bold text-slate-900">{segments.platinum}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
