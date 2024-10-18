import { NestFactory, HttpAdapterHost } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";

import { AppModule } from "./app.module";

let app;
export default async function handler(req, res) {
    if (!app) {
        app = await NestFactory.create(AppModule);

        app.enableCors({
            origin: "*",
            methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
            preflightContinue: false,
            optionsSuccessStatus: 204,
            credentials: true,
        });
    }

    await app.init()

    const adapterHost = app.get(HttpAdapterHost)
    const httpAdapter = adapterHost.httpAdapter
    const instance = httpAdapter.getInstance()

    instance(req, res)
}
