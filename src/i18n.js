import i18next from 'i18next'
import LngDetector from 'i18next-browser-languagedetector'
import Taro from '@tarojs/taro'

import en from '../src/utils/en'
import zh from '../src/utils/zh'

let options = {
  // order and from where user language should be detected
  order: ['querystring', 'taroStorageLngDetector', 'navigator', 'htmlTag', 'path', 'subdomain'],

  // keys or params to lookup language from
  lookupQuerystring: 'lng',
  lookupCookie: 'i18next',
  lookupLocalStorage: 'i18nextLng',
  lookupFromPathIndex: 0,
  lookupFromSubdomainIndex: 0,

  // cache user language on
  caches: ['taroStorageLngDetector'],
  excludeCacheFor: ['cimode'], // languages to not persist (cookie, localStorage)

  // optional expire and domain for set cookie
  cookieMinutes: 10,
  cookieDomain: 'myDomain',

  // optional htmlTag with lang attribute, the default is:
  htmlTag: document.documentElement
}

let taroStorageLngDetector = {
  
  name: 'taroStorageLngDetector',

  lookup(options) {
    // options -> are passed in options
    let cached = Taro.getStorageSync('i18nextLng')
    return cached ? cached : 'cn';
  },

  cacheUserLanguage(lng, options) {
    Taro.setStorageSync('i18nextLng', lng)
    // console.log(lng)
    // options -> are passed in options
    // lng -> current language, will be called after init and on changeLanguage

    // store it
  }
}

const lngDetector = new LngDetector()
lngDetector.addDetector(taroStorageLngDetector)

i18next
  .use(lngDetector)
  .init({
    "debug": true,
    "resources": {
      "cn": {
        translation: zh
      },
      "en": {
        translation: en
      }
    },
    "detection": options
  });

export default i18next;



