// import Axios from 'axios'
import Taro from '@tarojs/taro'
import { host } from '../config'

let beevalley = {

    fetchWork(token, type, num, packageId) {
        return Taro.request({
            url: `${host}works/fetch`,
            method: 'POST',
            data: {
                type: type,
                num: num,
                packages: [packageId]
            },
            header: {
                'content-type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        }).then((res) => res.data).catch((err) => console.log(err))
    },

    downloadWorkFile(token, workId, options) {
        return Taro.request({
            url: options ? `${host}works/${workId}/file?format=${options.format}&x=${options.x}&y=${options.y}&width=${options.width}&height=${options.height }` : `${host}works/${workId}/file`,
            method: 'GET',
            header: {
                'Authorization': 'Bearer ' + token
            },
            responseType: 'arraybuffer'
        }).then((res) => res.data).catch((err) => console.log(err))
    },

    cancelWork(token, workId){
        return Taro.request({
            url:  `${host}works/${workId.join(',')}/cancel`,
            method: 'DELETE',
            responseType: 'arraybuffer',
            header: {
                'Authorization': 'Bearer ' + token
            },
        }).then((res) => console.log(res)).catch((err) => console.log(err))
    },

    submitWork(token, workId, result){
        return Taro.request({
            url: `${host}works/`,
            method: 'POST',
            responseType: 'arraybuffer',
            data: {
                'id': workId,
                'result': result
            },
            header: {
                'content-type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        }).then((res) => console.log(res)).catch((err) => console.log(err))
    },

    fetchReview(token, type, num){
        return Taro.request({
            url: `${host}reviews/fetch`,
            method: 'POST',
            data: {
                type: type,
                num: num
            },
            header: {
                'content-type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        }).then((res) => res.data).catch((err) => console.log(err));
    },

    downloadReviewFile(token, reviewId, options){
        return Taro.request({
            url: options ? `${host}reviews/${reviewId}/file?format=${options.format}&x=${options.x}&y=${options.y}&width=${options.width}&height=${options.height }` : `${host}reviews/${reviewId}/file`,
            method: 'GET',
            header: {
                'Authorization': 'Bearer ' + token
            },
            responseType: 'arraybuffer'
        }).then((res) => res.data).catch((err) => console.log(err))
    },

    submitReview(token, reviewId, result){
        return Taro.request({
            url: `${host}reviews`,
            method: 'POST',
            data: {
                'id': reviewId,
                'result': result
            },
            header: {
                'content-type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            responseType: 'arraybuffer'
        }).then((res) => res.data).catch((err) => console.log(err))
    },

    phoneLogin(phone, passwd){
        return Taro.request({
            url: `${host}login/mobile`,
            method: 'POST',
            data: {
                'mobile': phone,
                'password': passwd,
                'region': 'CN'
            },
            responseType: 'arraybuffer',
            header: {
                'content-type': 'application/json'
            }
        }).then((res) => new TextDecoder("utf-8").decode(res.data))
    },

    wechatLogin(code){
        return Taro.request({
            url: `${host}login/weixin/${code}`,
            method: 'POST',
            responseType: 'arraybuffer'
        }).then((res) => new TextDecoder("utf-8").decode(res.data))
    },

    listAuthorizedWorkType(token) {
        return Taro.request({
            url: `${host}works/authorizations`,
            method: 'GET',
            header: {
                'Authorization': 'Bearer ' + token
            },
        }).then((res) => res.data).catch((err) => console.log(err));
    }
}
module.exports = beevalley
