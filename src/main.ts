import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import Gun from './gun'

import * as compression from 'compression';
import * as express from 'express';

const port = process.env.PORT || 5000
const gun_port = process.env.GUN_PORT || 5001

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use(compression());
  await app.listen(port);
}
bootstrap();

const gunApp = express();
gunApp.use(Gun.serve);

const server = gunApp.listen(gun_port);
Gun.init(server, gun_port)