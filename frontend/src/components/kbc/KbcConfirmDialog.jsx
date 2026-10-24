import { createPortal } from "react-dom";

export default function KbcConfirmDialog({ title, message, confirmLabel, busy = false, onCancel, onConfirm }) {
  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/80 px-4 py-8 backdrop-blur"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onCancel();
      }}
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="kbc-confirm-title"
        aria-describedby="kbc-confirm-message"
        className="w-full max-w-md rounded-2xl border border-[#4164a2] bg-[#10234a] p-6 shadow-2xl"
      >
        <h2 id="kbc-confirm-title" className="text-lg font-bold text-white">
          {title}
        </h2>
        <p id="kbc-confirm-message" className="mt-2 text-sm leading-6 text-[#d9e7ff]">
          {message}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-lg border border-[#4164a2] px-4 py-2 text-sm font-semibold text-[#d9e7ff] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="rounded-lg bg-[#ffd23f] px-4 py-2 text-sm font-semibold text-[#101d3c] disabled:opacity-50"
          >
            {busy ? "Please wait…" : confirmLabel}
          </button>
        </div>
      </section>
    </div>,
    document.body,
  );
}
