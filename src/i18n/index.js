import Vue from "vue";
import VueI18n from "vue-i18n";
import en from "./en.yaml";
import ko from "./ko.yaml";
import ja from "./ja.yaml";
// import zhCN from './zh-cn.yaml'
// import zhTW from './zh-tw.yaml'

Vue.use(VueI18n);

export function detectLocale(setLocale) {
  let locale = "ko";
  if (navigator.language) locale = navigator.language.toLowerCase();
  else if (navigator.browserLangugae)
    locale = navigator.browserLangugae.toLowerCase();

  if (langGetCookie("lang")) locale = langGetCookie("lang");

  // if(setLocale)
  //   locale =setLocale

  switch (true) {
    case /^en.*/i.test(locale):
      locale = "en";
      break;
    case /^ko.*/i.test(locale):
      locale = "ko";
      break;
    case /^ja.*/i.test(locale):
      locale = "ja";
      break;
    // case /^zh-CN/i.test(locale):
    //   locale = 'zh-cn'
    //   break
    // case /^zh-TW/i.test(locale):
    //   locale = 'zh-tw'
    //   break
    // case /^zh.*/i.test(locale):
    //   locale = 'zh-cn'
    //   break
    default:
      locale = "en";
  }

  return locale;
}

export function langGetCookie(cName) {
  cName = cName + "=";
  let cookieData = document.cookie;
  let start = cookieData.indexOf(cName);
  let cValue = "";
  if (start != -1) {
    start += cName.length;
    let end = cookieData.indexOf(";", start);
    if (end == -1) end = cookieData.length;
    cValue = cookieData.substring(start, end);
  }
  return unescape(cValue);
}

const i18n = new VueI18n({
  locale: detectLocale(),
  fallbackLocale: "en",
  messages: {
    en: en,
    ko: ko,
    ja: ja
    // 'zh-cn': zhCN,
    // 'zh-tw': zhTW,
  }
});

export default i18n;
