export function filterDup(arr: Array<any>) {
    for (let i = 0; i < arr.length; i++) {
      let dupArr = arr.filter((item) => item.address === arr[i].address)
      if (dupArr.length === 1) {
        continue
      }

      // only keep 1 for each channel
      for (let i = 1; i < dupArr.length; i++) {
        arr = arr.filter((item) => item !== dupArr[i])
      }
    }
    return arr
}

export default {
  filterDup
}