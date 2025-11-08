import { useEffect, useState } from "react";
import {
  apiService,
  type NetworkInfo as NetworkInfoType,
} from "../services/api";

export default function NetworkInfo() {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfoType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNetworkInfo = async () => {
      try {
        const data = await apiService.getNetworkInfo();
        setNetworkInfo(data);
        setError(null);
      } catch (err) {
        setError("Failed to fetch network info");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNetworkInfo();
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 animate-pulse">
        <div className="h-8 bg-gray-700 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
      </div>
    );
  }

  if (error || !networkInfo) {
    return (
      <div className="bg-red-900/20 border border-red-500 rounded-lg p-6">
        <p className="text-red-400">{error || "Failed to load network info"}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-blue-400">
        {networkInfo.network}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <p className="text-gray-400 text-sm">Block Height</p>
          <p className="text-xl font-semibold">
            {networkInfo.block_number.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Gas Price</p>
          <p className="text-xl font-semibold">
            {parseFloat(networkInfo.gas_price_gwei).toFixed(6)} gwei
          </p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">ETH Price</p>
          <p className="text-xl font-semibold">
            $
            {networkInfo.eth_price?.price_usd.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
            {networkInfo.eth_price && (
              <span
                className={`text-sm ml-2 ${
                  networkInfo.eth_price.change_24h >= 0
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {networkInfo.eth_price.change_24h >= 0 ? "+" : ""}
                {networkInfo.eth_price.change_24h.toFixed(2)}%
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
