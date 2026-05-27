export default function WelcomeScreen() {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
      <div className="text-5xl mb-4 animate-bounce">💰</div>
      <h1 className="text-3xl font-bold mb-2">Spendlight</h1>
      <p className="text-gray-400 text-lg">
        Making public spending understandable
      </p>
      <div className="mt-6 flex gap-1">
        <div
          className="w-2 h-2 bg-white rounded-full animate-bounce"
          style={{ animationDelay: "0ms" }}
        />
        <div
          className="w-2 h-2 bg-white rounded-full animate-bounce"
          style={{ animationDelay: "150ms" }}
        />
        <div
          className="w-2 h-2 bg-white rounded-full animate-bounce"
          style={{ animationDelay: "300ms" }}
        />
      </div>
    </div>
  );
}
