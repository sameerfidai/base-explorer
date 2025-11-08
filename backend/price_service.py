import httpx
from typing import Optional, Dict, Any
from config import get_settings
import logging

logger = logging.getLogger(__name__)
settings = get_settings()


class PriceService:
    """Service for fetching cryptocurrency prices from CoinGecko"""

    def __init__(self):
        self.base_url = settings.coingecko_api_url
        self.client = httpx.AsyncClient(timeout=10.0)

    async def get_eth_price(self) -> Optional[Dict[str, Any]]:
        """Get current ETH price in USD"""
        try:
            url = f"{self.base_url}/simple/price"
            params = {
                "ids": "ethereum",
                "vs_currencies": "usd",
                "include_24hr_change": "true",
                "include_24hr_vol": "true",
            }

            response = await self.client.get(url, params=params)
            response.raise_for_status()
            data = response.json()

            if "ethereum" in data:
                eth_data = data["ethereum"]
                return {
                    "price_usd": eth_data.get("usd"),
                    "change_24h": eth_data.get("usd_24h_change"),
                    "volume_24h": eth_data.get("usd_24h_vol"),
                }
            return None
        except Exception as e:
            logger.error(f"Error fetching ETH price: {str(e)}")
            return None

    async def convert_eth_to_usd(self, eth_amount: float) -> Optional[float]:
        """Convert ETH amount to USD"""
        try:
            price_data = await self.get_eth_price()
            if price_data and price_data.get("price_usd"):
                return eth_amount * price_data["price_usd"]
            return None
        except Exception as e:
            logger.error(f"Error converting ETH to USD: {str(e)}")
            return None

    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()
