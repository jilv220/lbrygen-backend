"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterDup = void 0;
function filterDup(arr) {
    for (let i = 0; i < arr.length; i++) {
        let dupArr = arr.filter((item) => item.address === arr[i].address);
        if (dupArr.length === 1) {
            continue;
        }
        for (let i = 1; i < dupArr.length; i++) {
            arr = arr.filter((item) => item !== dupArr[i]);
        }
    }
    return arr;
}
exports.filterDup = filterDup;
exports.default = {
    filterDup
};
//# sourceMappingURL=arrayUtils.js.map