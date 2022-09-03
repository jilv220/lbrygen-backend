import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import Gun, { useGun } from './gun';

import * as compression from 'compression';
import * as express from 'express';
import * as http from 'http';

const port = process.env.PORT || 5000

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use(compression());
  await app.listen(port);
}
bootstrap();

const server = express();
http.createServer(server).listen(5001);
Gun.init(server)