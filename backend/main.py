from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from typing import Optional
import logging

from config import get_settings
from blockchain_service import BlockchainService
from price_service import PriceService

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

settings = get_settings()

# Global service instances
blockchain_service: Optional[BlockchainService] = None
price_service: Optional[PriceService] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    global blockchain_service, price_service

    # Startup
    logger.info("Starting Base Explorer API...")
    blockchain_service = BlockchainService(use_testnet=False)
    price_service = PriceService()
    logger.info("Services initialized successfully")

    yield

    # Shutdown
    logger.info("Shutting down Base Explorer API...")
    await price_service.close()


app = FastAPI(
    title="Base Explorer API",
    description="A blockchain explorer API for Coinbase's Base network",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Base Explorer API", "version": "1.0.0", "docs": "/docs"}


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    network_info = blockchain_service.get_network_info()
    return {
        "status": "healthy",
        "blockchain_connected": network_info.get("is_connected", False),
        "network": network_info.get("network"),
    }


@app.get("/api/address/{address}")
async def get_address_info(address: str):
    """Get balance and information for an address"""
    balance_data = blockchain_service.get_balance(address)

    if not balance_data:
        raise HTTPException(
            status_code=400, detail="Invalid address or error fetching data"
        )

    # Get USD value
    eth_amount = float(balance_data["balance_eth"])
    usd_value = await price_service.convert_eth_to_usd(eth_amount)

    return {**balance_data, "balance_usd": usd_value}


@app.get("/api/transaction/{tx_hash}")
async def get_transaction(tx_hash: str):
    """Get transaction details by hash"""
    tx_data = blockchain_service.get_transaction(tx_hash)

    if not tx_data:
        raise HTTPException(status_code=404, detail="Transaction not found")

    # Add USD value
    eth_amount = float(tx_data["value_eth"])
    usd_value = await price_service.convert_eth_to_usd(eth_amount)

    return {**tx_data, "value_usd": usd_value}


@app.get("/api/network")
async def get_network_info():
    """Get current network information"""
    network_info = blockchain_service.get_network_info()
    eth_price = await price_service.get_eth_price()

    return {**network_info, "eth_price": eth_price}


@app.get("/api/price/eth")
async def get_eth_price():
    """Get current ETH price"""
    price_data = await price_service.get_eth_price()

    if not price_data:
        raise HTTPException(status_code=503, detail="Unable to fetch price data")

    return price_data


@app.get("/api/address/{address}/transactions")
async def get_address_transactions(
    address: str,
    limit: int = Query(
        default=10, ge=1, le=100, description="Number of transactions to fetch"
    ),
):
    """Get recent transactions for an address"""
    transactions = blockchain_service.get_recent_transactions(address, limit)

    # Add USD values to transactions
    eth_price_data = await price_service.get_eth_price()
    eth_price = eth_price_data.get("price_usd") if eth_price_data else None

    for tx in transactions:
        if eth_price:
            eth_value = float(tx["value_eth"])
            tx["value_usd"] = eth_value * eth_price

    return {
        "address": address,
        "count": len(transactions),
        "transactions": transactions,
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host=settings.host, port=settings.port, reload=True)
