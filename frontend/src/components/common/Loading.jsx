export default function Loading({ message = "Loading..." }) {
  return (
    <div className="py-20 flex items-center justify-center">
      <div className="text-center">
        <div
          className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-3"
          style={{
            borderColor: "var(--color-loading-spinner)",
            borderTopColor: "transparent",
          }}
        />
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          {message}
        </p>
      </div>
    </div>
  );
}
