import express from 'express';
import compression from 'compression';
import cors from 'cors';
import fetch from 'node-fetch';
import axios from 'axios';
import fs from 'fs';
import { STREAM_IP, API_BASE } from './env.js';
import { filterDup } from './arrayUtils.js';
const app = express();
// Api config
const base = 'http://127.0.0.1';
const port = process.env.PORT || 5000;
const lbryPort = 5279;
const lbryUrl = `${base}:${lbryPort}`;
const PAGE_SIZE = 20;
app.use(cors());
app.use(compression());
function apiCall(params) {
    return new Promise((resolve, reject) => {
        axios.
            post(lbryUrl, params)
            .then(res => {
            //console.log(res.data)
            resolve(res.data);
        })
            .catch(err => {
            //console.error(err)
            reject(err);
        });
    });
}
// Api route
app.get('/', (req, res) => {
    res.send('The api is up and running.');
});
app.get('/api/status', (req, res) => {
    req.setTimeout(200);
    let params = { method: 'status' };
    apiCall(params)
        .then((daemonRes) => {
        //console.log(daemonRes)
        res.send(daemonRes);
    })
        .catch((error) => { });
});
app.get('/api/search', (req, res) => {
    let tag = req.query.t;
    let text = req.query.q;
    let channel = req.query.c;
    let channelIDs = req.query.chs;
    let pageNum = req.query.p;
    let pageSize = req.query.ps;
    let streamType = req.query.st;
    let order = req.query.o;
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
    // console.log(tag)
    let params = {
        method: 'claim_search',
        params: searchParams
    };
    apiCall(params)
        .then((daemonRes) => {
        res.send(daemonRes);
    });
});
app.get('/api/get', (req, res) => {
    res.header("Content-Type", 'application/json');
    let options = { root: './' };
    res.sendFile('./data.json', options);
});
app.get('/api/fetch', async (req, res) => {
    let category = req.query.ctgy;
    let pageNum = req.query.p;
    let isFetchNext = (req.query.n === 'y');
    const fileContents = fs.readFileSync('./data.json', 'utf8');
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
        daemonRes = await apiCall(params);
        daemonRes.result.items = filterDup(daemonRes.result.items);
        if (isFetchNext) {
            daemonRes.result.items = daemonRes.result.items.slice(0, 8);
        }
        else {
            daemonRes.result.items = daemonRes.result.items.slice(0, 20);
        }
        res.send(daemonRes);
    }
    catch (err) {
        console.error(err);
    }
});
app.get('/api/resolveSingle', (req, res) => {
    let canonUrl = req.query.curl;
    let params = {
        method: 'resolve',
        params: { urls: canonUrl === undefined ? undefined : canonUrl }
    };
    apiCall(params)
        .then((daemonRes) => {
        //console.log(daemonRes)
        res.send(daemonRes);
    });
});
app.get('/stream/*', (req, res) => {
    let streamingUrl = 'http://localhost:5280' + req.url;
    let contentLength;
    let contentRange;
    let contentType;
    // record start
    let start;
    const range = req.headers.range;
    if (range) {
        const bytesPrefix = "bytes=";
        if (range.startsWith(bytesPrefix)) {
            const bytesRange = range.substring(bytesPrefix.length);
            const parts = bytesRange.split("-");
            if (parts.length === 2) {
                const rangeStart = parts[0] && parts[0].trim();
                if (rangeStart && rangeStart.length > 0) {
                    start = parseInt(rangeStart);
                }
            }
        }
    }
    fetch(streamingUrl, {
        method: 'GET',
    })
        .then(response => {
        contentLength = response.headers.get('content-length');
        contentRange = response.headers.get('content-range');
        contentType = response.headers.get('content-type');
        return response.body;
    })
        .then(stream => {
        res.writeHead(206, {
            "content-length": contentLength,
            "content-range": contentRange,
            "content-type": contentType
        });
        if (stream) {
            stream.pipe(res);
        }
    });
});
app.get('/api/getStream', (req, res) => {
    let uri = req.query.url;
    let download = req.query.d;
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
    apiCall(params)
        .then((daemonRes) => {
        if (daemonRes.result.streaming_url) {
            daemonRes.result.streaming_url =
                daemonRes.result.streaming_url.replace(STREAM_IP, API_BASE);
        }
        res.send(daemonRes.result);
    });
});
// Api entry
app.listen(port);
console.log('API server started on: ' + base + ":" + port);
