"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiCall = void 0;
const axios_1 = require("axios");
const base = 'http://127.0.0.1';
const lbryPort = 5279;
const lbryUrl = `${base}:${lbryPort}`;
function apiCall(params) {
    return new Promise((resolve, reject) => {
        axios_1.default.
            post(lbryUrl, params)
            .then(res => {
            resolve(res.data);
        })
            .catch(err => {
            reject(err);
        });
    });
}
exports.apiCall = apiCall;
exports.default = {
    apiCall
};
//# sourceMappingURL=lbry.js.map