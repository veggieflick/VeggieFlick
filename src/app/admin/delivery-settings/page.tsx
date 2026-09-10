"use client";

import { useState } from "react";
import {
  Truck,
  MapPin,
  Clock,
  ShieldCheck,
  Zap,
  SlidersHorizontal,
  Navigation,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  CloudRain,
  DollarSign,
  Plus,
} from "lucide-react";
import { formatINR } from "@/lib/utils";
import { useApp } from "@/components/providers";

type DeliverySlotConfig = {
  id: string;
  name: string;
  timeWindow: string;
  maxOrdersPerSlot: number;
  currentBookings: number;
  cutoffTime: string;
  extraFee: number;
  isActive: boolean;
};

type Driver = {
  id: string;
  name: string;
  phone: string;
  vehicle: "Electric Bike" | "Auto Rickshaw" | "Mini Pickup";
  hub: string;
  activeOrders: number;
  status: "On Delivery" | "Available" | "Offline";
};

const INITIAL_SLOTS: DeliverySlotConfig[] = [
  {
    id: "slot-1",
    name: "Morning Super-Express",
    timeWindow: "06:00 AM - 08:30 AM",
    maxOrdersPerSlot: 50,
    currentBookings: 42,
    cutoffTime: "10:00 PM (Previous Night)",
    extraFee: 0,
    isActive: true,
  },
  {
    id: "slot-2",
    name: "Midday Organic Fresh",
    timeWindow: "11:00 AM - 01:30 PM",
    maxOrdersPerSlot: 75,
    currentBookings: 38,
    cutoffTime: "08:30 AM (Same Day)",
    extraFee: 0,
    isActive: true,
  },
  {
    id: "slot-3",
    name: "Evening Family Dinner",
    timeWindow: "05:30 PM - 08:30 PM",
    maxOrdersPerSlot: 100,
    currentBookings: 89,
    cutoffTime: "02:00 PM (Same Day)",
    extraFee: 0,
    isActive: true,
  },
];

const INITIAL_DRIVERS: Driver[] = [
  {
    id: "drv-101",
    name: "M. Karthik",
    phone: "+91 98401 98765",
    vehicle: "Electric Bike",
    hub: "Koyambedu Central",
    activeOrders: 4,
    status: "On Delivery",
  },
  {
    id: "drv-102",
    name: "S. Venkatesh",
    phone: "+91 97902 43210",
    vehicle: "Electric Bike",
    hub: "Anna Nagar West Hub",
    activeOrders: 0,
    status: "Available",
  },
  {
    id: "drv-103",
    name: "R. Selvam",
    phone: "+91 94441 55667",
    vehicle: "Auto Rickshaw",
    hub: "Adyar Regional Hub",
    activeOrders: 6,
    status: "On Delivery",
  },
  {
    id: "drv-104",
    name: "A. Mohamed Imran",
    phone: "+91 98840 11223",
    vehicle: "Mini Pickup",
    hub: "Koyambedu Central",
    activeOrders: 0,
    status: "Available",
  },
];

export default function AdminDeliverySettingsPage() {
  const { notify } = useApp();
  const [slots, setSlots] = useState<DeliverySlotConfig[]>(INITIAL_SLOTS);
  const [drivers, setDrivers] = useState<Driver[]>(INITIAL_DRIVERS);

  // General Settings State
  const [coverageRadius, setCoverageRadius] = useState(25);
  const [freeShippingMin, setFreeShippingMin] = useState(299);
  const [standardDeliveryFee, setStandardDeliveryFee] = useState(30);
  const [isRainSurgeActive, setIsRainSurgeActive] = useState(false);
  const [rainSurgeFee, setRainSurgeFee] = useState(25);

  const handleToggleSlot = (id: string) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    );
    notify("Delivery slot configuration saved!");
  };

  const handleCapacityChange = (id: string, newMax: number) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, maxOrdersPerSlot: newMax } : s))
    );
  };

  const handleSaveSettings = () => {
    notify("Delivery Hub Radius & Surge Settings updated successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Delivery Hub & Fleet Settings</h1>
          <p className="text-sm text-slate-500">
            Configure Koyambedu 25km radius dispatch rules, order capacity limits, and driver tracking.
          </p>
        </div>
        <button
          onClick={handleSaveSettings}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
        >
          <ShieldCheck size={18} />
          Save Delivery Config
        </button>
      </div>

      {/* Grid: Global Delivery Hub Parameters & Surge Controls */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Coverage Radius & Min Threshold */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <MapPin className="h-5 w-5 text-brand-600" />
            <h2 className="font-bold text-slate-900">Coverage & Thresholds</h2>
          </div>
          <div className="space-y-4 text-sm">
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Koyambedu Radius</span>
                <span className="text-brand-700 font-bold">{coverageRadius} km</span>
              </div>
              <input
                type="range"
                min="5"
                max="40"
                value={coverageRadius}
                onChange={(e) => setCoverageRadius(Number(e.target.value))}
                className="w-full accent-brand-600 cursor-pointer"
              />
              <p className="text-xs text-slate-400 mt-1">
                Covers Anna Nagar, T. Nagar, Adyar, Velachery, OMR, Tambaram.
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Free Delivery Min Order</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  value={freeShippingMin}
                  onChange={(e) => setFreeShippingMin(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 pl-8 pr-3 py-2 text-slate-900 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Base Delivery Charge</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  value={standardDeliveryFee}
                  onChange={(e) => setStandardDeliveryFee(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 pl-8 pr-3 py-2 text-slate-900 font-bold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Surge & Weather Fee */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <CloudRain className="h-5 w-5 text-blue-600" />
            <h2 className="font-bold text-slate-900">Chennai Weather & Surge</h2>
          </div>
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
              <div>
                <p className="font-bold text-blue-900">Chennai Monsoon Rain Surge</p>
                <p className="text-xs text-blue-700">Add ₹{rainSurgeFee} during heavy rainfall</p>
              </div>
              <input
                type="checkbox"
                checked={isRainSurgeActive}
                onChange={(e) => {
                  setIsRainSurgeActive(e.target.checked);
                  notify(e.target.checked ? "Rain Surge Activated (+₹25)" : "Rain Surge Disabled");
                }}
                className="h-5 w-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Surge Fee Amount (₹)</label>
              <input
                type="number"
                value={rainSurgeFee}
                onChange={(e) => setRainSurgeFee(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 font-bold"
              />
            </div>

            <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800 border border-amber-200 flex items-start gap-2">
              <Zap className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <span>
                Surge fee is directly passed to electric scooter delivery partners as incentive.
              </span>
            </div>
          </div>
        </div>

        {/* Fleet Dispatch Summary */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <Truck className="h-5 w-5 text-brand-600" />
              <h2 className="font-bold text-slate-900">Fleet Overview</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-600 font-medium">On Delivery Drivers</span>
                <span className="font-bold text-emerald-600">
                  {drivers.filter((d) => d.status === "On Delivery").length} active
                </span>
              </div>
              <div className="flex justify-between items-center text-sm p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-600 font-medium">Available at Hub</span>
                <span className="font-bold text-blue-600">
                  {drivers.filter((d) => d.status === "Available").length} idle
                </span>
              </div>
              <div className="flex justify-between items-center text-sm p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-600 font-medium">EV Fleet Ratio</span>
                <span className="font-bold text-slate-900">75% Green EV</span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <span className="text-xs text-slate-500">Central Hub: Koyambedu Wholesale Market, Block A</span>
          </div>
        </div>
      </div>

      {/* Delivery Slot Capacity Limits */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 flex items-center gap-2">
            <Clock size={18} className="text-brand-600" /> Slot Capacity Limits & Cutoffs
          </h2>
          <span className="text-xs text-slate-500 font-medium">Max orders limit per 2.5hr window</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-100">
              <tr>
                <th className="px-6 py-3">Time Slot</th>
                <th className="px-6 py-3">Cutoff Time</th>
                <th className="px-6 py-3">Booked / Capacity</th>
                <th className="px-6 py-3">Capacity Slider</th>
                <th className="px-6 py-3 text-right">Slot Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {slots.map((slot) => (
                <tr key={slot.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{slot.name}</p>
                    <p className="text-xs text-slate-500">{slot.timeWindow}</p>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-amber-700 bg-amber-50/50 rounded-lg">
                    {slot.cutoffTime}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-900">{slot.currentBookings}</span> /{" "}
                    <span className="text-brand-700 font-bold">{slot.maxOrdersPerSlot} orders</span>
                  </td>
                  <td className="px-6 py-4 w-48">
                    <input
                      type="range"
                      min="20"
                      max="150"
                      step="5"
                      value={slot.maxOrdersPerSlot}
                      onChange={(e) => handleCapacityChange(slot.id, Number(e.target.value))}
                      className="w-full accent-brand-600 cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleToggleSlot(slot.id)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                        slot.isActive
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {slot.isActive ? "Open for Booking" : "Slot Locked"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delivery Driver Fleet List */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 flex items-center gap-2">
            <UserCheck size={18} className="text-brand-600" /> Active Driver Dispatch Roster
          </h2>
          <span className="text-xs text-slate-500 font-medium">{drivers.length} drivers registered</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-100">
              <tr>
                <th className="px-6 py-3">Driver Name</th>
                <th className="px-6 py-3">Vehicle Type</th>
                <th className="px-6 py-3">Assigned Hub</th>
                <th className="px-6 py-3">Active Deliveries</th>
                <th className="px-6 py-3 text-right">Live Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {drivers.map((drv) => (
                <tr key={drv.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{drv.name}</p>
                    <p className="text-xs text-slate-500">{drv.phone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                      {drv.vehicle}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600">{drv.hub}</td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-900">{drv.activeOrders} orders in bag</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                        drv.status === "On Delivery"
                          ? "bg-amber-100 text-amber-800"
                          : drv.status === "Available"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {drv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
