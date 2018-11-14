// import Axios from 'axios'
import Taro from '@tarojs/taro'
import { host } from '../config'

function handleRes(res) {
    handleError(res)
    return res.data
}

function handleError(res) {
    if (res.statusCode === 500) {
        throw 'system error'
    } else if (res.statusCode === 401) {
        Taro.removeStorageSync('login')
        Taro.removeStorageSync('apiToken')
        Taro.navigateBack({
                url: '/pages/login/index'
            })
    } else if (res.statusCode === 403) {
        throw 'forbidden'
    } else if (res.statusCode === 429) {
        throw 'too many request'
    }
}

function fetchWork(token, type, num, packageId) {
    return Taro.request({
        url: `${host}works/fetch`,
        method: 'POST',
        mode: "cors",
        data: {
            type: type,
            num: num,
            packages: [packageId]
        },
        header: {
            'content-type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        dataType: 'text',
        responseType: 'text'
    }).then(handleRes).then((data) => JSON.parse(data))
}

function downloadWorkFile(token, workId, options) {
    return Taro.request({
        url: options ? `${host}works/${workId}/file?format=${options.format}&x=${options.x}&y=${options.y}&width=${options.width}&height=${options.height}` : `${host}works/${workId}/file`,
        method: 'GET',
        header: {
            'Authorization': 'Bearer ' + token
        },
        responseType: 'arraybuffer'
    }).then(handleRes)
}

function cancelWork(token, workId) {
    return Taro.request({
        url: `${host}works/${workId.join(',')}/cancel`,
        method: 'DELETE',
        responseType: 'arraybuffer',
        header: {
            'Authorization': 'Bearer ' + token
        },
    }).then(handleRes)
}

function submitWork(token, workId, result) {
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
    }).then(handleRes)
}

function fetchReview(token, type, num) {
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
        },
        dataType: 'text',
        responseType: 'text'
    }).then(handleRes).then((data) => JSON.parse(data))
}

function downloadReviewFile(token, reviewId, options) {
    return Taro.request({
        url: options ? `${host}reviews/${reviewId}/file?format=${options.format}&x=${options.x}&y=${options.y}&width=${options.width}&height=${options.height}` : `${host}reviews/${reviewId}/file`,
        method: 'GET',
        header: {
            'Authorization': 'Bearer ' + token
        },
        responseType: 'arraybuffer'
    }).then(handleRes)
}

function submitReview(token, reviewId, result) {
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
    }).then(handleRes)
}

function phoneLogin(phone, passwd) {
    return Taro.request({
        url: `${host}login/mobile`,
        method: 'POST',
        data: {
            'mobile': phone,
            'password': passwd,
            'region': 'CN'
        },
        header: {
            'content-type': 'application/json'
        },
        dataType: 'text',
        responseType: 'text'
    }).then(handleRes)
}

function wechatLogin(code) {
    return Taro.request({
        url: `${host}login/weixin/${code}`,
        method: 'POST',
        dataType: 'text',
        responseType: 'text'
    }).then(handleRes)
}

function listAuthorizedWorkType(token) {
    return Taro.request({
        url: `${host}works/authorizations`,
        method: 'GET',
        dataType: 'text',
        header: {
            'Authorization': 'Bearer ' + token
        },
        responseType: 'text'
    }).then(handleRes).then((data) => JSON.parse(data))
}

function checkDveice(res) {
    return (res.model !== null) ? true : false;
}

export {fetchWork, downloadWorkFile, cancelWork, submitWork, fetchReview, downloadReviewFile, submitReview, phoneLogin, wechatLogin, listAuthorizedWorkType, checkDveice};
