import * as i18n from "@/i18n";
import moment from "moment";
import Constants from "@/Constants";
import * as api from "@/utils/api";
import Utils from "@/utils/utils";

const mutations = {
  FETCH_INFO: (state, value) => {
    state.info = value.info;
  },
  closeHovers: state => {
    state.show = null;
    state.showMessage = null;
  },
  showHover: (state, value) => {
    if (typeof value !== "object") {
      state.show = value;
      return;
    }
    state.show = value.prompt;
    state.showMessage = value.message;
    state.showConfirm = value.confirm;
  },
  showError: (state, value) => {
    state.show = "error";
    state.showMessage = value;
  },
  showSuccess: (state, value) => {
    state.show = "success";
    state.showMessage = value;
  },
  setLoading: (state, value) => {
    state.loading = value;
  },
  setReload: (state, value) => {
    state.reload = value;
  },
  setReloadList: (state, value) => {
    state.reloadList = value;
  },
  setUser: (state, value) => {
    console.log("mutation : setUser");
    // 20180607, user별 언어설정 불가하게 수정. 브라우저에 따름
    // let locale = value.locale
    // if (locale === '') {
    // locale = i18n.detectLocale()
    // }
    let settingLocale = value["locale"] || "ko";
    let locale = i18n.detectLocale(settingLocale);

    moment.locale(locale);
    i18n.default.locale = locale;
    state.user = value;

    // viewOption
    state.viewOption.pageSize = value["u:PageSize"]
      ? Number(value["u:PageSize"])
      : 30;

    let codePageSize = Utils.featuresDefault("pageSize", 30);
    if (state.viewOption.pageSize < codePageSize)
      state.viewOption.pageSize = Number(codePageSize);
    if (Constants.isValidFilesView(value["u:PageView"]))
      state.viewOption.view = value["u:PageView"];

    // set shortcuts
    state.shortcuts = value["u:ShortCut"];
  },
  setLocale: (state, value) => {
    state.user.locale = value;
  },
  addShortCut: (state, value) => {
    state.shortcuts.push(value);
  },
  removeShortCut: (state, value) => {
    state.shortcuts.splice(value, 1);
  },
  setCSS: (state, value) => (state.css = value),
  setSharedId: (state, value) => (state.sharedId = value),
  setSharedContent: (state, value) => (state.sharedContent = value),
  setDepartId: (state, value) => (state.departId = value),
  setTicket: (state, value) => (state.ticket = value),
  multiple: (state, value) => (state.multiple = value),
  addSelected: (state, value) => state.selected.push(value),
  addSelectedByItem: (state, value) => {
    let newVal = {
      r_object_id: value.r_object_id,
      object_name: value.object_name,
      docTypeName: value.docTypeName,
      isFolder: value.r_object_type === "dm_folder" ? true : false,
      r_folder_path: value.r_folder_path,
      size: value.r_content_size,
      path: value.idPath
    };
    if (value.rewriteId) newVal.rewriteId = value.rewriteId;
    state.selected.push(newVal);
  },
  setMGlogin: (state, value) => {
    state.mgLogin = value;
  },
  setLGUplus: (state, value) => {
    state.LGUplus = value;
  },
  setLGUSER: (state, value) => {
    state.LGUplusUSERID = value;
  },
  setSelected: (state, value) => {
    state.selected = value;
  },
  clearSelected: state => (state.selected = []),
  setCurrentDir: (state, value) => {
    state.currentDir = value;
  },
  setCurrentDirName: (state, value) => {
    state.currentDirName = value;
  },
  setRootId: (state, value) => {
    state.rootId = value;
    // user home id
    if (state.user && state.user.homeFolderId === value)
      state.rootId = "Workspace";
  },
  setRootMap: (state, value) => {
    state.rootMap = new Map(value);
  },
  addRoot: (state, value) => {
    if (!state.rootMap) state.rootMap = new Map();
    state.rootMap.set(value.name, { id: value.id, css: value.css });
  },
  setCurrentDirInfo: (state, value) => {
    if (value) state.currentDirInfo = Object.assign({}, value);
    else state.currentDirInfo = value;
  },
  setViewOption: (state, value) => {
    console.log("mutation : setViewOption");
    let viewOption = state.viewOption;
    viewOption.view = value;
    state.viewOption = viewOption;
    console.log(state.viewOption);
    api.saveUserAttr({ "u:PageView": value });
  },
  setColumnOption: (state, value) => {
    console.log("mutation : setColumnOption");
    let viewOption = state.viewOption;
    viewOption.columns = value;
    console.log(viewOption.columns);
    api.saveUserAttr({ "u:ColumnSize": value });
  },
  setSearchViewOption: (state, value) => {
    console.log("mutation : setViewOption");
    let viewOption = state.viewOption;
    viewOption.view = value;
    state.viewOption = viewOption;
  },
  setViewOrderBy: (state, value) => {
    state.viewOption.dir = value;
  },
  setViewTarget: (state, value) => {
    state.viewOption.orderBy = value;
  },
  addPlugin: (state, value) => {
    state.plugins.push(value);
  },
  removeSelected: (state, value) => {
    let i = state.selected.indexOf(value);
    if (i === -1) return;
    state.selected.splice(i, 1);
  },
  resetSelected: state => {
    state.selected = [];
  },
  updateUser: (state, value) => {
    if (typeof value !== "object") return;

    for (let field in value) {
      state.user[field] = value[field];
    }
  },
  updateRequest: (state, value) => {
    state.req = value;
  },
  updateClipboard: (state, value) => {
    state.clipboard.key = value.key;
    state.clipboard.items = value.items;
  },
  resetClipboard: state => {
    state.clipboard.key = "";
    state.clipboard.items = [];
  },
  setSchedule: (state, value) => {
    state.schedule = value;
  },
  setProgress: (state, value) => {
    state.progress = value;
  },
  setMovableToParent: (state, value) => {
    state.isMovableToParent = value;
  },
  setDocTypes: (state, value) => {
    state.docTypes = value;
  },

  // rules
  setRuleTypes: (state, value) => {
    state.ruleTypes = value;
  },
  setRuleConditions: (state, value) => {
    state.ruleConditions = value;
  },
  setRuleConstraints: (state, value) => {
    state.ruleConstraints = value;
  },
  setRuleActions: (state, value) => {
    state.ruleActions = value;
  },

  // set predefined permission
  setPreDefinedPermissions: (state, value) => {
    state.preDefinedPermissions = value;
  },
  // set security profiles for using permission dialog
  setSecurityProfiles: (state, value) => {
    state.securityProfiles = value;
  },
  // draft
  setDraftCommands: (state, value) => {
    state.draftCommands = value;
  },
  setSecurityPolicy: (state, value) => {
    state.securityPolicyList = value;
  },
  setSearchOption: (state, value) => {
    state.lastSearchOption = value;
  },
  setFirstLogin: (state, value) => {
    state.user.isFirstLogin = value;
  },

  // 복사 붙여넣기
  setCanCopy: (state, value) => {
    state.canCopy = value;
  },
  setCopySelectedList: (state, value) => {
    state.copySelectedList = value;
  },
  setmoveSelectedList: (state, value) => {
    state.moveSelectedList = value;
  },
  setCopyList: (state, value) => {
    state.copyList = value;
  },
  setMoveList: (state, value) => {
    state.moveList = value;
  },
  setMoveTreeList: (state, value) => {
    state.moveTreeList = value;
  },
  setMoveTableList: (state, value) => {
    state.moveTableList = value;
  },
  setmoveTableEnabled: (state, value) => {
    state.moveTableEnabled = value;
  },
  setStatusMessage: (state, value) => {
    state.selectStatusMessage = value;
  },

  //setUserName
  setNewUserName: (state, value) => {
    state.newUserName = value;
  },

  setIsDragged: (state, value) => {
    state.isDragged = value;
  },

  setIsCarryout: (state, value) => {
    state.isCarryout = value;
  },

  setCarryoutList: (state, value) => {
    state.carryoutList = value;
  },

  setCurrentPath: (state, value) => {
    state.currentPath = value;
  },
  setIsHq: (state, value) => {
    state.isHq = value;
  },
  setPasswordExpired: (state, value) => {
    state.passwordExpired = value;
  }
};

export default mutations;
