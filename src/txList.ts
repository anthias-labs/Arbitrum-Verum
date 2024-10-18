import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.ARBISCAN_API_KEY || "";

export async function getTxList(address: string): Promise<any[]> {
    const url = `https://api.arbiscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${API_KEY}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.status !== "1" || !data.result) {
            throw new Error(`API error! message: ${data.message}`);
        }

        // Procesa las transacciones y obtiene la fecha
        const transactions = data.result;
        return transactions;
    } catch (error) {
        throw new Error("Error trayendo transacctiones")
    }
}
