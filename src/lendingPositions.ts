import { execute, Account, Position } from "../.graphclient";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.THEGRAPH_API_KEY || "";

const protocols = {
    "compound-v3": "5MjRndNWGhqvNX7chUYLQDnvEgc8DaH8eisEkcJt71SR",
    "aave-v3": "4xyasjQeREe7PxnF6wVdobZvCw5mhoHZq3T7guRpuNPf",
};

const computeHealth = (positions: Position[]) => {
    let totalSupplied = 0;
    let totalAdjustedSupplied = 0;
    let totalBorrowed = 0;

    positions.forEach((p: Position) => {
        const realValue =
            (p.balance / Math.pow(10, p.asset.decimals)) * p.asset.lastPriceUSD;
        if (p.side === "BORROWER") {
            totalBorrowed += realValue;
        } else if (p.side === "COLLATERAL") {
            totalAdjustedSupplied +=
                (realValue * p.market.liquidationThreshold) / 100;
            totalSupplied += realValue;
        }
    });

    const healthFactor = totalAdjustedSupplied / totalBorrowed;

    return healthFactor;
};

const protocolFetcher =
    (subgraph: string) =>
    async (address: string): Promise<Position[]> => {
        const query = `query {
        accounts (where:{id: "${address}"}) {
            id
            positions(where: {balance_gt: 0}) {	
            id
            balance
            side
            market {
                liquidationThreshold
            }
            asset {
                symbol
                lastPriceUSD
                decimals
            }      
            }
        }
        }`;

        const URL = `https://gateway.thegraph.com/api/${API_KEY}/subgraphs/id/${subgraph}`;

        const response = await fetch(URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                query,
            }),
        });

        const data = await response.json();
        const account: Account | undefined = data.data.accounts[0];

        if (account === undefined) {
            return [];
        }

        const positions = account.positions;
        return positions;
    };

export const getLendingHealth = async (address: string) => {
    const fetchers = Object.values(protocols).map(protocolFetcher);
    const positionsList = await Promise.all(fetchers.map((f) => f(address)));
    const positions = positionsList.flat();

    const health = await computeHealth(positions);
    console.log("HEALTH: ", health, positions);
    const rounded = Math.round(health * 100) / 100;
    if (rounded) {
        return rounded;
    } else {
        return 0;
    }
};

const test = async () => {
    const wall = "0x00432d1ff71472449d7c763417f1ee22248815aa";
    const health = await getLendingHealth(wall);
    console.log(health);
};
