import i18next from 'i18next'

import en from '../src/utils/en'
import zh from '../src/utils/zh'

i18next.init({
  lng: 'en', //当前语言
  debug: true,
  resources: {
    en: {
      translation: en
    },
    cn: {
      translation: zh
    }
  }
});

function changeLng(lng) { //切换语言
  i18next.changeLanguage(lng);
}

// i18next.on('languageChanged', () => {
//   updateContent();
// });

export default i18next;



