import auth from "@/utils/auth";

var soc = null;
var success = function () { };
var fail = function () { };

var Actions = {
  checkLogin: 1,
  OpenDoc: 2,
  VFDocOpen: 3,
  TripleDEScheckLogin: 5,
  LGUplus: 6,
  properties: {
    1: { action: "isMyGuardRunning", mode: "1" },
    2: { action: "isDocOpen", key: "A", mode: "W", object_id: "" },
    3: {
      action: "VFDocOpen",
      system: "1",
      key: "A",
      mode: "W",
      object_id: "",
      local_file: ""
    },
    4: {
      action: "VFDocOpen",
      system: "1",
      key: "A",
      mode: "R",
      object_id: "",
      local_file: ""
    },
    5: { action: "isMyGuardRunning", mode: "1", opt: "1" }
  }
};
var websocket;
var currentAction = Actions.checkLogin;

function checkLoginMG(successFunc, failFunc) {
  //open socket
  try {
    if ("WebSocket" in window) {
      let httpAddr = Utils.featuresDefault("websocket.addr", "ws://127.0.0.1:9480/VF");
      let httpsAddr = Utils.featuresDefault("websocket.httpsAddr", "wss://127.0.0.1:443/VF");
      let outSide = Utils.featuresDefault('logout.outSide', false);
      let addr = httpAddr;
      if (location.protocol == 'https:' && outSide) {
        addr = httpsAddr;
      }
      websocket = new WebSocket(addr);

      //attach event handlers
      websocket.onopen = function (evt) {
        checkLogin();
      };
      websocket.onclose = function (evt) { };

      success = successFunc;
      fail = failFunc;

      websocket.onmessage = onMessage;
      websocket.onerror = function (evt) {
        console.error("websocket connection error");
      };
    } else {
      console.error("websocket init error");
    } // end if
  } catch (err) {
  }
}

//wgear 요청
function WgearCallLogin() {
  var module = "Win32Util";
  var wgear = new WGear(function (s) {
    if (s == 'open') {
      wgear.callback.exec(Wsuccess, Wfail, module, "GetCurrentAccountName")
    }

    function Wsuccess(result) {
      var userID = result.split("\\");
      let checkTimeout = Utils.featuresDefault("VFUSER_TIMEOUT", "86400");
      Utils.setCookie("VFUSER", userID[1], checkTimeout, store.state.baseURL);
      store.commit('setLGUSER', userID[1].toUpperCase());
      lgUplusCheckLogin(function () { }, function () { });
    }

    function Wfail(e) {
      alert("FAIL : 사용자 정보 조회에 실패 하였습니다.");
    }

  })
}

function LGUPLUS_redirectLoginPage() {
  router.push({
    path: "/login"
  });
}

//LGU+ 요청 webscoket
function lgUplusCheckLogin(successFunc, failFunc) {
  //open socket
  if ("WebSocket" in window) {
    let addr = Utils.featuresDefault("websocket.addr", "ws://127.0.0.1:9480/VF");
    websocket = new WebSocket(addr);

    //attach event handlers
    websocket.onopen = function (evt) {
      checkLoginLGUplus();
    };
    websocket.onclose = function (evt) { };

    success = successFunc;
    fail = failFunc;

    websocket.onmessage = onMessage;
    websocket.onerror = function (evt) {
      console.error("websocket connection error");
      fail();
    };
  } else {
    console.error("websocket init error");
    fail();
  } // end if
}
//
function checkLoginLGUplus() {
  let requestData = { action: "getUserPort", userid: store.state.LGUplusUSERID }
  sendMessage(Actions.LGUplus, requestData);
}

// 응답 메시지 처리
function onMessage(evt) {
  console.log(evt);
  var message = JSON.parse(evt.data);
  console.log(message);
  console.log(currentAction);
  switch (currentAction) {
    case Actions.checkLogin:
      if (!message.errcode || message.errcode != "0") {
        // error
        console.error("mg check returned fail : " + message.errmsg);
        closeSocket(true);
        fail();
      } else {
        let checkTimeout = Utils.featuresDefault("VFUSER_TIMEOUT", "86400");
        Utils.setCookie("VFUSER", message.userid, checkTimeout, store.state.baseURL);
        auth
          .MGLogin(message.userid)
          .then(data => {
            closeSocket();
            // location.href="/files";
            success(data);
          })
          .catch(err => {
            console.error(err);
            closeSocket();
            fail();
          });
      }
      break;
    case Actions.LGUplus:
      console.log("LGU+");
      console.log(message);
      if (!message.errcode || message.errcode != "0") {
        // error
        console.error("lgU+ check returned fail : " + message.errmsg);
        closeSocket(true);
        fail();
      } else {
        console.log("LG U+ 로그인 성공");
        store.commit('setLGUplus', message.userPort)
        auth.MGLogin(store.state.LGUplusUSERID).then(data => {
          closeSocket();
          success(data);
        })
          .catch(err => {
            console.error(err);
            closeSocket();
            fail();
          });

      }
      break;
    case Actions.TripleDEScheckLogin:
      console.log("2factor");
      if (!message.errcode || message.errcode != "0") {
        // error
        console.error("mg check returned fail : " + message.errmsg);
        closeSocket(true);
        fail();
      } else {
        console.log(message.userid);
        let checkTimeout = Utils.featuresDefault("VFUSER_TIMEOUT", "86400");
        Utils.setMgCookie("VFUSER", message.userid, store.state.baseURL);
        console.log("쿠키 세팅");
        auth
          .MGLogin(message.userid)
          .then(data => {
            closeSocket();
            // location.href="/files";
            success(data);
          })
          .catch(err => {
            console.error(err);
            closeSocket();
            fail();
          });
      }
      break;
  }
}

function closeSocket() {
  //websocket.close();
}

function connectionSocket(successFunc, failFunc, action, msg) {
  if ("WebSocket" in window) {
    let httpAddr = Utils.featuresDefault("websocket.addr", "ws://127.0.0.1:9480/VF");
    let httpsAddr = Utils.featuresDefault("websocket.httpsAddr", "wss://127.0.0.1:443/VF");
    let addr = httpAddr;

    if (location.protocol == 'https:') {
      addr = httpsAddr;
    }

    websocket = new WebSocket(addr);
    //attach event handlers
    websocket.onopen = function (evt) {
      sendMessage(action, msg);
    };
    websocket.onclose = function (evt) {
      //websocket.close();
    };

    success = successFunc;
    fail = failFunc;

    websocket.onmessage = onMessage;
    websocket.onerror = function (evt) {
      console.error("websocket connection error");
      fail();
      closeSocket();
    };
  } else {
    console.error("websocket init error");
  }
}

function connectionSocketLGUplus(successFunc, failFunc, action, msg) {
  if ("WebSocket" in window) {
    let websocketURL = "ws://127.0.0.1:9480/VF"
    if (store.state.LGUplus != '') {
      websocketURL = "ws://127.0.0.1:" + store.state.LGUplus + "/VF";
    }
    let addr = websocketURL;
    console.log(addr);
    websocket = new WebSocket(addr);
    //attach event handlers
    websocket.onopen = function (evt) {
      console.log(msg);
      sendMessage(action, msg);
    };
    websocket.onclose = function (evt) {
      //websocket.close();
    };

    success = successFunc;
    fail = failFunc;

    websocket.onmessage = onMessage;
    websocket.onerror = function (evt) {
      console.error("websocket connection error");
      fail();
      closeSocket();
    };
  } else {
    console.error("websocket init error");
  }
}

function sendMessage(action, message) {
  currentAction = action;
  console.log(message);
  console.log(JSON.stringify(message));
  websocket.send(JSON.stringify(message));
}

function checkLogin() {
  //외부망이면, 대림만의 적용 옵션
  let outState = store.state.info.isOutsideSubnet || false;
  let twoFactor = Utils.featuresDefault("twoFactorLogin.check", false);
  if (outState && twoFactor) {
    sendMessage(
      Actions.TripleDEScheckLogin,
      Actions.properties[Actions.TripleDEScheckLogin]
    );
  } else {
    sendMessage(Actions.checkLogin, Actions.properties[Actions.checkLogin]);
  }
}

function isInstalled() {
  sendMessage(Actions.IsInstalled, Actions.properties[Actions.IsInstalled]);
  closeSocket();
}
function isDocOpen(elementId) {
  var message = Actions.properties[Actions.IsDocOpen];
  message.object_id = elementId;
  sendMessage(Actions.IsDocOpen, message);
}
function openDoc(successFunc, failFunc, elementId, localPath, mode) {
  if (mode == "R") {
    var message = Actions.properties[4];
    message.object_id = elementId;
    message.local_file = localPath;
    console.log(store.state.LGUplus);
    if (store.state.LGUplus != '') {
      connectionSocketLGUplus(successFunc, failFunc, Actions.VFDocOpen, message);
    } else {
      connectionSocket(successFunc, failFunc, Actions.VFDocOpen, message);
    }
  } else if (mode == "W") {
    var message = Actions.properties[3];
    message.object_id = elementId;
    message.local_file = localPath;
    console.log(store.state.LGUplus);
    if (store.state.LGUplus != '') {
      connectionSocketLGUplus(successFunc, failFunc, Actions.VFDocOpen, message);
    } else {
      connectionSocket(successFunc, failFunc, Actions.VFDocOpen, message);
    }
  }
}

export default {
  checkLoginMG: checkLoginMG,
  openDoc: openDoc,
  lgUplusCheckLogin: lgUplusCheckLogin,
  WgearCallLogin: WgearCallLogin
};
