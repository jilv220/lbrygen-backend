import { Controller, Get, Res, Header } from '@nestjs/common';
import { createReadStream } from 'fs';
import { join } from 'path';
import { useGun } from 'src/gun';
import { AppService } from '../app.service';

@Controller('')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  status(): string {
    return 'The api is up and running.'
  }

  @Get('/robots.txt')
  @Header('content-type','text/html')
  getRobots(@Res() res) {
    const stream = createReadStream(join('./res', 'robots.txt'));
    stream.pipe(res)
  }
}

