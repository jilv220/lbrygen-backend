import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import * as compression from 'compression';
import * as express from 'express';
import * as http from 'http';

const port = process.env.PORT || 5000
const Gun = require('gun')

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use(compression());
  await app.listen(port);
}
bootstrap();

const server = express();
server.use(Gun.serve);
server.listen(5001);