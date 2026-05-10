"use client";

import React, { ReactNode } from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { ConnectionProvider } from "@solana/wallet-adapter-react";
import { clusterApiUrl } from "@solana/web3.js";

interface AjoProviderProps {
  children: ReactNode;
}

export function AjoProvider({ children }: AjoProviderProps) {
  const endpoint = clusterApiUrl("devnet");

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || "clz...example"} 
      config={{
        loginMethods: ["sms", "google", "apple", "email"],
        appearance: {
          theme: "dark",
          accentColor: "#d4af37", // Ajo Gold
          showWalletLoginFirst: false,
        },
        embeddedWallets: {
          solana: {
            createOnLogin: "users-without-wallets",
          },
        },
      }}
    >
      <ConnectionProvider endpoint={endpoint}>
        {children}
      </ConnectionProvider>
    </PrivyProvider>
  );
}
