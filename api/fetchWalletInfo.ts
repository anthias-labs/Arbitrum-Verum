import {AppService} from "../src/app.service"
import cors from "../src/cors"

const appService = new AppService()

// /fetchWalletInfo/0x451294558b1b91C3f99173F210b38Ce825170Ba3

export async function GET(request: Request) {
    const params = new URL(request.url).searchParams

    const wallet: string = params.get("address") ?? "0x0000000000000000000000000000000000000000"
    
    const headers = new Headers();
    headers.append("Content-Type", " application/json");
    headers.append("Access-Control-Allow-Origin", "*");

    const info = await appService.fetchWalletInfo(wallet)

    const res = new Response(JSON.stringify(info), {headers});

    return res
}