"use client";

import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 mb-3">
          <CheckCircle2 size={24} />
        </div>
        <h4 className="text-base font-extrabold text-emerald-950">Message Sent Successfully!</h4>
        <p className="mt-1 text-xs text-emerald-800">
          Our KK Nagar Hub manager will review your inquiry and get back to you shortly.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-4 text-xs font-bold text-emerald-700 underline hover:text-emerald-900"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
      className="grid gap-3.5"
    >
      <div>
        <label className="text-[11px] font-bold text-slate-700 block mb-1">Full Name</label>
        <input
          type="text"
          required
          placeholder="e.g. Anand Kumar"
          className="input input-sm w-full rounded-xl border-slate-300 text-xs"
        />
      </div>

      <div>
        <label className="text-[11px] font-bold text-slate-700 block mb-1">Mobile Number (WhatsApp)</label>
        <input
          type="tel"
          required
          placeholder="e.g. 98405 12345"
          className="input input-sm w-full rounded-xl border-slate-300 text-xs"
        />
      </div>

      <div>
        <label className="text-[11px] font-bold text-slate-700 block mb-1">Delivery Area / Locality</label>
        <input
          type="text"
          placeholder="e.g. KK Nagar, Anna Nagar, T. Nagar"
          className="input input-sm w-full rounded-xl border-slate-300 text-xs"
        />
      </div>

      <div>
        <label className="text-[11px] font-bold text-slate-700 block mb-1">Message or Custom Requirements</label>
        <textarea
          rows={3}
          required
          placeholder="Tell us what items or special cuts you are looking for..."
          className="textarea textarea-sm w-full rounded-xl border-slate-300 text-xs"
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-xs flex items-center justify-center gap-2 mt-1"
      >
        <Send size={14} />
        <span>Send Message</span>
      </button>
    </form>
  );
}
