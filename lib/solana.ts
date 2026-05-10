import {
  Connection,
  PublicKey,
  Keypair,
} from "@solana/web3.js";
import * as anchor from '@coral-xyz/anchor';
import bs58 from 'bs58';

// Fix for Anchor 0.30+ import issues
const Wallet = (anchor as any).Wallet || (anchor as any).default?.Wallet;

// This ID must match your Anchor.toml and lib.rs
const PROGRAM_ID = new PublicKey(
  "8WazH2EKrEzrwWwzh4KABve62CtQqKzR25WPa9WDbF3g",
);

export const connection = new Connection(
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com",
  "confirmed",
);

/**
 * Derives the PDA for a given trader's Ajo profile.
 */
export function getTraderProfilePDA(
  traderPubkey: PublicKey,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("profile"), traderPubkey.toBuffer()],
    PROGRAM_ID,
  );
}

/**
 * Calls the Anchor program to update the score on-chain.
 * Requires ORACLE_PRIVATE_KEY in .env (Base58 format)
 */
export async function updateScoreOnChain(
  traderAddress: string,
  score: number,
  consistency: number,
  revenueTrend: number,
  expenseDiscipline: number,
) {
  const secretKey = process.env.ORACLE_PRIVATE_KEY;
  
  if (!secretKey) {
    console.log(`[Mock] No Oracle Key found. Mocking score update for ${traderAddress}`);
    return "mock_sig_" + Math.random().toString(36).slice(2);
  }

  try {
    // 1. Load the backend wallet (Oracle)
    const wallet = Keypair.fromSecretKey(bs58.decode(secretKey));
    
    // Safety check for Wallet constructor
    if (!Wallet) {
      throw new Error("Anchor Wallet class not found. Check your @coral-xyz/anchor version.");
    }
    
    const provider = new anchor.AnchorProvider(connection, new Wallet(wallet), {});
    
    // 2. Load the IDL (Interface Definition Language)
    const idl = await anchor.Program.fetchIdl(PROGRAM_ID, provider);
    if (!idl) throw new Error("IDL not found on-chain. Did you deploy?");
    
    const program = new anchor.Program(idl as any, provider);

    // 3. Execute the on-chain update
    return await program.methods
      .updateScore(score, consistency, revenueTrend, expenseDiscipline)
      .accounts({
        traderProfile: getTraderProfilePDA(new PublicKey(traderAddress))[0],
        oracle: wallet.publicKey,
      } as any)
      .rpc();
  } catch (err) {
    console.error("Failed to update score on-chain:", err);
    return null;
  }
}
