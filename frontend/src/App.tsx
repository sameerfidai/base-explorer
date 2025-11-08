import NetworkInfo from "./components/NetworkInfo";
import AddressSearch from "./components/AddressSearch";

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold">Base Explorer</h1>
              <p className="text-sm text-gray-400">
                Coinbase's Layer 2 Blockchain Explorer
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="grow max-w-7xl w-full mx-auto px-4 py-8 space-y-8">
        <NetworkInfo />

        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-blue-400">
            Search Address or Transaction
          </h2>
          <AddressSearch />
        </div>
      </main>

      <footer className="bg-gray-800 border-t border-gray-700 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-400 text-sm">
          <p>Built with FastAPI, React, and TypeScript</p>
          <p className="mt-1">Connected to Base Mainnet via Alchemy</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
