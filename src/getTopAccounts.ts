import fetch from "node-fetch";
import { AppService } from "./app.service";

import fs from "fs";

const PAGES = 10;

const getTopAccounts = async (page: number = 1) => {
    const res = await fetch(`https://arbiscan.io/accounts/${page}?ps=100`, {
        headers: {
            "User-Agent":
                "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:129.0) Gecko/20100101 Firefox/129.0",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/png,image/svg+xml,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            Referer: "https://arbiscan.io/accounts/3?ps=100",
            Connection: "keep-alive",
            "Upgrade-Insecure-Requests": "1",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "same-origin",
            "Sec-Fetch-User": "?1",
            Priority: "u=0, i",
        },
    });
    const html = await res.text();
    // grep line containing `quickExportAccountsData`
    const regex = /quickExportAccountsData = (.*);/;
    const match = html.match(regex);
    const json = match?.[1].slice(1, -1);
    const data = json ? JSON.parse(json) : undefined;
    return data.map((a: any) => a.Address);
};

const updateTopAccounts = async (fetchNew = false) => {
    const appService = new AppService();

    let topAccountsAll;
    if (!fetchNew) {
        topAccountsAll = JSON.parse(fs.readFileSync("topAccounts.json", "utf-8"));
    }

    for (let page = 1; page < PAGES; page++) {
        console.log("\n\npage", page);
        let topAccounts;
        if (fetchNew) {
            topAccounts = await getTopAccounts(page);
        } else {
            topAccounts = topAccountsAll[page];
        }
        let n = 1;
        for (const account of topAccounts) {
            console.log(`fetching wallet info for ${account} (${n}/${topAccounts.length})`);
            await appService.fetchWalletInfo(account);
            await sleep(1000);
            n++;
        }
    }
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const saveTopAccounts = async () => {
    const topAccounts: { [key: number]: any } = {};
    for (let i = 1; i <= PAGES; i++) {
        console.log("page", i);
        topAccounts[i] = await getTopAccounts(i);
        await sleep(500);
    }

    fs.writeFileSync("topAccounts.json", JSON.stringify(topAccounts, null, 2)); 
}

updateTopAccounts();
