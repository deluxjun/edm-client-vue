import Filesize from "filesize";
import Moment from "moment";
import constants from "../Constants";
import { Z_STREAM_END } from "zlib";
import * as api from "@/utils/api";
import router from "@/router";
import CryptoJS from "crypto-js";

function checkRuleExist(attr) {
  let rule = false;
  if (attr) {
    for (let i = 0; i < attr.length; i++) {
      if (attr[i].name.split(":")[1]) {
        if (
          attr[i].name.split(":")[1].substr(0, 7) == "ruleId_" ||
          attr[i].name.split(":")[1] == "linkTo"
        ) {
          rule = true;
        }
      }
    }
  }
  return rule;
}

function checkPersonalInfoExist(attr) {
  let personalInfo = false;
  if (attr) {
    for (let i = 0; i < attr.length; i++) {
      if (attr[i].name) {
        if (attr[i].name.indexOf("ext:pinfo") != -1 && attr[i].value == "T") {
          personalInfo = true;
        }
      }
    }
  }
  return personalInfo;
}

function leadingZeros(n, digits) {
  let zero = "";
  n = n.toString();

  if (n.length < digits) {
    for (let i = 0; i < digits - n.length; i++) zero += "0";
  }
  return zero + n;
}

const Utils = {
  sysLogging(enable = true) {
    if (enable) {
      delete console.log;
      console.log = window._consolelog;
    } else {
      window._consolelog = console.log;
      console.log = function () { };
    }
  },
  moment: Moment,
  toDateString(d = new Date()) {
    let s =
      leadingZeros(d.getFullYear(), 4) +
      "-" +
      leadingZeros(d.getMonth() + 1, 2) +
      "-" +
      leadingZeros(d.getDate(), 2) +
      "";
    return s;
  },
  formatMoment(d) {
    let setFormat = Utils.featuresDefault("DateFormat", "YYYY-MM-DD HH:mm:ss");
    if (setFormat) {
      return Utils.moment(d).format(setFormat);
    } else {
      return Utils.moment(d, "YYYY-MM-DD hh:mm:ss").fromNow();
    }
  },
  filesize: function (value) {
    if (value > 0) return Filesize(value);
    return "";
  },
  // COOKIES
  setCookie: function (cName, cValue, seconds = 86400, path = "/") {
    let expire = new Date();
    expire.setTime(expire.getTime() + seconds * 1000);
    let cookies = cName + "=" + escape(cValue) + "; path=" + path;
    cookies += ";expires=" + expire.toGMTString() + ";";
    document.cookie = cookies;
  },
  setMgCookie: function (cName, cValue, seconds = 86400, path = "/") {
    let expire = new Date();
    expire.setTime(expire.getTime() + seconds * 1000);
    let cookies = cName + "=" + escape(cValue) + "; path=" + path + ";";
    document.cookie = cookies;
  },
  deleteCookie: function (cookieName, path = "") {
    let expireDate = new Date();
    if (path === "") path = "/";

    expireDate.setDate(expireDate.getDate() - 1);
    document.cookie =
      cookieName +
      "= " +
      "; expires=" +
      expireDate.toGMTString() +
      "; path=" +
      path;
  },
  getCookie: function (cName) {
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
  },
  getIdName(id, name = null) {
    let full = id;
    if (name && name.length > 0 && name != id) full = `${name} (${id})`;
    return full;
  },
  cleanArray: (arr, withStr = ["files"]) => {
    // while(arr[0] === '') {
    //   arr.shift()
    // }
    if (!withStr) withStr = [];
    withStr.push("");

    for (let index = 0; index < withStr.length; index++) {
      let e = withStr[index];
      if (arr[0] === e) {
        arr.shift();
        index = -1;
      }
    }

    if (arr[arr.length - 1] === "") {
      arr.pop();
    }
    return arr;
  },
  getPath: (path, prefix = "") => {
    if (prefix.startsWith("/")) prefix = prefix.substr(1);
    if (path.startsWith("/")) path = path.substr(1);
    let found = path.indexOf(prefix);
    if (found !== -1) {
      return path.substr(prefix.length);
    }
    return path;
  },
  isSearchableKey: function (keycode) {
    return keycode == 8 || (keycode > 32 && !(keycode >= 37 && keycode <= 40));
  },
  getUserNameForUI: function (userId, userName, groupType) {
    userId = String(userId).replace("_user_", "");
    if (groupType == 1) {
      return userName;
    }
    if (userName && userName.length > 0 && userName !== userId) {
      if (groupType == -1) {
        return `${userName} (${userId})`;
      } else {
        return `${userName}`;
      }
    } else {
      return userId;
    }
  },
  getIndicators: function (data, listview, doAction = true) {
    let html = "";
    if (data.r_object_type == "dm_folder") {
      // if (checkRuleExist(data.attrList))
      //     html += "<span class='edm icon_new_rule' title='" + vue.$t('label.manageRule') + "'></span>"
      // else
      //     html += "<span class='edm icon_new_rule' title='" + vue.$t('label.manageRule') + "' hidden></span>"
    } else {
      if (data.r_lock_type == "5")
        html +=
          "<span class='k-icon k-i-lock' title='" +
          vue.$t("prompts.checkout") +
          "'></span>";
      else
        html +=
          "<span class='k-icon k-i-lock' title='" +
          vue.$t("prompts.checkout") +
          "' hidden></span>";
    }

    if (checkPersonalInfoExist(data.attrList))
      html +=
        "<span class='k-icon k-i-user' title='" +
        vue.$t("prompts.personal") +
        "'></span>";
    else
      html +=
        "<span class='k-icon k-i-user' title='" +
        vue.$t("prompts.personal") +
        "' hidden></span>";

    if (data.sharing == "true")
      html +=
        "<span class='k-icon k-i-share indicIcon' title='" +
        vue.$t("prompts.share") +
        "'></span>";
    else
      html +=
        "<span class='k-icon k-i-share indicIcon' title='" +
        vue.$t("prompts.share") +
        "' hidden></span>";

    // console.log(data.urlSharing);
    // if (data.urlSharing == 'true'){
    //     html += "<span class='fa fa-share indicIcon' title='" + vue.$t('prompts.share') + "'></span>"
    // }else{
    //     html += "<span class='fa fa-share indicIcon' title='" + vue.$t('prompts.share') + "' hidden></span>"
    // }

    let actionScript = "";
    if (doAction) {
      actionScript =
        "onclick='Utils.changeBookmarkLogo(\"" + data.r_object_id + "\");'";
    }
    if (
      store.state.rootId != "trash" &&
      store.state.rootId != "onlyExpired" &&
      !(
        store.state.rootId == "search" &&
        (store.state.lastSearchOption.content.r_folder_id == "trash" ||
          store.state.lastSearchOption.content.r_folder_id == "onlyExpired")
      )
    ) {
      if (listview)
        if (data.bookmarked)
          html +=
            " <span id='star_" +
            data.r_object_id +
            "' class='fa fa-star bookmarked' " +
            actionScript +
            " title='" +
            vue.$t("files.bookmark") +
            "'></span>";
        else
          html +=
            " <span id='star_" +
            data.r_object_id +
            "' class='fa fa-star-o bookmarked' " +
            actionScript +
            " title='" +
            vue.$t("files.bookmark") +
            "'></span>";
    }
    return html;
  },
  getContentTypeClass: function (type, extension, attrList = null) {
    if (type === "dm_folder") {
      if (attrList == "dashboard") {
        return "fa fa-folder-o";
      }
      if (attrList) {
        if (attrList.some(e => e.name === "fld:BundleCnt"))
          return "k-icon k-i-file-add";
      }
      return "fa fa-folder treeFolderIcon";
    }

    switch (extension) {
      case "jpg":
      case "jpeg":
      case "img":
      case "png":
      case "gif":
      case "tif":
      case "bmp":
      case "tiff":
        return "fa fa-file-image-o";
      case "doc":
      case "docx":
        return "fa fa-file-word-o";
      case "xls":
      case "csv":
      case "xlsx":
        return "fa fa-file-excel-o";
      case "ppt":
      case "pptx":
        return "fa fa-file-powerpoint-o";
      case "pdf":
        return "fa fa-file-pdf-o";
      case "zip":
      case "rar":
      case "jar":
        return "fa fa-file-archive-o";
      case "htm":
      case "xml":
      case "html":
        return "fa fa-file-code-o";
      case "txt":
      case "csv":
        return "fa fa-file-text-o";
      case "mp4":
      case "mov":
      case "avi":
        return "fa fa-file-video-o";
      case "mp3":
      case "wav":
      case "aac":
      case "ogg":
      case "wma":
      case "flac":
        return "fa fa-file-audio-o";
      case "c":
      case "cpp":
      case "java":
      case "js":
      case "css":
        return "fa fa-file-text-o";
      default:
        return "fa fa-file-o";
    }
  },

  // thumbnail support extensions
  isThumbnailSupported: function (param) {
    var extension = param.toLowerCase();
    if (extension == "xlsx" || extension == "xls") {
      return true;
    } else if (extension == "doc" || extension == "docx") {
      return true;
    } else if (extension == "pptx" || extension == "ppt") {
      return true;
    } else if (
      extension == "jpg" ||
      extension == "png" ||
      extension == "tif" ||
      extension == "tiff" ||
      extension == "gif" ||
      extension == "bmp"
    ) {
      return true;
    } else if (extension == "zip") {
      return true;
    } else if (extension == "pdf") {
      return true;
    } else if (extension == "hwp") {
      return true;
    } else if (
      extension == "avi" ||
      extension == "asf" ||
      extension == "wmv" ||
      extension == "mp4" ||
      extension == "mov" ||
      extension == "mpg" ||
      extension == "flv"
    ) {
      return true;
    } else if (
      extension == "txt" ||
      extension == "csv" ||
      extension == "htm" ||
      extension == "html" ||
      extension == "log"
    ) {
      return true;
    } else {
      return false;
    }
  },
  getDefaultFileIcon: function (r_object_type, dos_ext, attrList = null) {
    return `<i class='${Utils.getContentTypeClass(
      r_object_type,
      dos_ext,
      attrList
    )}'></i>`;
  },
  insertThumbnailHtml: function (holder, docId, r_object_type, dos_ext) {
    let text = "";
    if (
      store.state.viewOption.thumbnail &&
      Utils.isThumbnailSupported(dos_ext)
    ) {
      text = `<img src="${store.state.baseURL}/service/thumbnail/get?sid=${store.state.ticket
        }&docId=${docId}&c=force" onError="Utils.handleThumbnailError(this)" />`;
    } else {
      text = Utils.getDefaultFileIcon(r_object_type, dos_ext);
    }
    // return $('<div></div>').text(text).html();
    // $('#' + holder).html(text)
    return text;
  },
  handleThumbnailError: function (sender, r_object_type, dos_ext) {
    $(sender).hide();
    $(sender)
      .parent()
      .html(Utils.getDefaultFileIcon(r_object_type, dos_ext));
    $(sender).show();
  },
  // getSelectedListInView:function(sender){
  //   var currentView=sender.$store.state.viewOption.view;
  //   var items;
  //   var selected=[];
  //   if(currentView=='grid'){
  //     items=$("#main-kendoGrid").data("kendoGrid");
  //   }
  //   else{
  //     items=$("#main-kendoList").data("kendoListView");
  //   }
  //   var rows=items.select();
  //   rows.each(function(idx,row){
  //     var item=items.dataItem(row);
  //     selected.push(item);
  //   })
  //   return selected;
  // },
  refreshTreeViewChild() {
    var treeView = $("#treeview").data("kendoTreeView");
    var selectedNode = treeView.select();
    var selectedDataItem = treeView.dataItem(selectedNode);
    selectedDataItem.loaded(false);
    selectedDataItem.load();
  },
  showResultMessage: function (isSuccess, title, message) {
    if (isSuccess) {
      vue.$showSuccess(title, message);
    } else {
      vue.$showError(title, message);
    }
  },
  convertByteSizeToString: function (bytes) {
    var sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    if (bytes == 0) return "0 Byte";
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return (bytes / Math.pow(1024, i)).toFixed(1) + " " + sizes[i];
  },
  truncate: function (str, n) {
    if (this.getTextLength(str) <= n) {
      return str;
    }
    let leng = str.length;
    while (this.getTextLength(str) > n) {
      leng--;
      str = str.substring(0, leng);
    }
    return str + "..";
  },
  // null & undefined 처리
  blankValue: function (value) {
    var setVal = value;
    if (value == null || value == "undefined" || value == "null") {
      setVal = "";
    }
    return setVal;
  },
  /**
   * 한글포함 문자열 길이를 구한다
   */
  getTextLength: function (str) {
    var len = 0;
    for (var i = 0; i < str.length; i++) {
      if (escape(str.charAt(i)).length == 6) {
        len++;
      }
      len++;
    }
    return len;
  },
  volumeFormat(volume) {
    volume = volume / (1024 * 1024 * 1024);
    return parseFloat(volume.toFixed(2));
  },
  getUnlimitedVolume() {
    let volume = 99999999999999; //default value
    if (store.state.info.features.unlimitedVolume) {
      volume = store.state.info.features.unlimitedVolume;
    }
    return volume;
  },
  volumeInfo(volumeInfo) {
    let volume = { percentage: 0, color: "#00a2e8", text: "" };
    if (volumeInfo == undefined || volumeInfo == null) {
      return volume;
    }
    let usable = volumeInfo.maxSpace - volumeInfo.spaceLeft;
    volume.max = Utils.filesize(volumeInfo.maxSpace);
    if (usable > 0) {
      volume.usable = Utils.filesize(usable);
    } else {
      volume.usable = "0 GB";
    }
    if (volumeInfo.maxSpace >= Utils.getUnlimitedVolume()) {
      volume.text = i18n.t('messages.volumeUsing_usable', volume)
    } else {
      volume.text = i18n.t('messages.volumeUsing_max', volume) + i18n.t('messages.volumeUsing_usable', volume)
    }
    volume.percentage = (100 * usable) / volumeInfo.maxSpace;
    volume.percentage = parseFloat(volume.percentage.toFixed(2));
    if (volume.percentage > 50 && volume.percentage < 90)
      volume.color = "#00a2e8";
    else if (volume.percentage >= 90) volume.color = "2d1c24";
    return volume;
  },
  makeGroupPath(path) {
    var splitGroup = "";
    if (path) splitGroup = path.split(",");
    var returnHTML = "<ul class='groupPath'>";
    for (var i = 0; i < splitGroup.length; i++) {
      if (!(splitGroup[i] === " ")) {
        returnHTML +=
          "<li class='groupPath'><span>" + splitGroup[i] + "</span></li>";
      }
    }
    returnHTML += "</ul>";
    return returnHTML;
  },
  getRootType(path) {
    // set rootid
    let urlParts = Utils.getPath(path, store.state.webBaseURL).split("/");
    urlParts = Utils.cleanArray(urlParts);
    if (urlParts[0]) {
      if (urlParts.length > 1 && urlParts[1]) {
        let subid = store.getters.getRootIdByName(
          decodeURIComponent(urlParts[1])
        );
        if (subid) return subid;
      }
      let id = store.getters.getRootIdByName(decodeURIComponent(urlParts[0]));
      if (id) return id;
    }
    return null;
  },
  getCurrentSelect: function (one = false) {
    let array = null;
    if (store.state.selected.length == 0) {
      try {
        let rid = store.state.currentDir
        let treeview = $("#treeview").data("kendoTreeView");
        let currentDir = treeview.dataSource.get(rid);
        array = [
          {
            ...currentDir,
            r_object_id: store.state.currentDir,
            object_name: store.state.currentDirName,
            docTypeName: "FOLDER",
            reloadParent: true
          }
        ];
      } catch (e) {
        console.log(e)
        array = [
          {
            r_object_id: store.state.currentDir,
            object_name: store.state.currentDirName,
            docTypeName: "FOLDER",
            reloadParent: true
          }
        ];
      }
    } else {
      array = store.state.selected;
    }
    if (one) return array[0];
    else return array;
  },
  getCurrentSelectId: function () {
    return this.getCurrentSelect(true).r_object_id;
  },
  getCurrentSelectName: function () {
    return this.getCurrentSelect(true).object_name;
  },
  // toggle is-active
  toggleActive(className, active = null) {
    let dropdown = document.querySelector("." + className);
    if (!dropdown) return;
    if (active == null) dropdown.classList.toggle("is-active");
    else {
      if (active && !dropdown.classList.contains("is-active"))
        dropdown.classList.add("is-active");
      else if (!active && dropdown.classList.contains("is-active"))
        dropdown.classList.remove("is-active");
    }
  },
  isActive(className) {
    let dropdown = document.querySelector("." + className);
    if (dropdown && dropdown.classList.contains("is-active")) return true;
    return false;
  },
  features(key) {
    let status = store.state.info.features[key];
    if (status == "true") {
      return true;
    } else if (status == "false") {
      return false;
    } else {
      return store.state.info.features
        ? store.state.info.features[key]
        : undefined;
    }
  },
  featuresDefault(key, value) {
    let status = store.state.info.features[key];
    if (status === undefined) return value;
    if (status == "true") {
      return true;
    } else if (status == "false") {
      return false;
    } else {
      return store.state.info.features
        ? store.state.info.features[key]
        : undefined;
    }
  },
  listConfig(root) {
    let features = [];
    if (
      root === "bookmark" ||
      root === "trash" ||
      root === "search" ||
      root === "Categories" ||
      root === "recentDoc" ||
      root == "myShared"
    ) {
      features.push("path");
    }
    return features;
  },
  jumpToPath(idPath) {
    router.push({ path: "/files" + idPath });
  },
  jumpToPop(eid) {
    window.open(
      `${store.state.baseURL}/json/downloadTicket?elementId=${eid}&mode=W`,
      "_blank"
    );
    //location.href=`${store.state.baseURL}/json/downloadTicket?elementId=${eid}`
  },
  async changeBookmarkLogo(object_id, ignoreLogo = false, a = false) {
    var logo = $("#star_" + object_id);
    var mode = false;
    if (logo.hasClass("fa-star-o")) {
      mode = true;
    }
    if (ignoreLogo) {
      mode = a;
    }
    if (mode) {
      try {
        var successMessage = vue.$t("bookmark.addbookmarkmsg");
        await api.addBookmark(object_id, 1);
        logo.removeClass("fa-star-o");
        logo.addClass("fa-star");
        Utils.showResultMessage(true, null, successMessage);
      } catch (exception) {
        console.log(exception);
        Utils.showResultMessage(false, "{}", "");
      }
    } else {
      try {
        var successMessage = vue.$t("bookmark.removebookmarkmsg");
        await api.removeBookmark(object_id);
        logo.removeClass("fa-star");
        logo.addClass("fa-star-o");
        Utils.showResultMessage(true, null, successMessage);
      } catch (exception) {
        Utils.showResultMessage(false, null, "");
      }
    }
    if (store.state.viewOption.view == "table") {
      Event.fire(EventList.GRID_UPDATE_DATA, {
        object_id: object_id,
        key: "bookmarked",
        value: mode
      });
      return;
    }
    if (ignoreLogo) {
      Event.fire(EventList.RELOAD_LIST);
    }
  },
  getFileExtension(filename) {
    var arr = filename.split(".");
    var ext = arr.pop();
    if (arr.length == 0) return "";
    ext = ext.toLowerCase();
    return ext;
  },
  checkCanDepress(filename) {
    var ext = Utils.getFileExtension(filename);
    if (ext == null || ext.length == 0) return false;
    switch (ext) {
      case "zip":
        return true;
    }
    return false;
  },
  getBreadcrumbsOLD(namePath, idPath) {
    let breadcrumbs = [];

    let parts = namePath.split("/");
    let idParts = idPath.split("/");
    parts = Utils.cleanArray(parts);
    idParts = Utils.cleanArray(idParts);

    for (let i = 0; i < parts.length; i++) {
      if (i === 0) {
        breadcrumbs.push({
          name: decodeURIComponent(parts[i]),
          url: "/files/" + idParts[i] + "/"
        });
      } else {
        breadcrumbs.push({
          name: decodeURIComponent(parts[i]),
          url: breadcrumbs[i - 1].url + idParts[i] + "/"
        });
      }
    }

    if (breadcrumbs.length > 5) {
      while (breadcrumbs.length !== 6) {
        breadcrumbs.shift();
      }

      breadcrumbs[0].name = "...";
    }
    return breadcrumbs;
  },
  getBreadcrumbs(namePath, link = true) {
    let breadcrumbs = [];

    let parts = namePath.split("/");
    parts = Utils.cleanArray(parts);

    if (
      parts.length === 0 &&
      store.state.currentDir &&
      store.state.currentDir.length > 0 &&
      store.state.currentDirName &&
      store.state.currentDirName.length > 0
    ) {
      if (store.state.isCarryout) {
        breadcrumbs.push({
          name: store.state.currentDirName,
          url: "/files/" + store.state.currentDirName + "/",
          url2: "",
          key: "/" + store.state.currentDirName,
          id: ""
        });
      } else {
        breadcrumbs.push({
          name: store.state.currentDirName,
          url: "/files/" + store.state.currentDirName + "/",
          key: "/" + store.state.currentDirName
        });
      }
    }

    let key = "";
    let enPath = store.state.currentPath.split("/");
    for (let i = 0; i < enPath.length; i++) {
      if (store.state.carryoutList.includes(enPath[i])) {
        enPath.splice(0, i);
      }
    }

    for (let i = 0; i < parts.length; i++) {
      key += "/" + parts[i];
      let url = "";
      if (link) {
        if (i === 0) {
          url = "/files/" + parts[i] + "/";
        } else {
          url = breadcrumbs[i - 1].url + parts[i] + "/";
        }
      }

      if (store.state.isCarryout) {
        let enPath2 = store.state.currentPath.split("/");
        let url2 =
          i === 0
            ? ""
            : enPath2.slice(0, enPath2.length + (i - parts.length)).join("/") +
            "/";
        let id = i === 0 ? "" : enPath[i - 1];

        console.log(enPath2);

        breadcrumbs.push({
          name: decodeURIComponent(parts[i]),
          url: url,
          url2: url2,
          key: key,
          id: id
        });
      } else {
        breadcrumbs.push({
          name: decodeURIComponent(parts[i]),
          url: url,
          key: key
        });
      }
    }

    if (breadcrumbs.length > 5) {
      while (breadcrumbs.length !== 6) {
        breadcrumbs.shift();
      }

      breadcrumbs[0].name = "...";
    }
    return breadcrumbs;
  },
  removeFileExtension(filename) {
    var part = filename.split(".");
    if (part.length == 1) return filename;
    else if (part.length == 2) {
      return part[0];
    } else {
      var tmp = "";
      for (var i = 0; i < part.length; i++) {
        tmp += part[i];
      }
      return tmp;
    }
  },
  // admin tool kendo
  getAttrName(attrname) {
    if (attrname) {
      if (attrname.substr(0, 4) == "ext:") {
        return attrname.substr(4, attrname.length);
      } else {
        return attrname;
      }
    } else {
      return "";
    }
  },
  getTypeName(id) {
    var setVal = "";
    if (id == 0) {
      setVal = "String";
    } else if (id == 1) {
      setVal = "Int";
    } else if (id == 2) {
      setVal = "Double";
    } else if (id == 3) {
      setVal = "Date";
    } else if (id == 6) {
      setVal = "Boolean";
    }
    return setVal;
  },
  displayhidden(type, id, state) {
    if (type == "class") {
      if (state) {
        $("." + id).hide();
      } else {
        $("." + id).show();
      }
    } else {
      if (state) {
        $("#" + id).hide();
      } else {
        $("#" + id).show();
      }
    }
  },
  getEditorType(editor) {
    var setVal = "";
    switch (editor) {
      case 0:
        setVal = "Text";
        break;
      case 1:
        setVal = "List";
        break;
      case 2:
        setVal = "Textarea";
        break;
    }
    return setVal;
  },
  todayDate(div) {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();

    if (dd < 10) {
      dd = "0" + dd;
    }

    if (mm < 10) {
      mm = "0" + mm;
    }
    if (div) {
      today = yyyy + mm + dd;
    } else {
      today = yyyy + "-" + mm + "-" + dd;
    }
    return today;
  },

  idDate() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();
    var hh = today.getHours();
    var ii = today.getMinutes();
    var ss = today.getSeconds();

    if (dd < 10) {
      dd = "0" + dd;
    }

    if (mm < 10) {
      mm = "0" + mm;
    }
    today = yyyy + mm + dd + hh + ii + ss;
    return today;
  },

  replaceDate(date, div) {
    var setdate = new Date(date);
    var dd = setdate.getDate();
    var mm = setdate.getMonth() + 1; //January is 0!
    var yyyy = setdate.getFullYear();

    if (dd < 10) {
      dd = "0" + dd;
    }

    if (mm < 10) {
      mm = "0" + mm;
    }
    if (div) {
      setdate = yyyy + "-" + mm + "-" + dd;
    } else {
      setdate = yyyy + mm + dd;
    }
    return setdate;
  },
  chkBoolean(param) {
    let data = false;
    if (param == "1" || param == 1) {
      data = true;
    }
    return data;
  },
  allCheckPermission(param) {
    let data = false;
    if (param) {
      if (
        param.read == "1" &&
        param.write == "1" &&
        param.view == "1" &&
        param.download == "1" &&
        param.control == "1" &&
        param.print == "1" &&
        param.check == "1" &&
        param.rename == "1" &&
        param.delete == "1" &&
        param.add == "1"
      ) {
        data = true;
      }
    }
    return data;
  },
  volumeFormat2(volume) {
    volume = volume / (1024 * 1024);
    return parseFloat(volume.toFixed(2));
  },
  getLocaleDate(obj) {
    if (obj == "" || typeof obj == "undefined" || obj == null) return "";
    if (obj.iso8601 == "" || typeof obj.iso8601 == "undefined") {
      obj = new Date(obj);
      return (
        obj.getFullYear() +
        "-" +
        ("00" + (obj.getMonth() + 1)).slice(-2) +
        "-" +
        ("00" + obj.getDate()).slice(-2) +
        " " +
        ("00" + obj.getHours()).slice(-2) +
        ":" +
        ("00" + obj.getMinutes()).slice(-2) +
        ":" +
        ("00" + obj.getSeconds()).slice(-2)
      );
    } else {
      return obj.iso8601.substr(0, 10);
    }
  },
  getParameter(param) {
    var returnValue;
    var url = location.href;
    var parameters = url.slice(url.indexOf("?") + 1, url.length).split("&");
    for (var i = 0; i < parameters.length; i++) {
      var varName = parameters[i].split("=")[0];
      if (varName.toUpperCase() === param.toUpperCase()) {
        returnValue = parameters[i].split("=")[1];
        return decodeURIComponent(returnValue);
      }
    }
    return undefined;
  },
  updateIndicator(object_id, type, turnOn = false) {
    console.log(object_id, type, turnOn);
    var indicator = $("#indic_" + object_id);
    if (!indicator) return;
    var icon = "";
    var key = "";
    var value = "";
    switch (type) {
      case "share":
        {
          icon = "k-i-share";
          key = "sharing";
          value = turnOn;
        }
        break;
      case "urlshare":
        {
          icon = "fa-share";
          key = "urlSharing";
          value = turnOn;
        }
        break;
      case "lock":
        {
          icon = "k-i-lock";
          key = "r_lock_type";
          turnOn ? (value = "5") : (value = 3);
        }
        break;
    }
    var obj = indicator.find("." + icon);
    if (!turnOn && obj.is(":visible")) {
      //remove
      obj.hide();
    } else {
      //add
      obj.show();
    }
    Event.fire(EventList.GRID_UPDATE_DATA, {
      object_id: object_id,
      key: key,
      value: value
    });
  },
  updateVersionLabel(object_id, data) {
    var vlabel = $("#vLabel_" + object_id);
    vlabel.html(data);
    console.log(data);
  },
  removeLastCharacterAtGroup(groupList) {
    if (groupList[groupList.length - 1] == ",") {
      groupList = groupList.slice(0, -1);
    }
    return groupList;
  },
  //공지사항 머리글 아이콘 처리
  noticeIcon: function (status) {
    if (status == 1) {
      return "<i class='el-icon-star-off'></i>";
    } else {
      return "";
    }
  },
  folderfileCheckbox: function (folder, div) {
    $(".row-checkbox-label").each(function (idx, item) {
      if (folder) {
        if (div.id == "grid") {
          if ($(item)[0].title == "folder") {
            if (
              !$(item)
                .closest("tr")
                .is(".k-state-selected")
            ) {
              $(item).click();
            }
          } else {
            //파일들은 선택되어 있으면 해제
            if (
              $(item)
                .closest("tr")
                .is(".k-state-selected")
            ) {
              $(item).click();
            }
          }
        } else {
          if ($(item)[0].title == "folder") {
            if (
              !$(item)
                .closest(".list-item")
                .is(".k-state-selected")
            ) {
              $(item).click();
            }
          } else {
            //파일들은 선택되어 있으면 해제
            if (
              $(item)
                .closest(".list-item")
                .is(".k-state-selected")
            ) {
              $(item).click();
            }
          }
        }
      } else {
        if (div.id == "grid") {
          if ($(item)[0].title == "file") {
            if (
              !$(item)
                .closest("tr")
                .is(".k-state-selected")
            ) {
              $(item).click();
            }
          } else {
            //폴더들은 선택되 있으면 해제
            if (
              $(item)
                .closest("tr")
                .is(".k-state-selected")
            ) {
              $(item).click();
            }
          }
        } else {
          if ($(item)[0].title == "file") {
            if (
              !$(item)
                .closest(".list-item")
                .is(".k-state-selected")
            ) {
              $(item).click();
            }
          } else {
            //폴더들은 선택되 있으면 해제
            if (
              $(item)
                .closest(".list-item")
                .is(".k-state-selected")
            ) {
              $(item).click();
            }
          }
        }
      }
    });
  },
  allcheckbox: function (checked, div) {
    $(".row-checkbox-label").each(function (idx, item) {
      if (checked) {
        if (div.id == "grid") {
          if (
            !$(item)
              .closest("tr")
              .is(".k-state-selected")
          ) {
            $(item).click();
          }
        } else {
          if (
            !$(item)
              .closest(".list-item")
              .is(".k-state-selected")
          ) {
            $(item).click();
          }
        }
      } else {
        if (div.id == "grid") {
          if (
            $(item)
              .closest("tr")
              .is(".k-state-selected")
          ) {
            $(item).click();
          }
        } else {
          if (
            $(item)
              .closest(".list-item")
              .is(".k-state-selected")
          ) {
            $(item).click();
          }
        }
      }
    });
  },
  selectedCheckbox(div) {
    if (div == "list") {
      $(".list-item")
        .find("[type=checkbox]")
        .prop("checked", false);
      $(".k-state-selected")
        .find("[type=checkbox]")
        .prop("checked", true);
    } else {
      $("tbody tr")
        .find("[type=checkbox]")
        .prop("checked", false);
      $("tbody tr.k-state-selected")
        .find("[type=checkbox]")
        .prop("checked", true);
    }
  },
  selectedboxClick(div) {
    $(".row-checkbox-label").bind("click", function (e) {
      if (div == "list") {
        e.stopPropagation();
        $(e.target)
          .closest(".list-item")
          .toggleClass("k-state-selected");
      } else {
        e.stopPropagation();
        $(e.target)
          .closest("tr")
          .toggleClass("k-state-selected");
      }
      Utils.selectedCheckbox(div);
    });
  },
  unselectedbox() {
    $("#changeText").html(
      "<i class='el-icon-success'></i> " +
      i18n.t("label.select") +
      " <i class='el-icon-arrow-down el-icon--right'></i>"
    );
  },
  changeSortName(name) {
    switch (name) {
      case "object_name":
        return "name";
      case "owner_name":
        return "creator";
      case "producer_name":
        return "producer";
      case "r_modify_date":
        return "lastModified";
      case "r_creation_date":
        return "creationDate";
      case "modifier_name":
        return "modifier";
      case "r_content_size":
        return "size";
      default:
        return "elementId";
    }
  },
  existManager(data) {
    let returnValue = false;
    if (data.type != -1 && data.attr) {
      if (data.attr["g:manager"]) {
        if (data.attr["g:manager"].attrValue != "") {
          returnValue = true;
        } else {
          returnValue = false;
        }
      }
    }
    return returnValue;
  },
  rootIconCheck(spriteCssClass) {
    //트리 Root Icon은 vf-map에서 처리
    if (spriteCssClass) {
      return false;
    } else {
      return true;
    }
  },
  divGroupType(type, privType) {
    if (type == 0) {
      return vue.$t("permission.group");
    } else if (type == 1) {
      if (privType == 5) {
        return vue.$t("permission.okpgroup");
      } else if (privType == 6) {
        return vue.$t("permission.basicpgroup");
      } else if (privType == 7) {
        return vue.$t("permission.pgroup");
      }
    } else if (type == -1) {
      return vue.$t("permission.user");
    }
  },
  fileDownload(url) {
    var elemIF = document.createElement("iframe");
    elemIF.src = url;
    elemIF.style.display = "none";
    document.body.appendChild(elemIF);
    elemIF.onload = function (e) {
      console.log(e);
      //vue.$showError(i18n.t("messages.errorMsg"), i18n.t("label.error"));
    };
  },
  removeAlarm(elementId, userId) {
    let data = {
      elementId: elementId,
      userId: userId
    };
    Event.fire(EventList.ALARM_RELEASE, data);
  },
  memeberDialog(id, name) {
    let data = {
      id: id,
      name: name
    };
    Event.fire(EventList.PERMISSION_PRIVGROUP, data);
  },
  /* dashboard 에서 사용하는 컬러 밝기 조절 함수 */
  LightenDarkenColor(col, amt) {
    if (col == "transparent" || col == null) {
      col = "#ffffff";
    }

    var usePound = false;

    if (col[0] == "#") {
      col = col.slice(1);
      usePound = true;
    }

    var num = parseInt(col, 16);

    var r = (num >> 16) + amt;

    if (r > 255) r = 255;
    else if (r < 0) r = 0;

    var b = ((num >> 8) & 0x00ff) + amt;

    if (b > 255) b = 255;
    else if (b < 0) b = 0;

    var g = (num & 0x0000ff) + amt;

    if (g > 255) g = 255;
    else if (g < 0) g = 0;

    return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
  },
  getContrastYIQ(hc) {
    const [r, g, b] = [0, 2, 4].map(p => parseInt(hc.substr(p, 2), 16));
    return (r * 299 + g * 587 + b * 114) / 1000 >= 128;
  },
  listTreeMore(rid, pageSize) {
    var tree = $("#treeview").data("kendoTreeView");
    var dataItem = tree.dataSource.get(rid);
    var node = tree.findByUid(dataItem.uid);
    tree.select(node);
    let appendNode = tree.select();
    let selected = $("#" + rid + "_moreBtn");
    let page = selected.data("page");
    console.log(selected);
    console.log(page);
    let pageUp = parseInt(page) + parseInt(1);
    $("#" + rid + "_moreBtn").data("page", pageUp);
    console.log(parseInt(page) + parseInt(1));

    console.log(selected);

    api
      .getTreePagelist(rid, pageUp, pageSize)
      .then(data => {
        let list = data.list;
        for (var i = 0; i < list.length; i++) {
          tree.append({ text: list[i].text, rid: list[i].rid }, appendNode);
        }
      })
      .catch(error => {
        console.log(error);
      });
  },
  VersionRevert(eid, versionId) {
    console.log(versionId);
    let data = {
      eid: eid,
      versionId: versionId
    }
    Event.fire(EventList.VERSION_REVERT, data);
  },
  VersionCommentChange(eid, comment) {
    let data = {
      eid: eid,
      comment: comment
    }
    Event.fire('VERSION_COMMENT', data);
  },
  VesionDown(eid, versionId) {
    let data = {
      eid: eid,
      versionId: versionId
    }
    Event.fire(EventList.VERSION_DOWN, data);
  },
  removeSession(param) {
    vue
      .$confirm(vue.$t("messages.removeSession"), "", {
        confirmButtonText: vue.$t("label.remove"),
        cancelButtonText: vue.$t("buttons.cancel"),
        confirmButtonClass: "dialog-error-color"
      })
      .then(res => {
        api
          .killSession(param)
          .then(_ => {
            vue.$message({
              message: vue.$t("messages.removed"),
              type: "success"
            });
            Event.fire(EventList.SESSION_WIDGET_REFRESH, true);
          })
          .catch(err => {
            vue.$message({
              message: vue.$t("messages.removeError"),
              type: "error"
            });
            Event.fire(EventList.SESSION_WIDGET_REFRESH, false);
          });
      });
  },
  postWindowOepn(url, setdata, title) {
    let data = {
      param: {
        url: url,
        data: setdata
      },
      title: title
    };
    Event.fire(EventList.GROUPWARE, data);
  },
  postOpen(url, data) {
    var form = document.createElement("form");
    let param = data;
    form.action = url;
    form.method = "POST";
    form.target = "_blank";
    if (param) {
      for (var key in param) {
        var input = document.createElement("textarea");
        input.name = key;
        input.value =
          typeof param[key] === "object"
            ? JSON.stringify(param[key])
            : param[key];
        console.log(input.value);
        form.appendChild(input);
      }
    }
    form.style.display = "none";
    $("body").append(form);
    form.submit();
  },
  postIframe(url, data) {
    var form = document.createElement("form");
    let param = data;
    form.action = url;
    form.method = "POST";
    form.target = "exitTranframe";
    if (param) {
      for (var key in param) {
        var input = document.createElement("textarea");
        input.name = key;
        input.value =
          typeof param[key] === "object"
            ? JSON.stringify(param[key])
            : param[key];
        console.log(input.value);
        form.appendChild(input);
      }
    }
    form.style.display = "none";

    var aIframe = document.createElement("iframe");
    aIframe.setAttribute("id", "exitTranframe");
    aIframe.setAttribute("name", "exitTranframe");
    aIframe.style.display = "none";
    aIframe.scrolling = "no";
    aIframe.allowTransparency = "false";
    aIframe.src = url;

    $("body").append(aIframe);
    $("body").append(form);
    form.submit();
  },
  TripleDES(userId) {
    let key = Utils.featuresDefault("tripledes.key", "");
    var encrypted = CryptoJS.TripleDES.encrypt(userId, "");
    return String(encrypted);
  },
  contentDownload(evData) {
    let url = `${store.state.baseURL}/json/download?from=${store.state.rootId}&elementId=${evData.r_object_id}&sid=${Utils.getCookie('auth')}`
    Utils.fileDownload(url);
  }

};
export default Utils;
