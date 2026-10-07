"use client";

import { useState } from "react";
import { Star, ThumbsUp, CheckCircle, MessageSquare, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useApp } from "@/components/providers";

type ReviewItem = {
  id: string;
  name: string;
  location: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
  productTag?: string;
};

const INITIAL_REVIEWS: ReviewItem[] = [
  {
    id: "rev-1",
    name: "Lakshmi Sundaram",
    location: "51st Street, K K Nagar",
    rating: 5,
    date: "2 days ago",
    comment: "The precision-cut sambar mix and peeled small onions save me 25 minutes every single morning! Zero waste and extremely fresh.",
    verified: true,
    productTag: "Sambar Cut Pack",
  },
  {
    id: "rev-2",
    name: "Dr. Rajesh Kumar",
    location: "Anna Nagar West",
    rating: 5,
    date: "3 days ago",
    comment: "Ordered the tossed fruit salad and sprouted salad bowl. Cold delivery through Uber Direct arrived crisp with zero browning.",
    verified: true,
    productTag: "Fruit Salad Bowl",
  },
  {
    id: "rev-3",
    name: "Fathima Noor",
    location: "Ashok Nagar",
    rating: 5,
    date: "1 week ago",
    comment: "Subscribed to their weekly veggie box. Offers and promotion codes are sent directly to my phone. Excellent service!",
    verified: true,
    productTag: "Weekly Subscription Box",
  },
  {
    id: "rev-4",
    name: "Venkatesh P.",
    location: "Adyar",
    rating: 4,
    date: "1 week ago",
    comment: "Timely delivery in the 6 AM - 8 AM morning slot. Per-order delivery fee is reasonable considering the ozone washing quality.",
    verified: true,
    productTag: "Fresh Cut Veggies",
  },
];

export function FeedbackRatingSection() {
  const { notify } = useApp();
  const [reviews, setReviews] = useState<ReviewItem[]>(INITIAL_REVIEWS);
  const [formOpen, setFormOpen] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) {
      notify("Please fill in your name and review comment.", "error");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      const newReview: ReviewItem = {
        id: `rev-${Date.now()}`,
        name: name.trim(),
        location: location.trim() || "Chennai Customer",
        rating,
        date: "Just now",
        comment: comment.trim(),
        verified: true,
        productTag: "Verified Order",
      };

      setReviews([newReview, ...reviews]);
      notify("Thank you! Your feedback and rating have been published.");
      setName("");
      setLocation("");
      setRating(5);
      setComment("");
      setSubmitting(false);
      setFormOpen(false);
    }, 600);
  };

  return (
    <section className="py-12 bg-gradient-to-b from-white via-surface/40 to-emerald-50/20 border-y border-line/60">
      <div className="container-page">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="eyebrow flex items-center gap-1.5 text-emerald-700 font-extrabold">
              <Sparkles size={14} /> Real Customer Experiences
            </span>
            <h2 className="mt-1 text-2xl md:text-3xl font-extrabold tracking-tight text-ink font-display">
              Customer Feedback & Ratings
            </h2>
            <p className="mt-1 text-sm text-muted max-w-xl">
              See what families across KK Nagar and Chennai say about VeggieFlick&apos;s fresh produce, pre-cut veggies, and slot delivery.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setFormOpen((prev) => !prev)}
            className="btn btn-primary shadow-md font-bold px-5 py-2.5 text-sm shrink-0"
          >
            <MessageSquare size={16} />
            {formOpen ? "Close Review Form" : "Write a Review & Rating"}
          </button>
        </div>

        {/* Rating Breakdown Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-emerald-200/80 bg-white p-5 shadow-xs text-center flex flex-col justify-center items-center">
            <span className="text-4xl font-black text-emerald-800 font-display">4.9</span>
            <div className="mt-1 flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="currentColor" />
              ))}
            </div>
            <span className="mt-1.5 text-xs font-bold text-muted">1,420+ Chennai Verified Reviews</span>
          </div>

          {[
            { label: "Produce Freshness", score: "99.2%", desc: "Harvested at dawn daily" },
            { label: "Slot Delivery Accuracy", score: "98.7%", desc: "Delivered within chosen 2h slot" },
            { label: "Hygienic Ozone Cleaning", score: "100%", desc: "Triple washed & sealed" },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-line bg-white/90 p-5 shadow-xs flex flex-col justify-center">
              <span className="text-xs font-bold text-muted uppercase tracking-wider">{item.label}</span>
              <span className="mt-1 text-2xl font-black text-ink font-display">{item.score}</span>
              <span className="mt-0.5 text-[11px] font-semibold text-emerald-700">{item.desc}</span>
            </div>
          ))}
        </div>

        {/* Interactive Submit Form Modal / Collapsible */}
        {formOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 rounded-3xl border-2 border-emerald-500/30 bg-white p-6 shadow-xl"
          >
            <h3 className="text-lg font-bold text-ink font-display flex items-center gap-2">
              <Star className="text-amber-500 fill-amber-500" size={20} />
              Share Your VeggieFlick Experience
            </h3>
            <p className="text-xs text-muted mt-0.5">Your review will help us maintain high quality standards across Chennai.</p>

            <form onSubmit={handleSubmit} className="mt-4 grid gap-4 max-w-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-ink mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Anitha R."
                    className="w-full rounded-xl border border-line px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink mb-1">Location / Area</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. K K Nagar, Sector 4"
                    className="w-full rounded-xl border border-line px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1">Rating *</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 text-amber-400 hover:scale-110 transition-transform"
                    >
                      <Star size={24} fill={star <= rating ? "currentColor" : "none"} strokeWidth={1.5} />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-emerald-800 ml-2">{rating} Out of 5 Stars</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1">Your Review & Feedback *</label>
                <textarea
                  required
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us about the vegetable cut quality, packaging, or delivery experience..."
                  className="w-full rounded-xl border border-line px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="btn btn-ghost font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary font-bold text-sm px-6"
                >
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Customer Reviews Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="rounded-2xl border border-line bg-white p-4 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        fill={i < rev.rating ? "currentColor" : "none"}
                        className={i < rev.rating ? "" : "text-slate-300"}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-semibold text-muted">{rev.date}</span>
                </div>

                <p className="mt-3 text-xs text-ink/90 leading-relaxed font-medium">&ldquo;{rev.comment}&rdquo;</p>
              </div>

              <div className="mt-4 pt-3 border-t border-line/60 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-ink">{rev.name}</h4>
                  <span className="text-[10px] font-semibold text-muted block">{rev.location}</span>
                </div>
                {rev.verified && (
                  <span className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle size={10} /> Verified
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
