import dotenv from 'dotenv';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Configurar dotenv para leer las variables de entorno desde el archivo .env
dotenv.config();

// Función para obtener el cliente de Supabase
function getSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl) {
    throw new Error('SUPABASE_URL is required.');
  }

  if (!supabaseKey) {
    throw new Error('SUPABASE_KEY is required.');
  }

  return createClient(supabaseUrl, supabaseKey);
}

// Definir el tipo de datos que devuelve la función RPC
interface WalletInfo {
  created_at: string;
  address: string;
  verumScore: number;
  lending_health: number;
  voting_participation: number;
  contract_interactions: number;
  asset_amount: number;
  user_time: number;
}

// Función para obtener la tabla
async function fetchTable(order_by: string = 'asset_amount', order: string = 'desc'): Promise<WalletInfo[] | void> {
  const columns = [
    'created_at',
    'address',
    'verumScore',
    'lending_health',
    'voting_participation',
    'contract_interactions',
    'asset_amount',
    'user_time',
  ];

  if (!columns.includes(order_by)) {
    console.error('Invalid column name');
    return;
  }

  if (order !== 'asc' && order !== 'desc') {
    console.error('Invalid order');
    return;
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc('fetchtable', {
    col: order_by,
    ord: order,
  });

  if (error) {
    console.error('Error fetching table:', error);
    return;
  }

  return data;
}

// Función principal para ejecutar la lógica
async function main() {
  const tableData = await fetchTable();

  if (tableData) {
    tableData.forEach((wallet: WalletInfo) => {
      console.log(`Address: ${wallet.address}, VerumScore: ${wallet.verumScore}`);
    });
  } else {
    console.log('No data fetched');
  }
}

// Ejecutar la función principal
main();
