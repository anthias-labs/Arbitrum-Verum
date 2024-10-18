import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { AppService } from "./app.service";
import fs from "fs";

const topAccounts = JSON.parse(fs.readFileSync("topAccounts.json", "utf-8"))
const appService = new AppService()
let cnt = 0;


async function updateTable () {
  return;
  console.log("updating wallet", cnt)

  const address = topAccounts[cnt];
  appService.fetchWalletInfo(address)  


  // sumo de a 7 si es coprimo para variar un poco el orden (mcm(topAccounts.length, 7) == topAccounts.length * 7 asi que estamos bien)
  cnt += topAccounts.length % 7 != 0 ? 7 : 1
  cnt %= topAccounts.length
  
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuración de CORS
  const corsOptions: CorsOptions = {
    origin: '*', // Permitir solicitudes desde este origen
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Métodos permitidos
    allowedHeaders: 'Content-Type, Authorization', // Encabezados permitidos
    credentials: true, // Permitir el envío de cookies y cabeceras de autorización
  };

  app.enableCors(corsOptions);
  const interval = setInterval(updateTable, 1000 * 60)

  await app.listen(3001);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
