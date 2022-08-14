"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiController = void 0;
const common_1 = require("@nestjs/common");
const app_service_1 = require("../app.service");
const fs = require("fs");
const path_1 = require("path");
const lbry_1 = require("../lbry");
const arrayUtils_1 = require("../arrayUtils");
const env_1 = require("../env");
const PAGE_SIZE = 20;
let ApiController = class ApiController {
    constructor(appService) {
        this.appService = appService;
    }
    async resolveSingle(query, res) {
        let canonUrl = query.curl;
        let params = {
            method: 'resolve',
            params: { urls: canonUrl === undefined ? undefined : canonUrl }
        };
        (0, lbry_1.apiCall)(params)
            .then((daemonRes) => {
            res.send(daemonRes);
        });
    }
    async claimSearch(query, res) {
        let tag = query.t;
        let text = query.q;
        let channel = query.c;
        let channelIDs = query.chs;
        let pageNum = query.p;
        let pageSize = query.ps;
        let streamType = query.st;
        let order = query.o;
        let searchParams = {
            text: text === undefined ? undefined : text,
            fee_amount: '<=0',
            page: pageNum === undefined ? 1 : Number(pageNum),
            page_size: pageSize == undefined ? PAGE_SIZE : Number(pageSize),
            stream_type: streamType === undefined ? ['video'] : [streamType],
            order_by: order === undefined ? 'release_time' : order,
            any_tags: tag == undefined ? undefined : typeof tag === 'string' ? [tag] : tag,
            channel: channel === undefined ? undefined : channel,
            channel_ids: channelIDs === undefined ? undefined : channelIDs,
            no_totals: true
        };
        let params = {
            method: 'claim_search',
            params: searchParams
        };
        try {
            let data = await (0, lbry_1.apiCall)(params);
            res.send(data);
        }
        catch (err) {
            res.send(err);
        }
    }
    async fetchContents(query, res) {
        var _a, _b, _c;
        let category = query.ctgy;
        let pageNum = query.p;
        let isFetchNext = (query.n === 'y');
        const fileContents = fs.readFileSync((0, path_1.join)('./res', 'data.json'), 'utf8');
        try {
            const data = JSON.parse(fileContents);
            let chIds;
            switch (category) {
                case 'featured':
                    chIds = data.en.categories.PRIMARY_CONTENT.channelIds;
                    break;
                case 'education':
                    chIds = data.en.categories.EDUCATION.channelIds;
                    break;
                case 'gaming':
                    chIds = data.en.categories.GAMING.channelIds;
                    break;
                case 'tech':
                    chIds = data.en.categories.TECHNOLOGY.channelIds;
                    break;
                case 'news':
                    chIds = data.en.categories.NEWS_AND_POLITICS.channelIds;
                    break;
            }
            let searchParams = {
                text: undefined,
                fee_amount: '<=0',
                page: 1,
                page_size: 40,
                stream_type: ['video'],
                order_by: 'release_time',
                any_tags: undefined,
                channel: undefined,
                channel_ids: chIds,
                no_totals: true
            };
            let params = {
                method: 'claim_search',
                params: searchParams
            };
            let daemonRes;
            if (isFetchNext) {
                searchParams.page = Number(pageNum);
                searchParams.page_size = 20;
            }
            daemonRes = await (0, lbry_1.apiCall)(params);
            daemonRes.result.items = (0, arrayUtils_1.filterDup)((_a = daemonRes.result) === null || _a === void 0 ? void 0 : _a.items);
            if (isFetchNext) {
                daemonRes.result.items = (_b = daemonRes.result) === null || _b === void 0 ? void 0 : _b.items.slice(0, 8);
            }
            else {
                daemonRes.result.items = (_c = daemonRes.result) === null || _c === void 0 ? void 0 : _c.items.slice(0, 20);
            }
            res.send(daemonRes);
        }
        catch (err) {
            console.error(err);
        }
    }
    async getStream(query, res) {
        let uri = query.url;
        let download = query.d;
        let isDownload = false;
        if (download === 'y') {
            isDownload = true;
        }
        let params = {
            method: 'get',
            params: {
                uri: uri === undefined ? undefined : uri,
                save_file: isDownload,
                file_name: (uri && isDownload) ? uri.replace('lbry://', '') : undefined,
                timeout: 10
            }
        };
        (0, lbry_1.apiCall)(params)
            .then((daemonRes) => {
            if (daemonRes.result.streaming_url) {
                daemonRes.result.streaming_url =
                    daemonRes.result.streaming_url.replace(env_1.STREAM_IP, env_1.API_BASE);
            }
            res.send(daemonRes.result);
        });
    }
};
__decorate([
    (0, common_1.Get)('resolveSingle'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ApiController.prototype, "resolveSingle", null);
__decorate([
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ApiController.prototype, "claimSearch", null);
__decorate([
    (0, common_1.Get)('fetch'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ApiController.prototype, "fetchContents", null);
__decorate([
    (0, common_1.Get)('getStream'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ApiController.prototype, "getStream", null);
ApiController = __decorate([
    (0, common_1.Controller)('api'),
    (0, common_1.UseInterceptors)(common_1.CacheInterceptor),
    __metadata("design:paramtypes", [app_service_1.AppService])
], ApiController);
exports.ApiController = ApiController;
//# sourceMappingURL=api.controller.js.map