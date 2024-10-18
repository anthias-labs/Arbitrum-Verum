import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.DUNE_API_KEY || "";

async function fetchTokenBalance(apiKey: string, walletAddress: string) {
    // add accept json
    const options = {
        headers: { "X-Dune-Api-Key": apiKey },
        Accept: "application/json",
        compress: false
    };

    const resp = await fetch(
        `https://api.dune.com/api/beta/balance/${walletAddress}?chain_ids=42161`,
        options
    );

    const data: any = await resp.json();
    
    if (!data || !data.balances) {
        return 0;
    }

    let total = 0;
    data.balances.forEach((balance: any) => {
        if (balance.value_usd > 0) {
            total += balance.value_usd;
        }
    })

    return total;
}

export async function getAssetBalance(WALLET_ADDRESS: string) {
    const balance = await fetchTokenBalance(API_KEY, WALLET_ADDRESS);
    return balance;
}

