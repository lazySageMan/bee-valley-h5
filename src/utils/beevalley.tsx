import Taro from '@tarojs/taro'
import { host } from '../config'

let beevalley = {

    fetchWork(token, type, num) {
        return Taro.request({
            url: `${host}works/fetch`,
            method: 'POST',
            data: {
                type: type,
                num: num
            },
            header: {
                'content-type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        }).then((res) => res.data).catch((err) => console.log(err))
    },

    downloadWorkFile(token, workId) {
        return Taro.request({
            url: `${host}works/${workId}/file`,
            method: 'GET',
            header: {
                'Authorization': 'Bearer ' + token
            },
            responseType: 'arraybuffer'
        }).then((res) => res.data).catch((err) => console.log(err))
    }
}
module.exports = beevalley
