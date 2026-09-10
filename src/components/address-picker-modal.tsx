"use client";

import { useState } from "react";
import { MapPin, Check, Navigation, X } from "lucide-react";
import { useLanguage } from "@/components/language-context";

type ChennaiArea = {
  name: string;
  pincode: string;
  lat: number;
  lng: number;
};

const CHENNAI_AREAS: ChennaiArea[] = [
  { name: "Anna Nagar", pincode: "600040", lat: 13.085, lng: 80.2101 },
  { name: "T. Nagar", pincode: "600017", lat: 13.0418, lng: 80.2341 },
  { name: "Velachery", pincode: "600042", lat: 12.9815, lng: 80.218 },
  { name: "Adyar", pincode: "600020", lat: 13.0012, lng: 80.2565 },
  { name: "OMR Thoraipakkam", pincode: "600097", lat: 12.942, lng: 80.2366 },
  { name: "Porur", pincode: "600116", lat: 13.0382, lng: 80.1565 },
  { name: "Mylapore", pincode: "600004", lat: 13.0339, lng: 80.2686 },
  { name: "Koyambedu Hub", pincode: "600092", lat: 13.0694, lng: 80.1948 },
];

type AddressPickerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelectAddress: (data: {
    doorNo: string;
    street: string;
    area: string;
    city: string;
    postalCode: string;
    lat: number;
    lng: number;
  }) => void;
};

export function AddressPickerModal({ isOpen, onClose, onSelectAddress }: AddressPickerModalProps) {
  const { t } = useLanguage();
  const [selectedArea, setSelectedArea] = useState<ChennaiArea>(CHENNAI_AREAS[0]);
  const [doorNo, setDoorNo] = useState("");
  const [street, setStreet] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSelectAddress({
      doorNo: doorNo.trim() || "12",
      street: street.trim() || "Main Road",
      area: selectedArea.name,
      city: "Chennai",
      postalCode: selectedArea.pincode,
      lat: selectedArea.lat,
      lng: selectedArea.lng,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
      <div className="card w-full max-w-lg bg-white p-5 shadow-2xl rounded-2xl">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-700">
              <MapPin size={16} />
            </span>
            <h3 className="text-base font-bold text-ink">Pin Chennai Delivery Location</h3>
          </div>
          <button type="button" onClick={onClose} className="btn-ghost btn-icon h-8 w-8 rounded-full">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 grid gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700">Select Chennai Neighborhood</label>
            <div className="mt-2 grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
              {CHENNAI_AREAS.map((a) => (
                <button
                  key={a.name}
                  type="button"
                  onClick={() => setSelectedArea(a)}
                  className={`flex items-center justify-between rounded-xl border p-2.5 text-left transition-all ${
                    selectedArea.name === a.name
                      ? "border-sky-600 bg-sky-50 text-sky-900 ring-2 ring-sky-500/20"
                      : "border-line bg-white text-ink hover:bg-surface"
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold">{a.name}</p>
                    <p className="text-[10px] text-muted">{a.pincode}</p>
                  </div>
                  {selectedArea.name === a.name && <Check size={14} className="text-sky-600" />}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700">Door / Flat No *</label>
              <input
                required
                value={doorNo}
                onChange={(e) => setDoorNo(e.target.value)}
                placeholder="e.g. 42B, 3rd Floor"
                className="input mt-1 w-full text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700">Street Name *</label>
              <input
                required
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="e.g. 1st Main Road"
                className="input mt-1 w-full text-xs"
              />
            </div>
          </div>

          <div className="rounded-xl border border-sky-100 bg-sky-50/60 p-3 text-xs text-sky-900 flex items-center gap-2">
            <Navigation size={16} className="text-sky-600 shrink-0" />
            <span>
              GPS Coordinates: <strong>{selectedArea.lat.toFixed(4)}, {selectedArea.lng.toFixed(4)}</strong> · Within 25km Koyambedu Hub
            </span>
          </div>

          <div className="mt-2 flex gap-2">
            <button type="button" onClick={onClose} className="btn btn-outline flex-1 text-xs">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary flex-1 text-xs font-bold shadow-md">
              Save Delivery Location
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
