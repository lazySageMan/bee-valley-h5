import i18next from 'i18next';
import LngDetector from 'i18next-browser-languagedetector';
import Taro from '@tarojs/taro'

import en from '../src/utils/en'
import zh from '../src/utils/zh'

let options = {
  // order and from where user language should be detected
  order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],

  // keys or params to lookup language from
  lookupQuerystring: 'lng',
  lookupCookie: 'i18next',
  lookupLocalStorage: 'i18nextLng',
  lookupFromPathIndex: 0,
  lookupFromSubdomainIndex: 0,

  // cache user language on
  caches: ['localStorage', 'cookie'],
  excludeCacheFor: ['cimode'], // languages to not persist (cookie, localStorage)

  // optional expire and domain for set cookie
  cookieMinutes: 10,
  cookieDomain: 'myDomain',

  // optional htmlTag with lang attribute, the default is:
  htmlTag: document.documentElement
}
i18next
  .use(LngDetector)
  .init({
    "lng": Taro.getStorageSync('i18nextLng'),
    "debug": true,
    "resources": {
      "en": {
        translation: en
      },
      "cn": {
        translation: zh
      }
    },
    "detection": options
  });

export default i18next;



