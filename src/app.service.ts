import { Injectable, Module } from "@nestjs/common";
import { transaccionesPlus10 } from "./transaccion10";
import { daysSinceFirstTransaction } from "./firstInteract";
import { numberOfContract } from "./numberOfContractInteractWith";
import { countPercentageVotes } from "./gobernanza";
import { getLendingHealth } from "./lendingPositions";
import { getAssetBalance } from "./assetAmount";
import { createClient } from "@supabase/supabase-js";
import { scoreInfo } from "./types";
import { computeScoreFC } from "./computeScore";
import { getTxList } from "./txList";

import dotenv from "dotenv";


dotenv.config();

const CACHE_TTL = 360; // 6 hours
const BENCHMARK_TIMES = true; // Poner en true para ver los tiempos de ejecución de cada función

function transformInfo(info: any) {
    return {
        numTrans: info.trans_number,
        porcVotos: info.voting_participation,
        contractNumber: info.contract_interactions,
        timeInPlatform: info.user_time,
        lendingHealth: info.lending_health,
        assetBalance: info.asset_amount,
        VerumScore: info.verumScore,
    };
}

function generateCSV(data: any[]) {
    const columns = Object.keys(data[0]);

    let csv_rows = [];

    csv_rows.push(columns.join(","));

    data.forEach((row) => {
        const values = columns.map((c) => row[c]);
        csv_rows.push(values.join(","));
    });

    return csv_rows.join("\n");
}

@Injectable()
export class AppService {
    private getSupabaseClient() {
        const supabaseUrl = "https://fdjzbnjmmhvfidvnnkxq.supabase.co";
        const supabaseKey = process.env.SUPABASE_KEY || "";
        return createClient(supabaseUrl, supabaseKey);
    }

    private async updateWallet(walletAddress: string, benchmark = false) {
        console.log("running");
        
        const promise_txList = this.benchmarkPromise(
            getTxList(walletAddress),
            "txList",
            benchmark
        )

        const promise_porcVotos = this.benchmarkPromise(
            countPercentageVotes(walletAddress),
            "countPercentageVotes",
            benchmark
        );

        const promise_lendingHealth = this.benchmarkPromise(
            getLendingHealth(walletAddress).then((res: any) => res || 0),
            "getLendingHealth",
            benchmark
        );
        const promise_assetBalance = this.benchmarkPromise(
            getAssetBalance(walletAddress),
            "getAssetBalance",
            benchmark
        );

        const [
            porcVotos,
            lendingHealth,
            assetBalance,
            txList
        ] = await Promise.all([
            promise_porcVotos,
            promise_lendingHealth,
            promise_assetBalance,
            promise_txList
        ]);


        const promise_numTrans = this.benchmarkPromise(
            transaccionesPlus10(walletAddress, txList),
            "transaccionesPlus10",
            benchmark
        );

        const promise_contractNumber = this.benchmarkPromise(
            numberOfContract(walletAddress, txList),
            "numberOfContract",
            benchmark
        );

        const promise_timeInPlatform = this.benchmarkPromise(
            daysSinceFirstTransaction(walletAddress, txList),
            "daysSinceFirstTransaction",
            benchmark
        );

        const [
            numTrans,
            contractNumber,
            timeInPlatform
        ] = await Promise.all([
            promise_numTrans,
            promise_contractNumber,
            promise_timeInPlatform
        ]);

        const VerumScore = await this.benchmarkPromise(
            computeScoreFC({
                created_at: "patito",
                address: walletAddress,
                VerumScore: 0,
                lending_health: lendingHealth,
                voting_participation: porcVotos,
                contract_interactions: contractNumber,
                asset_amount: assetBalance,
                user_time: timeInPlatform,
                trans_number: numTrans,
            }),
            "computeScoreFC",
            benchmark
        );

        return {
            numTrans,
            porcVotos,
            contractNumber,
            timeInPlatform,
            lendingHealth,
            assetBalance,
            VerumScore,
        };
    }

    private benchmarkPromise<T>(
        promise: Promise<T>,
        label: string,
        benchmark: boolean = false
    ): Promise<T> {
        const start = Date.now();

        return promise
            .then((result) => {
                const end = Date.now();
                if (benchmark) console.log(`${label} took ${end - start} ms`);
                return result; // Ensure the result is passed through
            })
            .catch((error) => {
                const end = Date.now();
                console.log(`${label} failed after ${end - start} ms`);
                return {} as T;
            });
    }

    async fetchWalletInfo(walletAddress: string) {
        const supabase = this.getSupabaseClient();
        const { data, error } = await supabase.rpc("fetchinfo", {
            address_search: walletAddress,
        });

        if (error) return error;

        const info: scoreInfo = data[0];

        console.log("db row:", info);

        // checkea que cache sea valido (ultima actualizacion hace menos de CACHE_TTL minutos)
        let minutes = CACHE_TTL + 1;
        if (info) {
            const date = new Date(info.created_at);
            const now = new Date();
            const diff = now.getTime() - date.getTime();
            minutes = Math.floor(diff / 60000);
        }

        if (minutes < CACHE_TTL) {
            const transformedInfo = transformInfo(info);
            console.log(transformedInfo);
            return transformedInfo;
        } else {
            console.log("updating cache");
            const newInfo = await this.updateWallet(
                walletAddress,
                BENCHMARK_TIMES
            );
            console.log(newInfo);

            if (info) {
                await supabase
                    .from("scores")
                    .update({
                        address: walletAddress,
                        verumScore: newInfo.VerumScore,
                        lending_health: newInfo.lendingHealth,
                        voting_participation: newInfo.porcVotos,
                        contract_interactions: newInfo.contractNumber,
                        trans_number: newInfo.numTrans,
                        user_time: newInfo.timeInPlatform,
                        asset_amount: newInfo.assetBalance,
                        created_at: new Date().toISOString(),
                    })
                    .eq("address", walletAddress);
            } else {
                await supabase.from("scores").insert({
                    address: walletAddress,
                    verumScore: newInfo.VerumScore,
                    lending_health: newInfo.lendingHealth,
                    voting_participation: newInfo.porcVotos,
                    contract_interactions: newInfo.contractNumber,
                    trans_number: newInfo.numTrans,
                    user_time: newInfo.timeInPlatform,
                    asset_amount: newInfo.assetBalance,
                });
            }
            return newInfo;
        }
    }

    // app.service.ts

    async fetchTable(
        orderBy: string = "asset_amount",
        order: string = "desc",
        page: number = 1,
        rowsPerPage: number = 30,
        lendingHealth?: string,
        votingParticipation?: string,
        contractInteractions?: string,
        assetAmount?: string,
        userTime?: string,
        transNumber?: string
    ) {
        // Check that order_by is in the list of columns
        const columns = [
            "created_at",
            "address",
            "lending_health",
            "voting_participation",
            "contract_interactions",
            "asset_amount",
            "user_time",
            "trans_number",
            "verumScore",
        ];
        if (!columns.includes(orderBy)) {
            console.error("Invalid column name");
            return;
        }

        // Check that order is either 'asc' or 'desc'
        if (order !== "asc" && order !== "desc") {
            console.error("Invalid order");
            return;
        }

        // Construct the filters
        const filters: any = {};
        if (lendingHealth) filters.lending_health = lendingHealth;
        if (votingParticipation)
            filters.voting_participation = votingParticipation;
        if (contractInteractions)
            filters.contract_interactions = contractInteractions;
        if (assetAmount) filters.asset_amount = assetAmount;
        if (userTime) filters.user_time = userTime;
        if (transNumber) filters.trans_number = transNumber;

        const offset = (page - 1) * rowsPerPage;
        const limit = offset + rowsPerPage - 1; // Calcula el índice final correctamente

        const supabase = this.getSupabaseClient();
        const { data, error } = await supabase
            .from("scores")
            .select("*")
            .match(filters)
            .order(orderBy, { ascending: order === "asc" })
            .range(offset, limit); // Usa `offset` y `limit` correctamente

        if (error) {
            console.error("Error fetching data:", error);
            throw error;
        }

        return data;
    }

    async exportCSV(order_by: string = "verumScore") {
        const EXPORT_AMT = 500;

        const data = await this.fetchTable(order_by, "desc", 1, EXPORT_AMT);
        const csvData: any[] = [];

        data?.forEach((row) => {
            csvData.push({
                address: row.address,
                lending_health: row.lending_health,
                voting_participation: row.voting_participation,
                contract_interactions: row.contract_interactions,
                asset_amount: row.asset_amount,
                user_time: row.user_time,
                transaction_number: Math.abs(row.trans_number),
                verum_score: row.verumScore,
                is_bot: row.trans_number < 0 ? true : false,
            });
        });

        return generateCSV(csvData);
    }
}

@Module({
    imports: [],
    controllers: [],
    providers: [AppService],
})
export class AppModule {}
