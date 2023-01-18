import Vue from "vue";
import Router from "vue-router";
import Layout from "@/views/Layout";
import EmptyLayout from "@/views/EmptyLayout";
import ErrorDisconnect from "@/views/errors/Disconnect";
import Error403 from "@/views/errors/403";
import Error404 from "@/views/errors/404";
import Error500 from "@/views/errors/500";
import ErrorPermission from "@/views/errors/permissionError";
import ErrorAgent from "@/views/errors/AgentInstallError";
import auth from "@/utils/auth";
import store from "@/store";
import Viewer from "@/views/Viewer";
import searchNotification from "@/views/settings/searchNotification";

// test
import FileFolders from "@/views/FileFolders";
// import Rules from '@/views/Rules'
import Security from "@/views/security/SecurityManagement";
// import AdminManager from '@/views/AdminManager'
// import Statistic from '@/views/Statistic'
import InlineViewer from "@/views/InlineViewer";
import OnlineEdit from "@/views/OnlineEdit.vue";

// import MGTask from '@/utils/MGTask.js'
import mgCheck from "@/utils/MGCheckLogin";
// import { SSL_OP_EPHEMERAL_RSA } from 'constants';

Vue.use(Router);

const Login = () =>
  System.import(/* webpackChunkName: "login" */ "@/views/LoginWrapper");
const Files = () =>
  System.import(/* webpackChunkName: "files" */ "@/views/Files");
const Rules = () =>
  System.import(/* webpackChunkName: "rules" */ "@/views/settings/Rules");
const ExternalSearch = () =>
  System.import(/* webpackChunkName: "exsearch" */ "@/views/ExternalSearch");
const Property = () =>
  System.import(/* webpackChunkName: "property" */ "@/views/Property");
const UserGroup = () =>
  System.import(/* webpackChunkName: "usergroup" */ "@/views/UserGroup");
const Draft = () =>
  System.import(/* webpackChunkName: "draft" */ "@/views/Draft");

const router = new Router({
  base:
    process.env.NODE_ENV !== "production"
      ? ""
      : document.querySelector('meta[name="webbase"]').getAttribute("content"),
  // base: document.querySelector('meta[name="base"]').getAttribute('content'),
  // mode: 'history',
  routes: [
    {
      path: "/login",
      name: "Login",
      component: Login,
      beforeEnter: function (to, from, next) {
        auth
          .loggedIn()
          .then(() => {
            next({ path: "/files" });
          })
          .catch(() => {
            document.title = "Login";
            next();
          });
      }
    },
    {
      path: "/",
      redirect: {
        name: "Files"
      }
    },
    {
      path: "/files",
      redirect: {
        name: "Files"
      }
    },
    {
      path: "/onlineedit/*",
      name: "OnlineEdit",
      component: OnlineEdit,
      meta: {
        requiresAuth: true,
        requiresAdmin: false
      }
    },
    {
      path: "/viewer/*",
      name: "Viewer",
      component: Viewer
    },
    {
      path: "/viewer",
      component: Error404
    },
    {
      path: "/files/*",
      component: Layout,
      meta: {
        requiresAuth: true
      },
      children: [
        {
          path: "/files/*",
          name: "Files",
          component: Files
        }
      ]
    },
    {
      path: "/search",
      name: "search",
      component: ExternalSearch
    },
    {
      path: "/disconnect",
      name: "disconnect",
      component: ErrorDisconnect
    },
    {
      path: "/403",
      name: "Forbidden",
      component: Error403
    },
    {
      path: "/searchNotification",
      name: "searchNotification",
      component: searchNotification
    },
    {
      path: "/404",
      meta: {
        requiresAuth: false
      },
      name: "Not Found",
      component: Error404
    },
    {
      path: "/500",
      name: "Internal Server Error",
      component: Error500
    },
    {
      path: "/AgentInstallError",
      meta: {
        requiresAuth: false
      },
      name: "Agent Error",
      component: ErrorAgent
    },
    {
      path: "/permissionError",
      meta: {
        requiresAuth: false
      },
      name: "Permission Error",
      component: ErrorPermission
    },
    {
      path: "/comp",
      component: EmptyLayout,
      meta: {
        requiresAuth: true
      },
      children: [
        {
          path: "viewer",
          name: "InlineViewer",
          component: InlineViewer
        },
        {
          path: "usergroup",
          name: "UserGroup",
          component: UserGroup
        },
        {
          path: "property",
          name: "Property",
          component: Property
        },
        {
          path: "FileFolders",
          name: "FileFolders",
          component: FileFolders
        },
        {
          path: "rules",
          name: "Rules",
          component: Rules
        },
        {
          path: "draft",
          name: "Draft",
          component: Draft
        },
        {
          path: "security",
          name: "Security",
          component: Security
        }
      ]
    },

    {
      path: "*",
      redirect: {
        // 20180818, 정의되지 않은 path는 무조건 files 표시, 3.5 와 호환이 안되므로
        name: "Files"
      }
    }
  ]
});

var validateHandle = null;
var maximunCall = 0;
router.beforeEach((to, from, next) => {
  console.log(to.meta)
  if (to.meta.requiresAuth === false) {
    console.log("NEXT");
    clearInterval(validateHandle);
    next();
    return false;
  }

  document.title = to.name;

  console.log("================> ", to.fullPath);

  function currentNext() {
    console.log("success callback called");
    //let home = store.state.user.homeUrl || constants.DEFAULT_HOME
    let home = constants.DEFAULT_HOME;
    //3.5 호환 유지 (homePage 설정이 3.5에서 이미 된 사용자는 4.0에서 3.5url을 호출하여 404 오류 발생)
    if (home.startsWith("/page/")) home = constants.DEFAULT_HOME;

    let redirectQuery = "";
    const queryStrings = getQueryString(window.location);

    if (queryStrings.redirect) {
      redirectQuery = decodeURIComponent(queryStrings.redirect);
    } else {
      redirectQuery = location.href.replace(location.origin, "").replace(/^\/\#/g, "");
    }

    if (redirectQuery === "/" || redirectQuery === "/login" || !redirectQuery) {
      redirectQuery = home
    };

    router.push({ path: redirectQuery });
  }

  if (validateHandle == null) {
    let interval = 60 * 1000;
    if (
      store.state.info.features &&
      store.state.info.features.validationInterval
    )
      interval = store.state.info.features.validationInterval * 1000;

    (async () => {
      await validate(to, currentNext)
        .then(() => {
          next();
        })
        .catch(error => {
          console.error("logincheck fail :" + error);
          redirectLoginPage();
        });
    })();

    validateHandle = setInterval(() => {
      if (maximunCall > Utils.featuresDefault("webSocketMaximunCall", 20)) {
        redirectLoginPage();
        return false;
      }
      validate()
        .then(() => {
          maximunCall = 0;
          next();
        })
        .catch(() => {
          maximunCall++;
          redirectLoginPage();
        });
    }, interval);
  } else {
    next();
  }
});

async function validate(to, successCallback = function () {
  console.log("SUCCESS ")
}) {
  let promise = auth.loggedIn();
  promise
    .then(() => {
      if (to && to.matched.some(record => record.meta.requiresAdmin)) {
        if (!store.state.user.isAdmin) {
          router.push({ path: "/403" });
          return;
        }
      }
    })
    .catch(e => {
      try {
        Utils.deleteCookie("auth");
      } catch (error) {
        console.log("cookie: " + error);
      }
      let status = Utils.featuresDefault("useMGLogin", false);
      let lgUplus = Utils.featuresDefault("websocket.LGUplus.login", false);
      if (status) {
        // vue.$openLoading();
        if (lgUplus) {
          mgCheck.WgearCallLogin(successCallback, redirectLoginPage);
          //mgCheck.lgUplusCheckLogin(successCallback, redirectLoginPage);
        } else {
          mgCheck.checkLoginMG(successCallback, redirectLoginPage);
        }
      }
    });
  return promise;
}

function redirectLoginPage() {
  let redirectQuery = "";
  const queryStrings = getQueryString(window.location);

  if (queryStrings.redirect) {
    redirectQuery = decodeURIComponent(queryStrings.redirect);
  } else {
    redirectQuery = location.href.replace(location.origin, "").replace(/^\/\#/g, "");
  }

  if (redirectQuery === "/" || redirectQuery === "/login" || !redirectQuery) {
    redirectQuery = null
  };

  console.log(redirectQuery)

  router.push({
    path: Utils.features("redirectLoginPage") || "/login",
    //path: '/login',
    query: redirectQuery ? { redirect: redirectQuery } : {}
  });
  if (validateHandle) {
    clearInterval(validateHandle);
  }
}

function getQueryString(location) {
  let uri = location.href.split('?');
  const getVars = {};
  if (uri.length == 2) {
    let vars = uri[1].split('&');
    let tmp = '';
    vars.forEach(function (v) {
      tmp = v.split('=');
      if (tmp.length == 2)
        getVars[tmp[0]] = tmp[1];
    });
  }
  return getVars;
}

export default router;
