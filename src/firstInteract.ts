// @ts-nocheck
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.ARBISCAN_API_KEY || "";

async function fetchTransactions(apiKey, walletAddress, txList) {
    const transactions = txList.map((tx) => {
        const date = new Date(tx.timeStamp * 1000); // Convert timestamp to date
        return {
            hash: tx.hash,
            date: date.toLocaleString(), // Convert date to a readable string
            month: `${date.getFullYear()}-${date.getMonth() + 1}`, // Year-Month format
            timeStamp: tx.timeStamp, // Keep the original timestamp for sorting
        };
    });

    return transactions;
}

export async function interact(WALLET_ADDRESS, txList) {
    const transactions = await fetchTransactions(API_KEY, WALLET_ADDRESS, txList);
    if (!transactions.length) {
        console.error(
            "No se encontraron transacciones o ocurrió un error al obtener las transacciones."
        );
        return null;
    }

    // Encuentra la fecha de la primera transacción
    const firstTransaction = transactions.reduce((prev, current) =>
        prev.timeStamp < current.timeStamp ? prev : current
    );

    return firstTransaction.date;
}

export const daysSinceFirstTransaction = async (walletAddress, txList) => {
    const fecha = await interact(walletAddress, txList);
    if (!fecha) {
        return 0;
    }
    console.log(fecha);
    // Convertir la fecha obtenida a un objeto Date
    const [month, day, yearM] = fecha.split("/");
    const year = yearM.split(" ")[0].slice(0, -1);
    console.log(day, month, year);
    const fechaPrimeraTransaccion = new Date(year, month - 1, day);

    const fechaActual = new Date();

    console.log(fechaActual, fechaPrimeraTransaccion);
    const diferenciaEnMilisegundos = fechaActual - fechaPrimeraTransaccion;

    // Convertir la diferencia de milisegundos a días
    const dias = Math.floor(diferenciaEnMilisegundos / (1000 * 60 * 60 * 24));

    return dias;
};

function convertirFecha(fecha) {
    const [fechaPart, horaPart] = fecha.split(", ");
    const [mes, dia, año] = fechaPart.split("/").map(Number);

    const fechaISO = new Date(
        año,
        mes - 1,
        dia,
        ...horaPart.split(":").slice(0, -1)
    ).toISOString();
    return fechaISO;
}

async function main() {
    try {
        const result = await daysSinceFirstTransaction(
            "0x6A3cdf78DAB07B88A5293a1f04986c30DD24Aa79"
        );
        console.log(result);
    } catch (error) {
        console.error("Error interacting with the address:", error);
    }
}

// main();
