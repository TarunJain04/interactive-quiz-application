export default function ErrorBanner({ message, onDismiss }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      <span>{message}</span>
      <button
        onClick={onDismiss}
        className="select-none shrink-0 rounded px-2 py-1 text-red-600 hover:bg-red-100"
      >
        Dismiss
      </button>
    </div>
  );
}


