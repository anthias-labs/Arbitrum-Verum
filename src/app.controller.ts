import {
    Controller,
    Get,
    Query,
    Param,
    Delete,
    Res,
    StreamableFile,
} from "@nestjs/common";
import { AppService } from "./app.service";

@Controller("api")
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get("fetchWalletInfo/:walletAddress")
    async getWalletInfo(@Param("walletAddress") walletAddress: string) {
        console.log("fetching wallet info");
        return await this.appService.fetchWalletInfo(walletAddress);
    }

    @Get("fetchTable")
    async fetchTable(
        @Query("order_by") orderBy?: string,
        @Query("order") order?: string,
        @Query("page") page: number = 1, // page puede ser undefined
        @Query("lending_health") lendingHealth?: string,
        @Query("voting_participation") votingParticipation?: string,
        @Query("contract_interactions") contractInteractions?: string,
        @Query("asset_amount") assetAmount?: string,
        @Query("user_time") userTime?: string,
        @Query("trans_number") transNumber?: string
    ) {
        console.log("fetching table with filters");
        return await this.appService.fetchTable(
            orderBy,
            order,
            page,
            30,
            lendingHealth,
            votingParticipation,
            contractInteractions,
            assetAmount,
            userTime,
            transNumber
        );
    }

    @Get("exportCSV")
    async exportCSV(@Query("order_by") orderBy?: string) {
        console.log("exporting CSV");
        const csv_text = await this.appService.exportCSV(orderBy);
        if (csv_text === "") {
            return "Error generating csv";
        } else {
            const buf = Buffer.from(csv_text, "utf-8");
            return new StreamableFile(buf, {
                type: "application/csv",
                disposition: `attachment; filename="export.csv"`,
            });
        }
    }
}
