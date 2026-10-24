export default function Error({
  message = "Something went wrong",
  action = "Close",
  callback,
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-sm p-8 text-center">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
          <span className="text-xl text-red-600">!</span>
        </div>

        <h2 className="text-xl font-semibold text-slate-900">
          Something went wrong
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">{message}</p>

        <button
          onClick={callback}
          className="select-none mt-6 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          {action}
        </button>
      </div>
    </div>
  );
}
