import axios from 'axios'

const base = 'http://127.0.0.1'
const lbryPort = 5279
const lbryUrl = `${base}:${lbryPort}`

export function apiCall(params: any) {

    return new Promise((resolve, reject) => {
        axios.
            post(lbryUrl, params)
            .then(res => {
                //console.log(res.data)
                resolve(res.data)
            })
            .catch(err => {
                //console.error(err)
                reject(err)
            })
    })
}

export default {
    apiCall
}