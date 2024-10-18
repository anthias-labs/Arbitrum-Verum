import {AppService} from "../src/app.service"
import cors from "../src/cors"

const appService = new AppService()

export async function GET(request: Request) {
    const params = new URL(request.url).searchParams

    const order_by: string = params.get("order_by") ?? "asset_amount"


    const headers = new Headers();
    headers.append("Content-Type", "application/csv");
    headers.append("Content-Disposition", `attachment; filename="export.csv"`);
    headers.append("Access-Control-Allow-Origin", "*");
    

    const table = await appService.exportCSV(order_by)
    const res = new Response(JSON.stringify(table), {headers});

    return res
}