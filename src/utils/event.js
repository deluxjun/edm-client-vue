import Vue from "vue";

window.EventList = {
  FOLDER_SELECTED: "folder_selected",
  LOAD_TREEDATA_FOLDER: "load_treedata_folder",
  LOAD_TREEDATA_CATEGORY: "load_treedata_category",
  RELOAD_TREE: "reload_tree",
  SEARCH: "search",
  SEARCH_TAG: "search_tag",
  CLOSE_POPUPS: "close_popups",
  RELOAD_LIST: "reload_list", // reload list grid
  RELOAD_DIR: "reload_dir", // reload current dir
  GOTO_PARENT: "goto_parent", // goto parent folder
  OPEN_CONTEXT: "open_context",
  FILE_OPEN: "file_open",
  FILE_DOWNLOAD: "file_download",
  TREE_CLEAR_SELECTION: "tree_clear_selection",
  GRID_AUTOFIT: "grid_autofit",
  ADD_SHORTCUT: "add_shortcut",
  OPEN_SPLITTER: "open_splitter",
  CLOSE_SPLITTER: "close_splitter",
  LOAD_SPLITTER: "load_splitter",
  CUSTOM_SEARCH: "custom_search",
  CUSTOM_TOOLBAR: "custom_toolbar",
  PERMISSION_ACL: "change_acl",
  PERMISSION_RIGHT: "change_right",
  PROFILE: "profile_edit",
  PROFILE_CHANGE: "profile_change",
  PROFILE_REFRESH: "profile_refresh",
  USERGROUP_DOUBLECLICK: "double_click",
  SEARCH_DEFAULT: "search_default",
  SEARCH_RESET: "search_reset",
  RESTORE_RELOAD: "restore_reload",
  GRID_UPDATE_DATA: "grid_update_data",
  GRID_SELECT_ALL: "grid_select_all",
  GRID_DESELECT_ALL: "grid_deselect_all",
  SHOW_PROGRESS: "show_progress",
  CLEAR_DATA: "clear_data",
  NOTIFY_SELECTED: "notifySelected",
  TABLE_REFRESH: "table_refresh",
  ALARM_RELEASE: "alarm_release",
  ALARM_USERRELEASE: "alarm_userlease",
  /*PERMISSION*/
  PERMISSION_PRIVGROUP: "privGroup",
  PERMISSION_REUSE: "permission_reuse",
  /*VERSION*/
  VERSION_REVERT: "version_rever",
  VERSION_DOWN: "version_dwon",

  /* DASH SESSION */
  SESSION_WIDGET_REFRESH: "session_widget_refresh",

  /* GROUPWARE */
  GROUPWARE: "groupware",
  GROUPWARECLOSE: "groupware_close"
};

window.Event = new class {
  constructor() {
    this.vue = new Vue();
  }

  fire(event, data = null) {
    this.vue.$emit(event, data);
  }

  listen(event, callback) {
    this.vue.$on(event, callback);
  }

  off(event) {
    this.vue.$off(event);
  }

  debug() {
    console.log(this.vue);
  }
}();
