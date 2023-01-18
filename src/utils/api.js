import store from "@/store";
import axios from "axios";
import router from "@/router";

const ssl = window.location.protocol === "https:";

export const URLS = {
  INDEX_SEARCH: "/json/searchDoc",
  FULL_SEARCH: "/json/searchFullDoc",
  OVERLAP_SEARCH: "/json/searchDuplicateDoc"
};

export function getFullUrl(url) {
  return `${store.state.baseURL}${url}`;
}

// export function removePrefix (url) {
//   let search = store.state.baseURL + '/files'
//   if (url.startsWith(search)) {
//     url = url.substr(search.length)
//   }

//   if (url === '') url = '/'
//   if (url[0] !== '/') url = '/' + url
//   return url
// }

export function toLogin() {
  router.push({ path: "/login", query: { redirect: vue.$route.fullPath } });
}

// general get
export function get(url, params = "", withNoty = true) {
  return new Promise((resolve, reject) => {
    ax()
      .get(store.state.baseURL + url, { params: params })
      .then(response => {
        if (response.data.errcode && response.data.errcode != "0") {
          // -100 is expired session
          if (response.data.errcode == -100) {
            api.toLogin();
            return;
          }
          if (withNoty) vue.$showError("" + response.data.errmsg);
          reject(response.data);
          return;
        }
        resolve(response.data);
      })
      .catch(error => {
        console.log(error);
        if (error.response && error.response.status == 401) {
          api.toLogin();
          return;
        }
        if (error.response.data && error.response.data.length < 500) {
          if (withNoty) vue.$showError(error.response.data);
          reject("" + error.response.data);
          return;
        }
        if (error.response.status == 500) {
          if (withNoty) vue.$showError(i18n.t("errors.internal"));
          reject(i18n.t("errors.internal"));
        }
      });
  });
}

export function post2(
  url,
  content = "",
  contentType = "application/json",
  withNoty = true
) {
  return new Promise((resolve, reject) => {
    ax(contentType)
      .post(store.state.baseURL + url, content)
      .then(response => {
        if (response.data.errcode && response.data.errcode != "0") {
          // -100 is expired session
          if (response.data.errcode == -100) {
            api.toLogin();
            return;
          }
          if (withNoty) vue.$showError("" + response.data.errmsg);
          reject(response.data);
          return;
        }
        resolve(response.data);
      })
      .catch(error => {
        console.log(error);
        if (error.response.status == 401) {
          api.toLogin();
          return;
        }
        if (error.response.data && error.response.data.length < 500) {
          if (withNoty) vue.$showError(error.response.data);
          reject("" + error.response.data);
          return;
        }
        if (error.response.status == 500) {
          if (withNoty) vue.$showError(i18n.t("errors.internal"));
          reject(i18n.t("errors.internal"));
        }
      });
  });
}

export function postUrl(url, content = "", withNoty = true) {
  return post2(
    url,
    content,
    "application/x-www-form-urlencoded; charset=UTF-8",
    withNoty
  );
}

export function postForm(url, data) {
  var bodyFormData = new FormData();

  for (let field in data) {
    bodyFormData.set(field, data[field]);
  }

  return new Promise((resolve, reject) => {
    ax("multipart/form-data")
      .post(url, bodyFormData)
      .then(response => {
        if (response.data.errcode != "0") {
          // -100 is expired session
          if (response.data.errcode == -100) {
            api.toLogin();
            return;
          }
          reject(response.data);
          return;
        }
        resolve(response.data);
      })
      .catch(error => {
        console.log(error);
        if (error.response.data) {
          if (withNoty) vue.$showError(error.response.data);
          else reject(error.response.data);
        }
      });
  });
}

export function searchIndex(data, page, pageSize, sort) {
  return searchService(URLS.INDEX_SEARCH, data, page, pageSize, sort);
}

export function getExpiredFileFolderList(
  object_id,
  pageNum,
  pageSize,
  orderBy,
  dir,
  type
) {
  return get(
    `/service/expired?folderId=${object_id}&page=${pageNum}&pageSize=${pageSize}&type=${type}&orderBy=${orderBy}&dir=${dir}&moreData=true&ver4=true`
  );
}

export function searchFull(data, page, pageSize) {
  return searchService(URLS.FULL_SEARCH, data, page, pageSize);
}

export function searchService(url, data, page, pageSize, sort) {
  // return get(`${store.state.baseURL}/json/searchDoc?param=${data}&page=${page}&pageSize=${pageSize}`)
  let content = new Object();
  content.param = JSON.stringify(data);
  content.page = page;
  content.pageSize = pageSize;
  content.moreData = "true";

  if (sort && sort.sort && sort.desc) {
    content.orderBy = sort.sort;
    content.dir = sort.desc;
  }
  return postUrl(url, jQuery.param(content));
}

export function searchDuplicate(url, data, page, pageSize) {
  let content = new Object();
  if (data.elementId) {
    content.elementId = data.elementId;
  }
  if (data.elementName) {
    content.elementName = data.elementName;
  }
  content.page = page;
  content.pageSize = pageSize;
  return get(url, content);
}

// get context menu
export function getMenu(id, currentDir) {
  // TODO: 여러건에 대한 context menu 액션을 정확히 정하지 않았음
  let from = currentDir || store.state.rootId;
  let eid = encodeURIComponent(id);
  if (Array.isArray(id)) id = id.join(",");
  return get(`/json/contextMenu?srcId=${eid}&from=${from}`, false);
}

// create folder
export function createFolder(
  id,
  name,
  descr,
  isBundle = false,
  withNoty = true
) {
  return get(
    `/json/createFolder`,
    {
      folderId: id,
      folderName: name.trim(),
      description: descr,
      bundle: isBundle,
      from: store.state.rootId
    },
    withNoty
  );
}
// make new file
export function createTempleteDoc(
  id,
  name,
  type,
  overwrite,
  allowRename,
  from
) {
  return get(
    `/json/createTempleteDoc`,
    {
      folderId: id,
      fileName: name.trim(),
      fileType: type,
      overwrite: overwrite,
      allowRename: allowRename,
      from: from
    },
    false
  );
}

// it can delete file
export function remove(items) {
  return get(
    `/json/deleteFolderAsync?folderId=${items}&from=${store.state.rootId}`
  );
}

export function rename(object_id, newname) {
  return get(`/json/renameDoc`, {
    docId: object_id,
    newName: newname.trim(),
    from: store.state.rootId
  });
}

export function bookmarkRename(object_id, newname) {
  return get(`/json/modifyBookmark`, { srcId: object_id, title: newname });
}

export function post(url, content = "", overwrite = false, onupload) {
  //url = removePrefix(url)

  return new Promise((resolve, reject) => {
    let request = new window.XMLHttpRequest();
    request.open("POST", `${url}`, true);
    request.setRequestHeader(
      "Authorization",
      `Bearer ${Utils.getCookie("auth")}`
    );
    request.setRequestHeader("Content-Type", "application/json");
    if (typeof onupload === "function") {
      request.upload.onprogress = onupload;
    }

    if (overwrite) {
      request.setRequestHeader("Action", `override`);
    }

    request.onload = () => {
      if (request.status === 200) {
        resolve(request.responseText);
      } else if (request.status === 409) {
        reject(request.status);
      } else {
        reject(request.responseText);
      }
    };

    request.onerror = error => {
      reject(error);
    };
    request.send(content);
  });
}

// export function put (url, content = '', publish = false, date = '') {
//   url = removePrefix(url)

//   return new Promise((resolve, reject) => {
//     let request = new window.XMLHttpRequest()
//     request.open('PUT', `${store.state.baseURL}/api/resource${url}`, true)
//     request.setRequestHeader('Authorization', `Bearer ${store.state.jwt}`)
//     request.setRequestHeader('Publish', publish)

//     if (date !== '') {
//       request.setRequestHeader('Schedule', date)
//     }

//     request.onload = () => {
//       if (request.status === 200) {
//         resolve(request.responseText)
//       } else {
//         reject(request.responseText)
//       }
//     }

//     request.onerror = (error) => reject(error)
//     request.send(content)
//   })
// }

function moveCopy(items, target, move = false, type, newOwner = null) {
  var item = "";
  var cnt = items.length;
  for (var i = 0; i < cnt; i++) {
    item += items[i];
    if (i < cnt) {
      item += ",";
    }
  }
  // type 별 파라미터 변경
  let typeURL = "&overwrite=false";
  if (type == "overwrite") {
    typeURL = "&overwrite=true";
  } else if (type == "allowRename") {
    typeURL += "&allowRename=true";
  } else if (type == "skipfile") {
    typeURL += "&isSkip=true";
  }
  newOwner = newOwner ? "&owner=" + newOwner : "";
  return get(
    `/json/moveOrCopyAsync?srcId=${item}&targetId=${target}&isMove=${move}` +
      newOwner +
      typeURL
  );
}

export function move(items, target, type, newOwner = null, isCommand = false) {
  console.log("MOVE EVENT");
  if (!isCommand) {
    if (store.state.moveTableEnabled) {
      var tv = $("#treeview").data("kendoTreeView");
      var selectedDataItem = tv.dataItem(
        tv.findByUid(store.state.moveTableList)
      );
      selectedDataItem.loaded(false);
    } else {
      $("#treeview")
        .data("kendoTreeView")
        .findByUid(store.state.moveTreeList)
        .remove();
    }
  }
  return moveCopy(items, target, true, type, newOwner);
}

export function delegation(
  items,
  target,
  type,
  newOwner = null,
  isCommand = false
) {
  console.log("MOVE EVENT");
  if (!isCommand) {
    $("#treeview")
      .data("kendoTreeView")
      .findByUid(store.state.moveTreeList)
      .remove();
  }
  return moveCopy(items, target, true, type, newOwner);
}

export function copy(items, target, type) {
  console.log("COPY EVENT");
  return moveCopy(items, target, false, type);
}
export function checkout(object_id) {
  return get(`/json/checkout?docId=${object_id}`);
}
export function cancelCheckout(object_id) {
  return get(`/json/checkoutCancel?docId=${object_id}`);
}
export function getDocHistory(object_id) {
  return get(`/json/getHistory?docId=${object_id}&skip=0&page=1&pageSize=30`);
}

export function getDocVersion(object_id) {
  return get(
    `/json/getVersion?docId=${object_id}&page=1&pageSize=60&from=${
      store.state.rootId
    }`
  );
}

export function revertDocs(object_id, s3versionId) {
  return get(
    `/json/restoreVersion?versionId=${object_id}&from=${
      store.state.rootId
    }&s3versionId=${s3versionId}`
  );
}

// export function checksum (url, algo) {
//   url = removePrefix(url)

//   return new Promise((resolve, reject) => {
//     let request = new window.XMLHttpRequest()
//     request.open('GET', `${store.state.baseURL}/api/checksum${url}?algo=${algo}`, true)
//     request.setRequestHeader('Authorization', `Bearer ${store.state.jwt}`)

//     request.onload = () => {
//       if (request.status === 200) {
//         resolve(request.responseText)
//       } else {
//         reject(request.responseText)
//       }
//     }
//     request.onerror = (error) => reject(error)
//     request.send()
//   })
// }

// export function command (url, command, onmessage, onclose) {
//   let protocol = (ssl ? 'wss:' : 'ws:')
//   url = removePrefix(url)
//   url = `${protocol}//${window.location.host}${store.state.baseURL}/api/command${url}`

//   let conn = new window.WebSocket(url)
//   conn.onopen = () => conn.send(command)
//   conn.onmessage = onmessage
//   conn.onclose = onclose
// }

// export function search (url, search, onmessage, onclose) {
//   let protocol = (ssl ? 'wss:' : 'ws:')
//   url = removePrefix(url)
//   url = `${protocol}//${window.location.host}${store.state.baseURL}/api/search${url}`

//   let conn = new window.WebSocket(url)
//   conn.onopen = () => conn.send(search)
//   conn.onmessage = onmessage
//   conn.onclose = onclose
// }

export function getSettings() {
  return new Promise((resolve, reject) => {
    let request = new window.XMLHttpRequest();
    request.open("GET", `${store.state.baseURL}/api/settings/`, true);
    request.setRequestHeader("Authorization", `Bearer ${store.state.jwt}`);

    request.onload = () => {
      switch (request.status) {
        case 200:
          resolve(JSON.parse(request.responseText));
          break;
        default:
          reject(request.responseText);
          break;
      }
    };
    request.onerror = error => reject(error);
    request.send();
  });
}

export function updateSettings(param, which) {
  return new Promise((resolve, reject) => {
    let data = {
      what: "settings",
      which: which,
      data: {}
    };

    data.data[which] = param;

    let request = new window.XMLHttpRequest();
    request.open("PUT", `${store.state.baseURL}/api/settings/`, true);
    request.setRequestHeader("Authorization", `Bearer ${store.state.jwt}`);

    request.onload = () => {
      switch (request.status) {
        case 200:
          resolve();
          break;
        default:
          reject(request.responseText);
          break;
      }
    };
    request.onerror = error => {
      reject(error);
    };
    request.send(JSON.stringify(data));
  });
}

export function getFileFolderListLight(
  object_id,
  pageNum,
  pageLineCount,
  type
) {
  if (type == "inShare" || type == "receivedShare") {
    return get(
      `/json/getFileFolderListLight?folderId=${object_id}&pageNum=${pageNum}&pageLineCount=${pageLineCount}&type=${type}&r_folder_type=inShare`
    );
  } else {
    return get(
      `/json/getFileFolderListLight?folderId=${object_id}&pageNum=${pageNum}&pageLineCount=${pageLineCount}&type=${type}`
    );
  }
}

export function getFileFolderList(
  object_id,
  pageNum,
  pageSize,
  orderBy,
  dir,
  type
) {
  let returnVal = "";
  if (type == "inShare" || type == "receivedShare") {
    returnVal = get(
      `/json/getFileFolderList?folderId=${object_id}&page=${pageNum}&pageSize=${pageSize}&type=${type}&orderBy=${orderBy}&dir=${dir}&moreData=true&ver4=true&r_folder_type=inShare`
    );
  } else {
    returnVal = get(
      `/json/getFileFolderList?folderId=${object_id}&page=${pageNum}&pageSize=${pageSize}&type=${type}&orderBy=${orderBy}&dir=${dir}&moreData=true&ver4=true`
    );
  }
  returnVal.then(res => {
    if (
      object_id === "carryout" &&
      type === "carryout" &&
      store.state.isCarryout
    ) {
      let list = res.list;
      let carryoutList = [];
      console.log(list);
      for (let i = 0; i < list.length; i++) {
        carryoutList.push(list[i].r_object_id);
      }
      store.commit("setCarryoutList", carryoutList);
    }
  });

  return returnVal;
}

export function getFolderList(
  object_id,
  pageNum,
  pageSize,
  orderBy,
  dir,
  type
) {
  return get(
    `/json/getFileFolderList?folderId=${object_id}&page=${pageNum}&pageSize=${pageSize}&type=${type}&orderBy=${orderBy}&dir=${dir}&moreData=true&ver4=true&isFolder=true`
  );
}

// USERS

export function getUser(id) {
  return get(`/json/getUser?userName=${id}`);
}

export function deleteUser(userName) {
  return get(`/json/removeUser?userName=${userName}`);
}

export function deleteGroup(groupId) {
  return get(`/json/deleteGroup?groupId=${groupId}`);
}

export function getMembersString(members) {
  let users = [];
  let groups = [];
  members.forEach(field => {
    if (field.type == -1) users.push(field.id);
    else groups.push(field.id);
  });

  let userIds = users.join(",");
  let groupIds = groups.join(",");

  return { userIds: userIds, groupIds: groupIds };
}

export function createGroup(parentId, name, desc) {
  //let DATA = `parentId=${parentId}&name=${name}&desc=${desc}&type=0&create=true`
  return get(`/json/addGroup`, {
    parentId: parentId,
    name: name,
    desc: desc,
    create: true
  });
}

export function assignMembers(parentId, members) {
  let ids = getMembersString(members);
  //let DATA = `parentGroupId=${parentId}&userIds=${ids.userIds}&groupIds=${ids.groupIds}`
  return get(`/json/addChildrenToGroup`, {
    parentGroupId: parentId,
    userIds: ids.userIds,
    groupIds: ids.groupIds
  });
}

export function unassignMembers(parentId, name, type) {
  let ids = getMembersString([{ id: name, type: type }]);
  return get(
    `/json/removeChildrenFromGroup?parentGroupId=${parentId}&userIds=${
      ids.userIds
    }&groupIds=${ids.groupIds}`
  );
}

export function getProgressStatus(actionId) {
  return get(`/json/action/getStatus?actionId=${actionId}`, "", false);
}

export function cancelProgress(actionId) {
  return get(`/json/action/cancel?actionId=${actionId}`, "", false);
}
// SHARE
export function createURLShare(
  object_id,
  version,
  isUrl = true,
  form = '{"privs":null}',
  count,
  expired
) {
  return post(
    `${
      store.state.baseURL
    }/service/share/create?elementId=${object_id}&version=${version}&url=${isUrl}&count=${count}&expired=${expired}`,
    form
  );
}

export function createURLShareAnonymous(
  object_id,
  version,
  isUrl = true,
  form = '{"privs":null}',
  count,
  expired
) {
  return post(
    `${
      store.state.baseURL
    }/service/share/create?elementId=${object_id}&version=${version}&url=${isUrl}&count=${count}&expired=${expired}&anonymous=true`,
    form
  );
}

export function createShare(
  object_id,
  version,
  isUrl = true,
  form = '{"privs":null}'
) {
  return post2(
    `/service/share/create?elementId=${object_id}&version=${version}&url=${isUrl}`,
    form
  );
}

export function createURLShareWithExpired(
  object_id,
  version,
  expired,
  count,
  isUrl = true
) {
  return post(
    `${
      store.state.baseURL
    }/service/share/create?elementId=${object_id}&expired=${expired}&count=${count}&version=${object_id}&url=${isUrl}`,
    '{"privs":null}'
  );
}

export function deleteURLShare(object_id, isUrl = true) {
  return get(`/service/share/delete?elementId=${object_id}&url=${isUrl}`);
}
export function getURLShareInfo(object_id, isUrl = true) {
  return get(`/service/share/get?elementId=${object_id}&url=${isUrl}`);
}

export function addBookmark(object_id, type) {
  return get(`/json/addBookmark?srcId=${object_id}&type=${type}`, "", true);
}

export function nameAddBookmark(object_id, type, title) {
  let data = encodeURIComponent(title);
  return get(
    `/json/addBookmark?srcId=${object_id}&type=${type}&title=${data}`,
    "",
    true
  );
}

export function removeBookmark(object_id) {
  return get(`/json/deleteBookmark?srcId=${object_id}`);
}

export function getSecurityPolicy() {
  return get(`/json/getSecurityProfiles`);
}
export function getDocSecurityRights(object_id) {
  return get(`/json/getRights?elementId=${object_id}`, "", false);
}

export function getDocInfo(object_id, permission = false) {
  return get(
    `/json/getDocument?docId=${object_id}&permission=${permission}&from=${
      store.state.rootId
    }`
  );
}

export function zipCompress(items, folderId, targetName, password) {
  return get(`/json/zipAsync`, {
    docId: items,
    folderId: folderId,
    targetName: targetName,
    password: password
  });
}
export function zipDeCompress(items, targetId, targetName, password) {
  return get(`/json/unzipAsync`, {
    docId: items,
    folderId: targetId,
    targetName: targetName,
    password: password
  });
}
export function getGroupAndUser(groupid) {
  return get(`/json/listGroupAndUser?groupId=${groupid}&includeSystem=true`);
}
export function getGroup(groupid) {
  return get(`/json/getGroup?groupId=${groupid}`);
}

export function getDocConvertedUrl(object_id) {
  return get(`/service/viewer/inlineViewer?recordId=${object_id}`, "", false);
}

export function trashCleanup() {
  return get(`/json/deleteTrashAsync`);
}

export function getShareInfo(object_id) {
  return get(`/service/share/get`);
}

export function restoreFile(object_id, folderId = "", restoreLocation = "") {
  return get(
    `/json/restore?docId=${object_id}&selectedFolderId=${folderId}&restoreLocation=${restoreLocation}`
  );
}

export function expireFilePermanently(object_id) {
  return get(`/json/deletePermanently?docId=${object_id}`);
}

export function ax(contentType = null) {
  let headers = {};
  headers = { Authorization: `Bearer ${Utils.getCookie("auth")}` };
  if (contentType) headers["Content-Type"] = contentType;
  headers["Pragma"] = "no-cache";
  return axios.create({
    //    baseURL: store.state.baseURL,
    headers: headers,
    cache: false
  });
}

export function getElement(object_id) {
  return get(`/json/getDocument?docId=${object_id}&from=${store.state.rootId}`);
}

export function submitComment(object_id, comment) {
  return get(`/json/addComment`, { eId: object_id, content: comment });
}

export function getComment(object_id, page, pageSize) {
  return get(
    `/json/getComments?eId=${object_id}&page=${page}&pageSize=${pageSize}&dir=desc`
  );
}

export function deleteComment(object_id, comment_id) {
  return get(`/json/deleteComment?commentId=${comment_id}&eId=${object_id}`);
}

export function addRate(object_id, rate) {
  return get(`/json/addRating?eId=${object_id}&rating=${rate}`);
}

export function saveProperties(data, withNoty = true) {
  return postUrl(`/json/updateDocProperty`, jQuery.param(data), withNoty);
}

export function addTag(eId, tag, withNoty = true) {
  //tag = encodeURIComponent(tag)
  let data = { eId: eId, tag: tag, action: "add" };
  return postUrl(`/json/updateTagToElement`, jQuery.param(data), withNoty);
}

export function removeTag(eId, tagId, withNoty = true) {
  let data = { eId: eId, tag: tagId, action: "remove" };
  return postUrl(`/json/updateTagToElement`, jQuery.param(data), withNoty);
}

export function getTags(page, size) {
  return get(`/json/getTags?page=${page}&pageSize=${size}`, false);
}

// category
export function addCategoryToElement(eId, eclassId, multiple, withNoty = true) {
  let data = { eId: eId, eclassId: eclassId, action: "add", status: "single" };
  if (multiple) {
    data = { eId: eId, eclassId: eclassId, action: "add", status: "multiple" };
  }
  return postUrl(`/json/updateCategoryToElement`, jQuery.param(data), withNoty);
}

export function removeCategoryFromElement(
  eId,
  eclassId,
  multiple,
  withNoty = true
) {
  let data = {
    eId: eId,
    eclassId: eclassId,
    action: "remove",
    status: "single"
  };
  if (multiple) {
    data = {
      eId: eId,
      eclassId: eclassId,
      action: "remove",
      status: "multiple"
    };
  }
  return postUrl(`/json/updateCategoryToElement`, jQuery.param(data), withNoty);
}

// link
export function getLinks(id) {
  return get(`/json/getLink?eId=${id}`);
}

export function addLink(parentId, childId) {
  return get(`/json/createLink?parentId=${parentId}&childId=${childId}`);
}

export function removeLink(parentId, childId, linkFrom) {
  return get(
    `/json/deleteLink?parentId=${parentId}&childId=${childId}&linkFrom=${linkFrom}`
  );
}

export function getDocTypes() {
  return get(`/json/getEClasses`);
}

// update ext attributes
export function updateExtAttrs(elementId, attrList) {
  let data = {
    attrData: {
      docId: elementId,
      attrList: attrList
    }
  };
  return post2("/json/updateDocEx", JSON.stringify(data));
}
// remove ext attributes
export function removeExtAttrs(elementId) {
  return get(`/json/removeDocEx?elementId=${elementId}&attrName=p:hidden`);
}
export function analyzeFolder(elementId) {
  return get(`/service/analyze?folderId=${elementId}`);
}

export function getAcl(object_id) {
  return get(`/json/getRights?elementId=${object_id}`);
}

export function getPermissionList() {
  return get(`/json/getPermissionList`);
}

export function getPermissionGroups() {
  return get(`/json/getPermissionGroups`);
}

export function getTreeDataSource(url, modelId, modelHasChildren, modelData) {
  return new kendo.data.HierarchicalDataSource({
    transport: {
      read: {
        url: url,
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        beforeSend: function(req) {
          req.setRequestHeader(
            "Authorization",
            `Bearer ${Utils.getCookie("auth")}`
          );
        }
      }
    },
    schema: {
      model: {
        id: modelId,
        hasChildren: modelHasChildren
      },
      data: modelData
    }
  });
}

// drafting
export async function getDraftCommands() {
  let data = await get(`/json/approvalCommand`);
  let obj = data.list[0];
  let array = Object.keys(obj).map(key => {
    return { command: parseInt(key), title: obj[key] };
  });
  return array;
}
// 반려
export function rejectDraft(rewriteId, comment) {
  //comment = encodeURIComponent(comment)
  return get(`/json/returnItem`, { rewriteId: rewriteId, comment: comment });
}
// 회수
export function rollbackDraft(rewriteId, comment) {
  //comment = encodeURIComponent(comment)
  return get(`/json/recoveryItem`, { rewriteId: rewriteId, comment: comment });
}
// 승인자 정보 요청
export function listUserByElementId(elementId) {
  //comment = encodeURIComponent(comment)
  return get(`/json/listUserByElementId?elementId=${elementId}`);
}

// complete rewrite
export function rewrite(rewriteId, comment) {
  //comment = encodeURIComponent(comment)
  return get(`/json/approvalItem`, { rewriteId: rewriteId, comment: comment });
}

// draft init
export function draft(data) {
  // data.comment = encodeURIComponent(data.comment)
  // data.subject = encodeURIComponent(data.subject)
  return postUrl("/json/approval", jQuery.param(data));
}

export async function getRewriteInfo(rewriteId) {
  let data = await get(`/json/getRewrite?rewriteId=${rewriteId}`);
  return data.list[0];
}

export function setExecutionExOption(actionId, option) {
  return get(`/json/action/setExOptions?actionId=${actionId}&option=${option}`);
}

// 즉시 반출 처리 (관리자 등)
export function carryingOut(elementIds, authorId, start, expiry) {
  let elementsStr = "";
  if (Array.isArray(elementIds)) elementsStr = elementIds.join(",");
  else elementsStr = elementIds;
  return get(`/json/approval/exportBypass`, {
    elements: elementsStr,
    author: authorId,
    start: start,
    expiry: expiry
  });
}

//Admin
//User & Group
export function addEdituser(
  name,
  userName,
  password,
  email,
  groupIds,
  address,
  enabled,
  welcome,
  theme,
  mode,
  withNoty = true
) {
  let desc = "desc";
  let setGroupId = "";
  for (var i = 0; i < groupIds.length; i++) {
    if (i == groupIds.length - 1) {
      setGroupId += "" + groupIds[i].id + "";
    } else {
      setGroupId += "" + groupIds[i].id + ",";
    }
  }

  let crypto = require("crypto-js");
  let key = Utils.featuresDefault("security.key", null);
  let data = null;
  if (key) {
    data = {
      method: "AES",
      userName: userName,
      name: name,
      password: crypto.AES.encrypt(password, key).toString(),
      desc: desc,
      email: email,
      groupIds: setGroupId,
      address: address,
      enabled: enabled,
      mode: mode,
      welcome: welcome,
      theme: theme
    };
  } else {
    data = {
      userName: userName,
      password: password,
      name: name,
      desc: desc,
      email: email,
      groupIds: setGroupId,
      address: address,
      enabled: enabled,
      mode: mode,
      welcome: welcome,
      theme: theme
    };
  }

  //let data = {name : name, userName: encodeURIComponent(userName), desc: desc, password: password, email: email,groupIds: setGroupId,address: address,enabled: enabled, mode: mode}
  //console.log(data);
  return postUrl(`/json/addUser`, jQuery.param(data), withNoty);
}

export function createEditGroup(
  parentId,
  name,
  desc,
  create,
  managerId,
  type,
  elementid,
  withNoty = true
) {
  let data = {
    parentId: parentId,
    name: name,
    desc: desc,
    type: type,
    create: create,
    managerId: managerId,
    elementId: elementid
  };
  return postUrl(`/json/addGroup`, jQuery.param(data), withNoty);
}

export function settingVolume(volumeId, maxSize) {
  return get(`/json/updateVolume?volumeId=${volumeId}&maxSize=${maxSize}`);
}

//docType & category
export async function getContentClasslist() {
  return get(`/json/getEClasses`);
}

export async function getContentClass() {
  let data = await get(`/json/getAllCClassIds`);
  let array = Object.keys(data).map(key => {
    return { idx: parseInt(key), id: data[key], name: data[key] };
  });
  return array;
}

export function createEclass(parentId, eclassId, desc, withNoty = true) {
  let data = { parentId: parentId, eclassId: eclassId, desc: desc };
  return postUrl(`/json/createEclass`, jQuery.param(data), withNoty);
  //return get(`json/createEclass?parentId=${parentId}&eclassId=${eclassId}&desc=${desc}`);
}

export function deleteCategory(id) {
  return get(`/json/deleteCategory?eclassId=${id}`);
}

export async function getTemplates() {
  let data = await get(`/json/getTemplates`);
  let array = Object.keys(data).map(key => {
    return { idx: parseInt(key), id: data[key].id, name: data[key].name };
  });
  return array;
}

export function editDocType(
  id,
  description,
  retention,
  contentClassId,
  deadLine,
  templateId,
  withNoty = true
) {
  let data = {
    id: id,
    description: description,
    retention: retention,
    contentClassId: contentClassId,
    deadLine: deadLine,
    templateId: templateId
  };
  return postUrl(`/json/saveDocType`, jQuery.param(data), withNoty);
}

export function deleteDoc(id) {
  return get(`/json/deleteCategory?eclassId=${id}`);
}
//template
export function templateCreateEdit(
  templateid,
  name,
  desc,
  rule,
  withNoty = true
) {
  if (templateid == null) {
    let data = { name: name, desc: desc, rule: rule };
    return postUrl(`/json/addTemplate`, jQuery.param(data), withNoty);
  } else {
    let data = { templateid: templateid, name: name, desc: desc, rule: rule };
    return postUrl(`/json/addTemplate`, jQuery.param(data), withNoty);
  }
}

export function templateAttrCreateEdit(
  templateid,
  attrname,
  label,
  templatedesc,
  editor,
  mandatory,
  value,
  type,
  withNoty = true
) {
  let data = {
    templateid: templateid,
    attrname: attrname,
    label: label,
    templatedesc: templatedesc,
    editor: editor,
    mandatory: mandatory,
    value: value,
    type: type
  };
  return postUrl(`/json/addTemplateAttr`, jQuery.param(data), withNoty);
}

export function deleteTemplate(id) {
  return get(`/json/deleteTemplate?templateid=${id}`);
}

export function deleteAttrTemplate(id, attrname) {
  return get(`/json/deleteTemplateAttr?templateid=${id}&attrname=${attrname}`);
}

//code
export function deleteCode(id) {
  return get(`/json/deleteCode?id=${id}`);
}

export function CodeCreateEdit(code, name, value, descr, id, withNoty = true) {
  if (id == null) {
    let data = { code: code, name: name, value: value, description: descr };
    return postUrl(`/json/saveCode`, jQuery.param(data), withNoty);
  } else {
    let data = {
      code: code,
      name: name,
      value: value,
      description: descr,
      id: id
    };
    return postUrl(`/json/saveCode`, jQuery.param(data), withNoty);
  }
}

//notice
export function deleteNotice(id) {
  return get(`/json/deleteMessage?messageId=${id}`);
}

export function NoticeCreateEdit(
  subject,
  messageText,
  status,
  id,
  type,
  withNoty = true
) {
  if (status) {
    status = 1;
  } else {
    status = 0;
  }

  if (id == null) {
    let data = {
      subject: subject,
      messageText: messageText,
      status: status,
      type: 0
    };
    return postUrl(`/json/saveMessage`, jQuery.param(data), withNoty);
  } else {
    let data = {
      subject: subject,
      messageText: messageText,
      messageId: id,
      status: status,
      type: 0
    };
    return postUrl(`/json/saveMessage`, jQuery.param(data), withNoty);
  }
}

//audit
export function getAllauditAction() {
  return get(`/service/audit/getAllActions`);
}
export function getauditAction(type, targetId, parentId) {
  return get(
    `/service/audit/getActions?type=${type}&targetId=${targetId}&parentId=${parentId}`
  );
}

export function setauditAction(dataItem, withNoty = true) {
  let events = "";
  let data = {
    events: dataItem.events,
    hasFile: dataItem.hasFile,
    hasTable: dataItem.hasTable,
    parentId: dataItem.parentId,
    targetId: dataItem.targetId,
    type: "" + dataItem.type + ""
  };
  return post2(`/service/audit/applyActions`, JSON.stringify(data));
}

//security
export function getSecurityProfiles() {
  return get(`/json/getSecurityProfiles?onlyList=true`);
}

export function getSecurityProfileData(securityid) {
  return get(`/json/getSecurityProfileData?securityid=${securityid}`);
}
export function createAddSecutityProfile(
  adminclass,
  secureclassid,
  desc,
  withNoty = true
) {
  let data = {
    adminsclass: adminclass,
    secureclassid: secureclassid,
    desc: desc
  };
  return postUrl(`/json/addSecutityProfile`, jQuery.param(data), withNoty);
}
export function deleteSecurity(id) {
  return get(`/json/deleteSecurityProfile?securityid=${id}`);
}

export function applyRight(id, rights, withNoty = true) {
  let data = {
    securityProfile: {
      id: id,
      rights: rights
    }
  };
  return post2(
    `/json/addSecutityAccess?secureclassid=${id}`,
    JSON.stringify(data)
  );
}

export function saveRight(elementId, id, inherited, rights, withNoty = true) {
  if (inherited) {
    let data = {
      elementId: elementId,
      securityProfile: {
        id: "INHERITED",
        rights: []
      }
    };
    return post2(
      `/json/saveRights`,
      JSON.stringify(data),
      "application/json",
      withNoty
    );
  } else {
    let data = {
      elementId: elementId,
      securityProfile: {
        id: id,
        rights: rights
      }
    };
    return post2(
      `/json/saveRights`,
      JSON.stringify(data),
      "application/json",
      withNoty
    );
  }
}

//job
export function getalljob() {
  return get(`/json/getalljob`);
}

export function getAdminHistory(taskname) {
  return get(`/json/getAdminHistory?taskname=${taskname}`);
}

export function startJob(taskname) {
  return get(`/json/startJob?taskname=${taskname}`);
}

export function stopJob(taskname) {
  return get(`/json/stopJob?taskname=${taskname}`);
}

export function editJob(taskname, cronexpression) {
  return get(
    `/json/editJob?taskname=${taskname}&cronexpression=${cronexpression}`
  );
}

export function getTask(taskname) {
  return get(`/json/getTask?taskname=${taskname}`);
}

// session
export function getlistSession() {
  return get(`/json/listSession`);
}

export function killSession(killSid) {
  return get(`/json/killSession?killSid=${killSid}`);
}

//history
export function getHistories(data) {
  //return post2(`/json/getHistories`, JSON.stringify( data ))
  return get(`/json/getHistories?${data}&pageSize=30`);
  //return postUrl(`/json/getHistories`, jQuery.param( data ), withNoty)
}

//archive
export function getStatisticRepository() {
  return get(`/json/getStatisticRepository`);
}

//search
export function getStatistic(type, param) {
  return get(`/json/statistic/${type}?${param}`);
}

// save user attr
export function saveUserAttr(attrs) {
  let names = [];
  let values = [];

  for (let key in attrs) {
    names.push(key);
    values.push(attrs[key]);
  }

  if (names.length > 0)
    return get(
      `/json/saveUserAttr?names=${names.join(",")}&values=${values.join(",")}`
    );
  else return new Promise((resolve, reject) => reject("invalid parameters"));
}

export function removeRewrite(rewriteId) {
  return get(`/json/deleteRewrite?rewriteId=${rewriteId}`);
}

// shortcuts
export function addShortCut(path) {
  let data = { cmd: "add", value: path };
  return postUrl(`/json/updateShortCut`, jQuery.param(data));
  //  return get(`/json/updateShortCut?cmd=add&value=${path}`);
}

export function removeShortCut(path) {
  let data = { cmd: "remove", value: path };
  return postUrl(`/json/updateShortCut`, jQuery.param(data));
  //  return get(`/json/updateShortCut?cmd=remove&value=${path}`);
}

export function removeDuplicateDocDirectly(actionId) {
  return get(`/json/deleteDuplicateDocDirectly?actionId=${actionId}`);
}

export function ignoreDuplicateDoc(actionId) {
  return get(`/json/ignoreDuplicateDoc?actionId=${actionId}`);
}

//  save user profile image
export function saveProfile(file, userId) {
  return postForm(`/json/saveProfile?userId=` + userId, file);
}

//  get user profile image
export function getProfile(userId) {
  if (userId) {
    return get(`/json/getProfile?userId=` + userId, "", false);
  } else {
    return get(`/json/getProfile`, "", false);
  }
}

// get listGroups
export function listGroupTree() {
  return get(`/json/listGroupTree`);
}
export function addGroupAttr(groupId, attr) {
  let data = {
    groupId: groupId,
    attr: JSON.stringify(attr)
  };
  return postUrl(`/json/addGroupAttr`, jQuery.param(data));
}

//  get current ip
export function getCurrentIp() {
  return get("/json/info")
    .then(response => {
      return response.ip;
    })
    .catch(error => {
      console.log(error);
    });
}

// get notice
export function getMessageList() {
  return get(`/json/getMessageList?type=0&page=1&pageSize=5`);
}

// permission getMembersArray
export function getMembersArray(members) {
  let users = [];
  let groups = [];
  members.forEach(field => {
    if (field.type != 0) users.push(field.id);
    else groups.push(field.id);
  });
  return { userIds: users, groupIds: groups };
}

// permission Group member add
export function addMembersToPrivGroup(parentId, members) {
  let ids = getMembersString(members);
  let data = {
    parentGroupId: parentId,
    userIds: ids.userIds,
    groupIds: ids.groupIds
  };
  //return post2(`/json/addMembersToPrivGroup`, JSON.stringify(data))
  return get(`/json/addMembersToPrivGroup`, data);
}

// permission Group member remove
export function removeMembersFromPrivGroup(
  parentId,
  MemberUserIds,
  MemberGroupIds
) {
  let data = {
    parentGroupId: parentId,
    userIds: MemberUserIds,
    groupIds: MemberGroupIds
  };
  return get(`/json/removeMembersFromPrivGroup`, data);
}

// permission Group member list
export function listMembers(groupId) {
  return get(`/json/listMembers?groupId=${groupId}`);
}

export function realExpire(items) {
  return get(`/json/deleteDoc?docId=${items}`);
}

export function rootIdSearch() {
  let isWeb = Utils.featuresDefault("vfmap.usableClient", false);
  return get(`/json/getTreeList2?simple=true&type=undefined&isWeb=` + isWeb);
}

export function setAlarmFolderList(param, withNoty = true) {
  let data = {
    id: param.id,
    userId: param.userId,
    name: param.name
  };
  return post2(`/json/rule/notification/folders`, JSON.stringify(data));
}

export function setAlarmUserList(folderId) {
  return get(`/json/rule/notification/users?id=${folderId}`);
}

export function addAlarmUser(folderId, userId, addRuleType, removeRuleType) {
  //return get(`/json/rule/notification/addUser?id=${folderId}&userId=${userId}&ruleType=${ruleType}`);
  return post2(
    `/json/rule/notification/addOrRemoveUser?id=${folderId}&userId=${userId}&addRuleType=${addRuleType}&removeRuleType=${removeRuleType}`
  );
}

export function removeAlarmUser(folderId, userId) {
  return get(
    `/json/rule/notification/removeUser?id=${folderId}&userId=${userId}`
  );
}

export function getTreePagelist(rid, page, pageSize) {
  return get(
    `/json/getTreeList2?page=${page}&pageSize=${pageSize}&simple=true&type=${rid}&rid=${rid}`
  );
}

export function getDeptList(page, pageSize, name) {
  if (name) {
    return get(
      `/json/getTreeList2?page=${page}&pageSize=${pageSize}&targetAdmin=dept&attr=true&rid=Sites&name=` +
        name
    );
  } else {
    return get(
      `/json/getTreeList2?page=${page}&pageSize=${pageSize}&targetAdmin=dept&attr=true&rid=Sites`
    );
  }
}

export function getlistGroupAndUser(
  includeSystem,
  searchType,
  parentId,
  onlyUser,
  moreData,
  page,
  pageSize
) {
  let param = "";
  if (searchType == "tree") {
    param = `&groupId=${parentId}&moreData=${moreData}`;
  }
  return get(
    `/json/listGroupAndUser?includeSystem=${includeSystem}&onlyUser=${onlyUser}&page=${page}&paegSize=${pageSize}` +
      param
  );
}

export function getlistGroupAndUserSearch(url) {
  return get(`${url}`);
}

export function getlistPrivGroup(elementId, name, page, pageSize) {
  let pararm = "";
  if (name) {
    pararm = "&name=" + name;
  }
  return get(
    `/json/listPrivGroup?page=${page}&pageSize=${pageSize}&elementId=${elementId}` +
      pararm
  );
}

export function getlistElementByACL(userId, name, page, pageSize) {
  return get(
    `/json/listElementByACL?userId=${userId}&name=${name}&page=${page}&pageSize=${pageSize}`
  );
}

export function customDRM(eid, action, name) {
  return get(`/json/action/execute?eid=${eid}&action=${action}&name=${name}`);
}

//history
export function getHistoriesList(data) {
  return get(`/json/getHistories?${data}`);
}

export function modifyVersionComment(docId, versionId, comment) {
  let commentEn = encodeURIComponent(comment);
  return get(
    `/json/modifyVersionComment?docId=${docId}&versionId=${versionId}&comment=${commentEn}`
  );
}

//dealim
export function dealimAddEdituser(
  userName,
  name,
  password,
  password2,
  groupIds,
  enabled,
  mode,
  withNoty = true
) {
  let desc = "desc";
  let setGroupId = "";
  for (var i = 0; i < groupIds.length; i++) {
    if (i == groupIds.length - 1) {
      setGroupId += "" + groupIds[i].id + "";
    } else {
      setGroupId += "" + groupIds[i].id + ",";
    }
  }

  let data = {
    userName: userName,
    password: password,
    password2: password2,
    name: name,
    groupIds: setGroupId,
    enabled: enabled,
    mode: mode,
    desc: "",
    lang: Utils.getCookie("lang") || "en"
  };
  console.log(data);
  return postUrl(`/json/daelim/addUser`, jQuery.param(data), withNoty);
}

export function addOrRemove(ids, year, month, disabled) {
  return post2(
    `/json/rule/retention/addOrRemove?ids=${ids}&year=${year}&month=${month}&fromCreationDate=true&disabled=${disabled}`
  );
}

export function getRuleSet(ids) {
  return get(`/json/rule/retention/getRuleSet?ids=${ids}`);
}

export function getListGroupIncludeSub(id, includeSelf, includeSubGroup) {
  return get(
    `/json/listGroup?includeSelf=${includeSelf}&includeSubGroup=${includeSubGroup}&id=${id}`
  );
}
