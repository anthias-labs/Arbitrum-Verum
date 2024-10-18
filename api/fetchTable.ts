import {AppService} from "../src/app.service"
import cors from "../src/cors"

const appService = new AppService()

// order_by=asset_amount&order=desc&page=1

export async function GET(request: Request) {
    const params = new URL(request.url).searchParams

    const order_by: string = params.get("order_by") ?? "asset_amount"
    const order: string = params.get("order") ?? "desc"
    const page: number = parseInt(params.get("page") ?? "1")


    const headers = new Headers();
    headers.append("Content-Type", " application/json");
    headers.append("Access-Control-Allow-Origin", "*");

    const table = await appService.fetchTable(order_by, order, page)
    const res = new Response(JSON.stringify(table), {headers});

    return res
}
