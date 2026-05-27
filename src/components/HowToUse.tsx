export default function HowToUse() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold">
          2
        </div>
        <h2 className="text-lg font-bold text-gray-800">
          Three ways to explore this data
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <div className="text-2xl mb-2">📊</div>
          <h3 className="text-sm font-bold text-gray-800 mb-1">Click the charts</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Below you&apos;ll see 4 chart views. Click any bar, slice, or data
            point and Penny will appear and explain exactly what that number
            means in plain English — no interpretation needed from you.
          </p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
          <div className="text-2xl mb-2">💬</div>
          <h3 className="text-sm font-bold text-gray-800 mb-1">Ask any question</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Scroll down to the chat box and type any question in plain English.
            Try &quot;Why does healthcare get so much money?&quot; or &quot;Which
            companies got paid the most?&quot; — AI will answer instantly using
            the real data.
          </p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
          <div className="text-2xl mb-2">🤖</div>
          <h3 className="text-sm font-bold text-gray-800 mb-1">Ask Penny directly</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            See the cartoon character in the bottom right? That&apos;s Penny,
            your personal spending guide. Click her anytime for help, or
            she&apos;ll automatically explain whatever you click on in the charts.
          </p>
        </div>
      </div>
    </div>
  );
}
