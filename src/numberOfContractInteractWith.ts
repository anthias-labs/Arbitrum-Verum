// @ts-nocheck
import fetch from 'node-fetch';
import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.ARBISCAN_API_KEY || "";


async function fetchTransactions(apiKey, walletAddress, txList) {
    let cantidadDeInteraccionConContratos = 0;

    
        // Filtra y procesa las transacciones
        const transactions = txList;
        for (const tx of transactions) {
            if (tx.to && tx.input && tx.input !== '0x') {
                cantidadDeInteraccionConContratos++;
            }
        }
        
        return cantidadDeInteraccionConContratos;
}

export async function numberOfContract(WALLET_ADDRESS, txList) {
    const amt = await fetchTransactions(API_KEY, WALLET_ADDRESS, txList);
    //console.log('Cantidad de interacciones con contratos:', cantidadDeInteraccionConContratos);
    return amt;
}

