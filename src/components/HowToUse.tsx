export default function HowToUse() {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-6 mb-6">
      <h2 className="text-base font-semibold text-gray-800 mb-4">
        Three ways to explore this data
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex gap-3">
          <div className="text-2xl">✨</div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Get the story</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Click &quot;Find the story&quot; above and AI will surface the 3
              most newsworthy findings automatically
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="text-2xl">📊</div>
          <div>
            <p className="text-sm font-semibold text-gray-800">
              Explore the charts
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Click any bar, slice, or data point in the charts above and Penny
              will explain it in plain English
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="text-2xl">💬</div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Ask anything</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Type any question below in plain English. No data skills needed.
              Penny will answer instantly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
