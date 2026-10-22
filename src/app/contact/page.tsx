import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Phone, ShieldCheck, Sparkles } from "lucide-react";
import { Breadcrumb } from "@/components/ui/primitives";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Contact Us — VeggieFlick KK Nagar Hub Chennai",
  description: "Get in touch with the VeggieFlick support and order desk at KK Nagar, Chennai. Phone, WhatsApp, and email support available 6 AM to 9 PM daily.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="container-page py-6 md:py-10">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Contact Us" },
        ]}
      />

      {/* Header */}
      <div className="mb-8">
        <span className="chip bg-emerald-100 text-emerald-900 border border-emerald-300 font-extrabold text-xs inline-flex items-center gap-1.5 shadow-xs mb-2">
          <Sparkles size={13} className="text-emerald-700" />
          KK NAGAR HUB SUPPORT
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl text-ink">
          Contact VeggieFlick
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Have a question about your vegetable order, custom cutting style, sprouts pre-order, or delivery slot? We are here to help from 6:00 AM to 9:00 PM daily.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 mb-12">
        {/* Contact Info Cards (7 cols) */}
        <div className="lg:col-span-7 grid gap-4">
          {/* Direct WhatsApp Callout */}
          <div className="rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 p-6 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="chip bg-emerald-500 text-white font-black text-[10px] tracking-wider uppercase">
                FASTEST RESPONSE
              </span>
              <span className="text-xs text-emerald-300 font-semibold">Replies within 5 mins</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">Chat Directly On WhatsApp</h2>
            <p className="mt-1.5 text-xs text-slate-300 leading-relaxed max-w-md">
              Need custom vegetable proportion for your biriyani, bulk fruit bowls, or special preparation? Message our prep team directly.
            </p>

            <div className="mt-5">
              <a
                href="https://wa.me/919840532826?text=Hi%20VeggieFlick!%20I%20have%20an%20inquiry%20regarding%20my%20produce%20order."
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-5 py-3 rounded-xl shadow-md inline-flex items-center gap-2"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.758.459 3.474 1.33 4.982l-1.413 5.163 5.285-1.386c1.455.794 3.09 1.213 4.784 1.214h.004c5.505 0 9.988-4.478 9.989-9.985 0-2.668-1.038-5.176-2.924-7.062-1.887-1.886-4.395-2.924-7.065-2.924zm0 18.232h-.003c-1.493 0-2.957-.401-4.233-1.157l-.304-.18-3.147.825.84-3.067-.197-.314c-.832-1.325-1.272-2.862-1.272-4.437 0-4.509 3.67-8.178 8.18-8.178 2.184 0 4.238.85 5.783 2.396 1.545 1.545 2.395 3.6 2.394 5.784 0 4.51-3.669 8.18-8.177 8.18z"/>
                </svg>
                <span>Open WhatsApp Support (+91 98405 32826)</span>
              </a>
            </div>
          </div>

          {/* Contact Details Grid */}
          <div className="grid gap-3.5 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 mb-3">
                <Phone size={18} />
              </span>
              <h3 className="text-sm font-extrabold text-ink">Call Our Hub</h3>
              <p className="text-xs text-slate-500 mt-0.5">Direct phone support</p>
              <a href="tel:+919840532826" className="mt-2 block text-sm font-black text-emerald-800 hover:underline">
                +91 98405 32826
              </a>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 mb-3">
                <Mail size={18} />
              </span>
              <h3 className="text-sm font-extrabold text-ink">Email Us</h3>
              <p className="text-xs text-slate-500 mt-0.5">For corporate & accounts</p>
              <a href="mailto:hello@veggieflick.in" className="mt-2 block text-sm font-black text-emerald-800 hover:underline">
                hello@veggieflick.in
              </a>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 mb-3">
                <Clock size={18} />
              </span>
              <h3 className="text-sm font-extrabold text-ink">Working Hours</h3>
              <p className="text-xs text-slate-500 mt-0.5">All 7 days a week</p>
              <p className="mt-2 text-sm font-black text-slate-800">
                6:00 AM – 9:00 PM Daily
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 mb-3">
                <MapPin size={18} />
              </span>
              <h3 className="text-sm font-extrabold text-ink">Chennai Hub</h3>
              <p className="text-xs text-slate-500 mt-0.5">Cold prep & packaging facility</p>
              <p className="mt-2 text-xs font-bold text-slate-800 leading-snug">
                No. 50, 51st Street, 9th Sector, KK Nagar, Chennai – 600078
              </p>
            </div>
          </div>
        </div>

        {/* Quick Inquiry Form (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black text-ink mb-1">Send A Message</h2>
          <p className="text-xs text-slate-500 mb-4">
            Leave your details and requirements; our team will call or message you promptly.
          </p>

          <ContactForm />
        </div>
      </div>
    </div>
  );
}
