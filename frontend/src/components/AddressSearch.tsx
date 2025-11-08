import { useState } from "react";
import {
  apiService,
  type AddressBalance,
  type Transaction,
  type TransactionDetails,
} from "../services/api";

interface AddressSearchProps {
  onSearch?: () => void;
}

export default function AddressSearch({ onSearch }: AddressSearchProps) {
  const [searchInput, setSearchInput] = useState("");

  // Results state
  const [balance, setBalance] = useState<AddressBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionDetails, setTransactionDetails] =
    useState<TransactionDetails | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    setLoading(true);
    setError(null);

    // Clear previous results
    setBalance(null);
    setTransactions([]);
    setTransactionDetails(null);

    try {
      // Try as transaction hash first
      try {
        const txDetails = await apiService.getTransaction(searchInput);
        setTransactionDetails(txDetails);
        onSearch?.();
        setLoading(false);
        return;
      } catch (txError) {
        // Not a transaction, try as address
      }

      // If not a transaction, treat as address
      const [balanceData, txData] = await Promise.all([
        apiService.getAddressBalance(searchInput),
        apiService.getAddressTransactions(searchInput, 5),
      ]);

      setBalance(balanceData);
      setTransactions(txData.transactions);
      onSearch?.();
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          "Failed to fetch data. Please check the input."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="space-y-4">
        <div>
          <label
            htmlFor="searchInput"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Search Address or Transaction Hash
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              id="searchInput"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="0x... (address or transaction hash)"
              className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {transactionDetails && (
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-blue-400">
              Transaction Details
            </h3>
            <span
              className={`px-3 py-1 rounded text-sm font-semibold ${
                transactionDetails.status === 1
                  ? "bg-green-900/30 text-green-400 border border-green-500"
                  : "bg-red-900/30 text-red-400 border border-red-500"
              }`}
            >
              {transactionDetails.status === 1 ? "✓ Success" : "✗ Failed"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-400 mb-1">Transaction Hash</p>
              <p className="font-mono text-sm break-all">
                {transactionDetails.hash}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-400 mb-1">Block Number</p>
              <p className="font-mono">
                {transactionDetails.block_number.toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-400 mb-1">From</p>
              <p className="font-mono text-sm break-all">
                {transactionDetails.from}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-400 mb-1">To</p>
              <p className="font-mono text-sm break-all">
                {transactionDetails.to}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-400 mb-1">Value</p>
              <p className="text-lg font-bold">
                {parseFloat(transactionDetails.value_eth).toFixed(6)} ETH
              </p>
              <p className="text-sm text-green-400">
                ${transactionDetails.value_usd?.toFixed(2) || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-400 mb-1">Gas Used / Limit</p>
              <p className="font-mono">
                {transactionDetails.gas_used?.toLocaleString()} /{" "}
                {transactionDetails.gas.toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-400 mb-1">Gas Price</p>
              <p className="font-mono">
                {parseFloat(transactionDetails.gas_price_gwei).toFixed(6)} gwei
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-400 mb-1">Nonce</p>
              <p className="font-mono">{transactionDetails.nonce}</p>
            </div>
          </div>
        </div>
      )}

      {balance && (
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h3 className="text-xl font-bold mb-4 text-blue-400">
            Address Balance
          </h3>
          <div className="space-y-2">
            <p className="text-sm text-gray-400">Address</p>
            <p className="font-mono text-sm break-all">{balance.address}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-gray-400 text-sm">ETH Balance</p>
                <p className="text-2xl font-bold">
                  {parseFloat(balance.balance_eth).toFixed(6)} ETH
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">USD Value</p>
                <p className="text-2xl font-bold text-green-400">
                  $
                  {balance.balance_usd?.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }) || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {transactions.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h3 className="text-xl font-bold mb-4 text-blue-400">
            Recent Transactions ({transactions.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-2 text-gray-400 font-medium">
                    Hash
                  </th>
                  <th className="text-left py-3 px-2 text-gray-400 font-medium">
                    From
                  </th>
                  <th className="text-left py-3 px-2 text-gray-400 font-medium">
                    To
                  </th>
                  <th className="text-right py-3 px-2 text-gray-400 font-medium">
                    Value (ETH)
                  </th>
                  <th className="text-right py-3 px-2 text-gray-400 font-medium">
                    Value (USD)
                  </th>
                  <th className="text-right py-3 px-2 text-gray-400 font-medium">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr
                    key={tx.hash}
                    className="border-b border-gray-700 hover:bg-gray-750"
                  >
                    <td className="py-3 px-2 font-mono text-blue-400">
                      {shortenAddress(tx.hash)}
                    </td>
                    <td className="py-3 px-2 font-mono text-xs">
                      {shortenAddress(tx.from)}
                    </td>
                    <td className="py-3 px-2 font-mono text-xs">
                      {shortenAddress(tx.to)}
                    </td>
                    <td className="py-3 px-2 text-right">
                      {parseFloat(tx.value_eth).toFixed(6)}
                    </td>
                    <td className="py-3 px-2 text-right text-green-400">
                      ${tx.value_usd?.toFixed(2) || "N/A"}
                    </td>
                    <td className="py-3 px-2 text-right text-xs text-gray-400">
                      {formatTimestamp(tx.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
