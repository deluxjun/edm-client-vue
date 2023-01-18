import store from "@/store";
import router from "@/router";
import * as api from "@/utils/api";
import mgCheck from "@/utils/MGCheckLogin";
// import CryptoJS from 'crypto-js'

function parseToken(result) {
  let path = store.state.baseURL;
  if (path === "") path = "/";

  if (result.list[0]) {
    let ticketId = result.list[0].xedmSession;
    let lang = "ko";
    let sessionTime = Utils.featuresDefault("session.auth.cookie", 86400);
    let authSid = Utils.featuresDefault("auth.sid.pass", true);
    lang = result.list[0].locale;
    if (ticketId) {
      if (authSid) {
        Utils.setCookie("auth", ticketId, sessionTime, path);
      }
      Utils.setCookie("lang", lang);
      let user = result.list[0];

      store.commit("setUser", user);
      store.commit("setTicket", ticketId);
    }

    if (process.env.NODE_ENV !== "production" && result.list[0].jsessionid) {
      let cookieName = store.state.info.sessionCookieName
        ? store.state.info.sessionCookieName
        : "JSESSIONID";
      let cookieAge = store.state.info.sessionCookieAge
        ? store.state.info.sessionCookieAge
        : 86400;
      Utils.setCookie(cookieName, result.list[0].jsessionid, cookieAge, path);
    }

    if (result.list[0].expiredPassword) {
      store.commit("setPasswordExpired", true);
    }
  }
}

function loggedIn() {
  return new Promise((resolve, reject) => {
    let url = "";
    let authSid = Utils.featuresDefault("auth.sid.pass", true);
    if (!authSid) {
      url = `${store.state.baseURL}/json/validation`;
    }
    let sid = Utils.getCookie("auth");
    if (sid != null && sid !== "")
      url = `${store.state.baseURL}/json/validation?sid=${sid}`;
    if (url !== "") {
      api
        .ax()
        .get(url)
        .then(response => {
          parseToken(response.data);
          resolve();
          let lgUplus = Utils.featuresDefault("websocket.LGUplus.login", false);
          if (lgUplus) {
            mgCheck.WgearCallLogin(successCallback, redirectLoginPage);
            //mgCheck.lgUplusCheckLogin(successCallback, redirectLoginPage);
          }
        })
        .catch(error => {
          console.log(error);
          if (error.response) reject(new Error(error.response.data));
          else reject(new Error("validation failure"));
        });
    } else {
      reject(new Error("No cookie"));
    }
  });
}

function successCallback(e) {
  console.log(e);
}
function redirectLoginPage() {
  router.push({
    path: Utils.featuresDefault("redirectLoginPage", "/login"),
    //path: '/login',
    query: { redirect: route.path }
  });
}

function validate() {
  return new Promise((resolve, reject) => {
    let url = "";
    let authSid = Utils.featuresDefault("auth.sid.pass", true);
    if (!authSid) {
      url = `${store.state.baseURL}/json/checkSession`;
    }
    let sid = Utils.getCookie("auth");
    if (sid != null && sid !== "")
      url = `${store.state.baseURL}/json/checkSession?sid=${sid}`;
    if (url !== "") {
      api
        .ax()
        .get(url)
        .then(response => {
          resolve();
        })
        .catch(error => {
          console.log(error);
          if (error.response) reject(new Error(error.response.data));
          else reject(new Error("validation failure"));
        });
    } else {
      // 20180524, if no cookie exists and do nothing
      // reject(new Error('No cookie'))
    }
  });
}
function login(user, password) {
  //  let tripledes = require("crypto-js/tripledes");
  let crypto = require("crypto-js");
  let key = Utils.featuresDefault("security.key", null);
  let data = null;
  if (key) {
    data = {
      method: "AES",
      userId: crypto.AES.encrypt(user, key).toString(),
      password: crypto.AES.encrypt(password, key).toString()
    };
  } else {
    data = {
      userId: user,
      password: password
    };
  }

  return new Promise((resolve, reject) => {
    // api.get(`${store.state.baseURL}/json/login?userId=${user}&password=${password}`)
    api
      .postUrl(`/json/login`, jQuery.param(data), false)
      // axios.post(`${store.state.baseURL}/json/login`, data)
      .then(r => {
        if (r.errcode != "0") {
          reject(r.errmsg);
          return;
        }
        parseToken(r);
        resolve();
      })
      .catch(error => {
        console.log(error);
        reject(error);
      });
  });
}
function MGLogin(user) {
  var data = {
    userId: user
  };
  console.log(data);
  return new Promise((resolve, reject) => {
    // api.get(`${store.state.baseURL}/json/login?userId=${user}&password=${password}`)
    api
      .postUrl(`/json/login`, jQuery.param(data), false)
      // axios.post(`${store.state.baseURL}/json/login`, data)
      .then(r => {
        if (r.errcode != "0") {
          reject(r.errmsg);
          return;
        }
        parseToken(r);
        store.commit("setMGlogin", true);
        resolve();
      })
      .catch(error => {
        console.log(error);
        reject(error);
      });
  });
}
function logout() {
  let path = store.state.baseURL;
  if (path === "") path = "/";

  api
    .ax()
    .get(`${store.state.baseURL}/json/logout`)
    .then(response => {
      // clear store
      store.dispatch("resetState");

      Utils.deleteCookie("auth", store.state.baseURL);
      Utils.deleteCookie("JSESSIONID", store.state.baseURL);
      Utils.deleteCookie("VFUSER", store.state.baseURL);
      Utils.deleteCookie("lang");
      Utils.deleteCookie("loginWithOut");
      Utils.deleteCookie("pChange");
      Utils.deleteCookie("isHq");

      var redirectPage = Utils.featuresDefault("logout.redirectPage", false);

      if (redirectPage) window.location.replace(redirectPage);
      else router.push({ path: "/login" });
    })
    .catch(error => {
      console.log(error);
    });
}

export default {
  loggedIn: loggedIn,
  validate: validate,
  login: login,
  MGLogin: MGLogin,
  logout: logout
};
