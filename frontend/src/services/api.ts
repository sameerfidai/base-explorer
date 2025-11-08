import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://base-explorer-backend.onrender.com";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 2 mins for blockchain calls
});

export interface NetworkInfo {
  network: string;
  chain_id: number;
  block_number: number;
  block_timestamp: number;
  gas_price_wei: string;
  gas_price_gwei: string;
  is_connected: boolean;
  eth_price?: {
    price_usd: number;
    change_24h: number;
    volume_24h: number;
  };
}

export interface AddressBalance {
  address: string;
  balance_wei: string;
  balance_eth: string;
  balance_usd: number | null;
  network: string;
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value_eth: string;
  value_usd?: number;
  block_number: number;
  timestamp: number;
  gas_price_gwei: string;
}

export interface TransactionDetails extends Transaction {
  value_wei: string;
  gas: number;
  gas_price_wei: string;
  nonce: number;
  status: number | null;
  gas_used: number | null;
}

export const apiService = {
  // Get network information
  getNetworkInfo: async (): Promise<NetworkInfo> => {
    const response = await api.get("/api/network");
    return response.data;
  },

  // Get address balance
  getAddressBalance: async (address: string): Promise<AddressBalance> => {
    const response = await api.get(`/api/address/${address}`);
    return response.data;
  },

  // Get address transactions
  getAddressTransactions: async (
    address: string,
    limit: number = 10
  ): Promise<{
    address: string;
    count: number;
    transactions: Transaction[];
  }> => {
    const response = await api.get(`/api/address/${address}/transactions`, {
      params: { limit },
    });
    return response.data;
  },

  // Get transaction details
  getTransaction: async (txHash: string): Promise<TransactionDetails> => {
    const response = await api.get(`/api/transaction/${txHash}`);
    return response.data;
  },

  // Get ETH price
  getEthPrice: async (): Promise<{
    price_usd: number;
    change_24h: number;
    volume_24h: number;
  }> => {
    const response = await api.get("/api/price/eth");
    return response.data;
  },
};
