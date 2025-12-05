# Base Explorer

**Live Demo:** [base-explorer.vercel.app](https://base-explorer.vercel.app)

A full-stack blockchain transaction explorer for Coinbase's Base network. Search addresses, view transaction histories, and explore block data in real-time.

## Features

- Transaction lookup by hash
- Address balance and transaction history
- Block explorer with detailed block data
- Real-time blockchain data via Base network RPC

## Tech Stack

**Backend:**
- Python FastAPI
- Base network RPC integration

**Frontend:**
- React
- TypeScript

## Architecture
```
base-explorer/
├── backend/     # FastAPI server handling RPC calls
└── frontend/    # React UI for blockchain data visualization
```

## Local Development

### Backend
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### Frontend
```bash
cd frontend
npm install
npm start
```
