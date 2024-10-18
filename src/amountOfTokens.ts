// @ts-nocheck
import fetch from 'node-fetch';

async function fetchTokenBalances(apiKey, walletAddress) {
  const url = `https://api.etherscan.io/api?module=account&action=tokenlist&address=${walletAddress}&apikey=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: any = await response.json();

    // Verificar si la respuesta tiene status "0" (NOTOK)
    if (data.status === "0" || !data.result) {
      throw new Error(`API error! message: ${data.message}`);
    }

    return data.result.length; // Cantidad de tokens que posee la dirección
  } catch (error) {
    console.error('Error al obtener la cantidad de tokens:', error);
    // You can return a specific error code or a different value to indicate failure
    return -1;
  }
}