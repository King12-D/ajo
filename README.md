# 💰 Ajo: Verified Financial Identity on Solana

Ajo is a high-fidelity, mobile-first "Financial Identity" platform designed to bridge the gap between informal traders and institutional lenders. By leveraging **Voice AI** and **Solana Smart Contracts**, Ajo allows traders to build a verifiable credit-like score (the Ajo Score) simply by speaking their daily revenue into the app.

![Ajo Preview](https://img.shields.io/badge/Status-Mainnet--Ready-green?style=for-the-badge&logo=solana)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=for-the-badge&logo=prisma)
![Anchor](https://img.shields.io/badge/Anchor-Rust-FF9900?style=for-the-badge&logo=rust)

---

## 🌟 Key Features

### 🎙️ For Traders: "Speak Your Day"
*   **Voice-First Accounting:** Record daily revenue and expenses via voice notes.
*   **AI Extraction:** Automatically extracts financial data from audio using **ElevenLabs** (Transcribe) and **Claude 3** (Data Extraction).
*   **Ajo Score (300-850):** A dynamic financial identity score calculated on-chain based on consistency, revenue trends, and expense discipline.
*   **30-Day Activity Feed:** A sleek, glassmorphic dashboard tracking every transaction with real-time status updates.

### 🏦 For Lenders: "Data-Driven Underwriting"
*   **Trader Search:** Search for any trader's financial identity via their Solana wallet address.
*   **Proof of Revenue:** View verified 30-day revenue charts and consistency metrics.
*   **X402 Payment Gate:** Securely unlock a trader's full score breakdown by sending **0.01 SOL** directly to the trader via the Ajo smart contract.

---

## 🛠️ Tech Stack

*   **Frontend:** Next.js 15 (App Router), Tailwind CSS, Shadcn/UI, Recharts.
*   **Backend:** Next.js API Routes, Prisma ORM (PostgreSQL/Neon).
*   **Web3:** Anchor Framework (Rust), Solana Web3.js, Wallet Adapter.
*   **AI:** ElevenLabs STT (Transcription), Anthropic Claude (Financial Entity Extraction).

---

## 📂 Project Structure

```text
ajo/
├── app/                  # Next.js App Router (Trader & Lender UI)
│   ├── api/              # Full-stack API Endpoints
│   │   ├── transcribe/   # Voice-to-Text conversion
│   │   ├── extract/      # AI data extraction from text
│   │   ├── score/        # Ajo Score calculation engine
│   │   └── query/        # x402 on-chain payment logic
├── programs/             # Anchor/Solana Smart Contracts (Rust)
│   └── ajo/src/lib.rs    # Trader Profile PDA & Payment Logic
├── components/           # Premium Glassmorphic UI Components
├── lib/                  # Shared utilities (Prisma, Solana, Scoring)
└── prisma/               # Database Schema (Trader & DailyEntry)
```

---

## 🚀 Getting Started

### 1. Prerequisites
*   Node.js (v18+)
*   Rust & Solana CLI (for smart contract builds)
*   Anchor Framework

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/ajo.git
cd ajo

# Install dependencies
pnpm install
```

### 3. Environment Setup
Create a `.env` file in the root:
```env
DATABASE_URL="your-postgresql-url"
ANTHROPIC_API_KEY="your-claude-key"
ELEVENLABS_API_KEY="your-elevenlabs-key"
NEXT_PUBLIC_SOLANA_RPC_URL="https://api.devnet.solana.com"
```

### 4. Database & Smart Contract
```bash
# Push database schema
npx prisma db push

# Build smart contract
anchor build
```

---

## 🛡️ Smart Contract Functionality
The Ajo Anchor program manages:
*   **`init_trader`**: Derives a PDA for each trader's unique identity.
*   **`update_score`**: An Oracle endpoint for committing Web2-analyzed scores to the blockchain.
*   **`query_score_payment`**: Handles the direct SOL transfer from Lender to Trader to unlock data.

---

## 🎨 Design Philosophy
Ajo uses a **Fintech-Premium** aesthetic:
*   **Colors:** Dark Forest Green (`#0a1a12`) & Royal Gold (`#d4af37`).
*   **Effects:** Glassmorphism, golden shimmer animations, and animated circular progress rings.
*   **Typography:** Modern sans-serif (Inter/Geist) for a clean, banking-grade feel.

---

## 📜 License
MIT License. Created by King Dav.
