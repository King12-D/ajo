import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  Keypair,
} from "@solana/web3.js";
// import * as anchor from '@coral-xyz/anchor'
// import { Ajo } from '@/target/types/ajo' // Auto-generated after `anchor build`

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
 * Calls the Anchor program to update the score on-chain (Oracle behavior).
 * In production, the backend signs this tx.
 */
export async function updateScoreOnChain(
  traderAddress: string,
  score: number,
  consistency: number,
  revenueTrend: number,
  expenseDiscipline: number,
) {
  // Initialize anchor provider with backend wallet
  // const wallet = new anchor.Wallet(Keypair.fromSecretKey(...))
  // const provider = new anchor.AnchorProvider(connection, wallet, {})
  // const program = new anchor.Program(idl, PROGRAM_ID, provider)

  // return await program.methods
  //   .updateScore(score, consistency, revenueTrend, expenseDiscipline)
  //   .accounts({
  //     traderProfile: getTraderProfilePDA(new PublicKey(traderAddress))[0],
  //     oracle: wallet.publicKey,
  //   })
  //   .rpc()

  console.log(
    `[Mock] Updating on-chain score for ${traderAddress} to ${score}`,
  );
  return "mock_tx_signature";
}
