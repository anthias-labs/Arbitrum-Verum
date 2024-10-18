import fetch from "node-fetch";
import { createCache } from "./cache";

const MIN_AMOUNT = 10;
const MaximaCantidadDeTrasaccionesParaSerBot = 100;
let esBot = false;
let cantidadTransacciones;

async function fetchEthPrice(): Promise<number> {
    const url =
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd";

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: any = await response.json();
    const price = data.ethereum.usd;

    return price;
}

const ethPriceCache = createCache("ethPrice", 60 * 60, fetchEthPrice)

async function fetchTransactions(walletAddress: string, txList: any[]) {
    esBot = false;
    const ethPrice = await ethPriceCache();

    let txCount = 0;
    // Filtra y procesa las transacciones con console.log del tipo de transacción

    const filteredTransactions = txList.filter((tx) => {
        const valueEth = tx.value / 10 ** 18;
        const valueUsd = valueEth * ethPrice;

        // Extrae la hora de la transacción
        const txDate: any = new Date(tx.timeStamp * 1000);
        let txDateOld: any;

        if (txCount > MaximaCantidadDeTrasaccionesParaSerBot) {
            txDateOld = new Date(
                txList[txCount - MaximaCantidadDeTrasaccionesParaSerBot]
                    .timeStamp * 1000
            );
        } else {
            txDateOld = new Date(txList[0].timeStamp * 1000);
        }

        if (
            txCount > MaximaCantidadDeTrasaccionesParaSerBot &&
            txDate - txDateOld < 1000 * 60 * 60
        ) {
            esBot = true;
        }
        txCount++;
        return valueUsd > MIN_AMOUNT;
    });

    return filteredTransactions;
}

export async function transaccionesPlus10(
    WALLET_ADDRESS: string,
    txList: any[]
) {
    const transactions = await fetchTransactions(WALLET_ADDRESS, txList);
    // console.log('Cantidad de transacciones mayores a 10 USD:', transactions.length);
    //console.log('Cantidad de transacciones relevantes:', cantidadTransacciones);
    //console.log('Porcentaje de transacciones mayores a  10: ', transactions.length/ cantidadTransacciones*100, "%");
    if (esBot) {
        return -transactions.length;
    }
    return transactions.length;
}
