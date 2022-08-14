import { Module, CacheModule} from '@nestjs/common';
import { ApiController } from './controllers/api.controller';
import { AppController } from './controllers/app.controller';
import { AppService } from './app.service';

@Module({
  imports: [CacheModule.register()],
  controllers: [AppController, ApiController],
  providers: [AppService],
})
export class AppModule {}

CacheModule.register({
  ttl: 300, // seconds
  max: 10, // maximum number of items in cache
});
