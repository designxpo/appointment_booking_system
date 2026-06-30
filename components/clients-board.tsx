"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { createLead, updateLeadStatus } from "@/action/leads";
import { IconSearch, IconPlus } from "@/components/icons";
import type { Lead, LeadStatus } from "@/lib/types";

const STATUSES: LeadStatus[] = ["new", "contacted", "booked", "lost"];
const PILL: Record<LeadStatus, string> = {
  new: "bg-blue-500/15 text-blue-300",
  contacted: "bg-amber-500/15 text-amber-300",
  booked: "bg-emerald-500/15 text-emerald-300",
  lost: "bg-gray-500/20 text-gray-400",
};
const AVATAR = ["bg-indigo-500", "bg-violet-500", "bg-rose-500", "bg-emerald-500", "bg-sky-500"];

export function ClientsBoard({
  leads,
  clientLabel,
  clientPlural,
}: {
  leads: Lead[];
  clientLabel: string;
  clientPlural: string;
}) {
  const [items, setItems] = useState(leads);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(false);
  const [, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        (l.email ?? "").toLowerCase().includes(q) ||
        (l.phone ?? "").includes(q),
    );
  }, [items, query]);

  function setStatus(id: string, status: LeadStatus) {
    setItems((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    startTransition(() => {
      void updateLeadStatus(id, status);
    });
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative max-w-md flex-1">
          <IconSearch className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, phone, or email…"
            className="input pl-9"
          />
        </div>
        <button onClick={() => setModal(true)} className="btn-primary">
          <IconPlus className="h-4 w-4" /> Add {clientLabel}
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-sm text-gray-500">
          No {clientPlural.toLowerCase()} found.
        </p>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((l, i) => (
            <div key={l.id} className="card">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold text-white ${AVATAR[i % AVATAR.length]}`}
                  >
                    {l.name.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <div className="font-semibold text-gray-100">{l.name}</div>
                    <div className="text-xs text-gray-500">
                      Since{" "}
                      {new Date(l.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </div>
                <select
                  value={l.status}
                  onChange={(e) => setStatus(l.id, e.target.value as LeadStatus)}
                  className={`rounded-full border-0 bg-transparent px-2 py-0.5 text-xs font-medium capitalize outline-none ${PILL[l.status]}`}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s} className="bg-ink-raised text-gray-200">
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-4 space-y-1.5 border-t border-ink-border pt-3 text-sm text-gray-400">
                <div>📞 {l.phone ?? "—"}</div>
                <div className="truncate">✉️ {l.email ?? "—"}</div>
                {l.notes && <div className="truncate text-xs text-gray-500">📝 {l.notes}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <AddModal
          clientLabel={clientLabel}
          onClose={() => setModal(false)}
          onAdded={() => setModal(false)}
        />
      )}
    </div>
  );
}

function AddModal({
  clientLabel,
  onClose,
  onAdded,
}: {
  clientLabel: string;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const ref = useRef<HTMLFormElement>(null);

  async function action(formData: FormData) {
    setPending(true);
    setError(null);
    const res = await createLead(formData);
    setPending(false);
    if (res?.error) setError(res.error);
    else {
      ref.current?.reset();
      onAdded();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl border border-ink-border bg-ink-raised p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-bold text-white">
            <span className="page-icon h-8 w-8">
              <IconPlus className="h-4 w-4" />
            </span>
            Add New {clientLabel}
          </h3>
          <button onClick={onClose} aria-label="Close" className="text-gray-500 hover:text-gray-300">
            ✕
          </button>
        </div>
        <form ref={ref} action={action} className="mt-5 space-y-4">
          <div>
            <label className="label" htmlFor="m-name">Full name</label>
            <input id="m-name" name="name" required placeholder="John Smith" className="input" />
          </div>
          <div>
            <label className="label" htmlFor="m-phone">Phone number</label>
            <input id="m-phone" name="phone" placeholder="+1-555-0123" className="input" />
          </div>
          <div>
            <label className="label" htmlFor="m-email">Email (optional)</label>
            <input id="m-email" name="email" type="email" placeholder="client@email.com" className="input" />
          </div>
          <div>
            <label className="label" htmlFor="m-notes">Notes (optional)</label>
            <textarea id="m-notes" name="notes" rows={3} placeholder="Preferences, history…" className="input" />
          </div>
          {error && <p className="text-sm text-rose-400">{error}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
            <button type="submit" disabled={pending} className="btn-primary">
              {pending ? "Adding…" : `Add ${clientLabel}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
