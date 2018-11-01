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
    },

    cancelWork(token, workId){
        return Taro.request({
            url:  `${host}works/${workId.join(',')}/cancel`,
            method: 'DELETE',
            header: {
                'Authorization': 'Bearer ' + token
            },
        }).then((res) => console.log(res)).catch((err) => console.log(err))
    },

    submitWork(token, workId, result){
        return Taro.request({
            url: `${host}works/`,
            method: 'POST',
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

    downloadReviewFile(token, reviewId){
        return Taro.request({
            url: `${host}reviews/${reviewId}/file`,
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
    }


}
module.exports = beevalley
