import { AppService } from '../app.service';
export declare class ApiController {
    private readonly appService;
    constructor(appService: AppService);
    resolveSingle(query: any, res: any): Promise<any>;
    claimSearch(query: any, res: any): Promise<any>;
    fetchContents(query: any, res: any): Promise<any>;
    getStream(query: any, res: any): Promise<any>;
    download(req: any, res: any): Promise<any>;
}
