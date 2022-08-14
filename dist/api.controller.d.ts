import { AppService } from './app.service';
export declare class ApiController {
    private readonly appService;
    constructor(appService: AppService);
    status(): string;
}
