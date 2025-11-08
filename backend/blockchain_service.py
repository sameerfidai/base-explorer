from web3 import Web3
from web3.exceptions import Web3Exception
from typing import Optional, Dict, Any, List
from config import get_settings
import logging

logger = logging.getLogger(__name__)
settings = get_settings()


class BlockchainService:
    """Service for interacting with Base blockchain via Web3"""

    def __init__(self, use_testnet: bool = False):
        rpc_url = (
            settings.base_testnet_rpc_url if use_testnet else settings.base_rpc_url
        )
        self.w3 = Web3(Web3.HTTPProvider(rpc_url))
        self.network = "Base Sepolia Testnet" if use_testnet else "Base Mainnet"

        if not self.w3.is_connected():
            logger.error(f"Failed to connect to {self.network}")
            raise ConnectionError(f"Could not connect to {self.network}")

        logger.info(f"Connected to {self.network}")

    def get_balance(self, address: str) -> Optional[Dict[str, Any]]:
        """Get ETH balance for an address"""
        try:
            if not self.w3.is_address(address):
                return None

            checksum_address = self.w3.to_checksum_address(address)
            balance_wei = self.w3.eth.get_balance(checksum_address)
            balance_eth = self.w3.from_wei(balance_wei, "ether")

            return {
                "address": checksum_address,
                "balance_wei": str(balance_wei),
                "balance_eth": str(balance_eth),
                "network": self.network,
            }
        except Web3Exception as e:
            logger.error(f"Error getting balance for {address}: {str(e)}")
            return None

    def get_transaction(self, tx_hash: str) -> Optional[Dict[str, Any]]:
        """Get transaction details by hash"""
        try:
            tx = self.w3.eth.get_transaction(tx_hash)
            receipt = self.w3.eth.get_transaction_receipt(tx_hash)

            return {
                "hash": tx_hash,
                "from": tx["from"],
                "to": tx["to"],
                "value_wei": str(tx["value"]),
                "value_eth": str(self.w3.from_wei(tx["value"], "ether")),
                "gas": tx["gas"],
                "gas_price_wei": str(tx["gasPrice"]),
                "gas_price_gwei": str(self.w3.from_wei(tx["gasPrice"], "gwei")),
                "nonce": tx["nonce"],
                "block_number": tx["blockNumber"],
                "status": receipt["status"] if receipt else None,
                "gas_used": receipt["gasUsed"] if receipt else None,
            }
        except Exception as e:
            logger.error(f"Error getting transaction {tx_hash}: {str(e)}")
            return None

    def get_recent_transactions(
        self, address: str, limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Get recent transactions for an address
        Note: This scans recent blocks. For production, use Basescan API
        """
        try:
            if not self.w3.is_address(address):
                return []

            checksum_address = self.w3.to_checksum_address(address)
            current_block = self.w3.eth.block_number
            transactions = []

            # Scan last 1000 blocks (adjust based on needs)
            blocks_to_scan = min(1000, current_block)

            logger.info(f"Scanning last {blocks_to_scan} blocks for {checksum_address}")

            for i in range(current_block, current_block - blocks_to_scan, -1):
                if len(transactions) >= limit:
                    break

                try:
                    block = self.w3.eth.get_block(i, full_transactions=True)
                    for tx in block["transactions"]:
                        if (
                            tx["from"] == checksum_address
                            or tx["to"] == checksum_address
                        ):
                            transactions.append(
                                {
                                    "hash": tx["hash"].hex(),
                                    "from": tx["from"],
                                    "to": tx["to"],
                                    "value_wei": str(tx["value"]),
                                    "value_eth": str(
                                        self.w3.from_wei(tx["value"], "ether")
                                    ),
                                    "block_number": tx["blockNumber"],
                                    "timestamp": block["timestamp"],
                                    "gas_price_gwei": str(
                                        self.w3.from_wei(tx["gasPrice"], "gwei")
                                    ),
                                }
                            )

                            if len(transactions) >= limit:
                                break
                except Exception as e:
                    logger.warning(f"Error scanning block {i}: {str(e)}")
                    continue

            logger.info(
                f"Found {len(transactions)} transactions for {checksum_address}"
            )
            return transactions
        except Exception as e:
            logger.error(f"Error getting recent transactions for {address}: {str(e)}")
            return []

    def get_network_info(self) -> Dict[str, Any]:
        """Get current network information"""
        try:
            latest_block = self.w3.eth.get_block("latest")
            gas_price = self.w3.eth.gas_price

            return {
                "network": self.network,
                "chain_id": self.w3.eth.chain_id,
                "block_number": latest_block["number"],
                "block_timestamp": latest_block["timestamp"],
                "gas_price_wei": str(gas_price),
                "gas_price_gwei": str(self.w3.from_wei(gas_price, "gwei")),
                "is_connected": self.w3.is_connected(),
            }
        except Exception as e:
            logger.error(f"Error getting network info: {str(e)}")
            return {"network": self.network, "is_connected": False, "error": str(e)}
