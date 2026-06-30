"use client";

import { useRef, useState } from "react";
import {
  createService,
  deleteService,
  setServiceActive,
  updateService,
} from "@/action/services";
import { IconTag, IconPlus, IconClock } from "@/components/icons";
import type { Service } from "@/lib/types";

export function ServicesBoard({
  services,
  serviceLabel,
}: {
  services: Service[];
  serviceLabel: string;
}) {
  const [items, setItems] = useState(services);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);

  return (
    <div>
      <div className="flex justify-end">
        <button onClick={() => setModal(true)} className="btn-primary">
          <IconPlus className="h-4 w-4" /> Add {serviceLabel}
        </button>
      </div>

      {items.length === 0 ? (
        <p className="py-16 text-center text-sm text-gray-500">
          No {serviceLabel.toLowerCase()}s yet — add your first one.
        </p>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((s) => (
            <div key={s.id} className="card flex flex-col">
              <div className="flex items-start justify-between">
                <span className="page-icon">
                  <IconTag className="h-5 w-5" />
                </span>
                <span
                  className={`chip ${
                    s.is_active
                      ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                      : "border border-ink-soft bg-ink-overlay text-gray-500"
                  }`}
                >
                  {s.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              <h3 className="mt-3 text-lg font-bold text-gray-100">{s.name}</h3>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <IconClock className="h-3.5 w-3.5" /> {s.duration_minutes} minutes
                </span>
                {s.price != null && <span>${s.price}</span>}
                {s.buffer_minutes > 0 && <span>+{s.buffer_minutes}m buffer</span>}
                {s.capacity > 1 && <span>{s.capacity} seats</span>}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-ink-border pt-3 text-sm">
                <button onClick={() => setEditing(s)} className="text-brand hover:underline">
                  ✎ Edit
                </button>
                <button
                  onClick={async () => {
                    const next = !s.is_active;
                    setItems((prev) =>
                      prev.map((x) => (x.id === s.id ? { ...x, is_active: next } : x)),
                    );
                    await setServiceActive(s.id, next);
                  }}
                  className="text-gray-400 hover:text-gray-200"
                >
                  {s.is_active ? "◉ Active" : "○ Inactive"}
                </button>
                <button
                  onClick={async () => {
                    if (!confirm(`Delete "${s.name}"?`)) return;
                    setItems((prev) => prev.filter((x) => x.id !== s.id));
                    await deleteService(s.id);
                  }}
                  className="text-rose-400 hover:text-rose-300"
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {(modal || editing) && (
        <ServiceModal
          serviceLabel={serviceLabel}
          existing={editing}
          onClose={() => {
            setModal(false);
            setEditing(null);
          }}
          onSaved={(svc) => {
            if (editing) {
              setItems((prev) => prev.map((x) => (x.id === svc.id ? svc : x)));
            }
            setModal(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function ServiceModal({
  serviceLabel,
  existing,
  onClose,
  onSaved,
}: {
  serviceLabel: string;
  existing: Service | null;
  onClose: () => void;
  onSaved: (s: Service) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const ref = useRef<HTMLFormElement>(null);

  async function action(formData: FormData) {
    setPending(true);
    setError(null);
    if (existing) {
      const updated: Service = {
        ...existing,
        name: String(formData.get("name") ?? existing.name),
        duration_minutes: Number(formData.get("durationMinutes") ?? existing.duration_minutes),
        price: formData.get("price") ? Number(formData.get("price")) : null,
        buffer_minutes: Number(formData.get("bufferMinutes") ?? 0),
        capacity: Number(formData.get("capacity") ?? 1),
      };
      const res = await updateService({
        id: existing.id,
        name: updated.name,
        durationMinutes: updated.duration_minutes,
        price: updated.price,
        bufferMinutes: updated.buffer_minutes,
        capacity: updated.capacity,
      });
      setPending(false);
      if (res?.error) return setError(res.error);
      onSaved(updated);
    } else {
      const res = await createService(formData);
      setPending(false);
      if (res?.error) return setError(res.error);
      ref.current?.reset();
      onSaved(existing as never); // list revalidates via server action
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl border border-ink-border bg-ink-raised p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-white">
          {existing ? `Edit ${serviceLabel}` : `Add ${serviceLabel}`}
        </h3>
        <form ref={ref} action={action} className="mt-5 space-y-4">
          <div>
            <label className="label" htmlFor="s-name">Name</label>
            <input id="s-name" name="name" required defaultValue={existing?.name} className="input" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="s-dur">Duration (min)</label>
              <input id="s-dur" name="durationMinutes" type="number" min={5} required defaultValue={existing?.duration_minutes ?? 30} className="input" />
            </div>
            <div>
              <label className="label" htmlFor="s-price">Price (optional)</label>
              <input id="s-price" name="price" type="number" min={0} step="0.01" defaultValue={existing?.price ?? ""} className="input" />
            </div>
            <div>
              <label className="label" htmlFor="s-buf">Buffer after (min)</label>
              <input id="s-buf" name="bufferMinutes" type="number" min={0} max={120} step={5} defaultValue={existing?.buffer_minutes ?? 0} className="input" />
            </div>
            <div>
              <label className="label" htmlFor="s-cap">Capacity</label>
              <input id="s-cap" name="capacity" type="number" min={1} max={500} defaultValue={existing?.capacity ?? 1} className="input" />
            </div>
          </div>
          {error && <p className="text-sm text-rose-400">{error}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
            <button type="submit" disabled={pending} className="btn-primary">
              {pending ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
