<template>
    <!--     <router-link class="action" to="/files/" :aria-label="$t('sidebar.myFiles')" :title="$t('sidebar.myFiles')">
      <i class="material-icons">folder</i>
      <span>{{ $t('sidebar.myFiles') }}</span>
    </router-link>
 -->
    <div id="edrm-main">
        <kendo-splitter id="files-splitter" :orientation="'horizontal'" :panes="[{collapsible: true, size: treePanePercent},{ },{collapsible: false, resizable: false, size: searchPercent}]">
            <div id="edrm-left">
              <shortcut id="shortcuts"></shortcut>
                  <template slot="title">
                    <i class="fa fa-folder title-icon"></i> {{ $t('files.files') }}
                  </template>
                  <kendo-treeview id="treeview" ref="ref_treeview"
                  :data-source="remoteDataSource"
                  :data-text-field="'text'"
                  @databound='onDataBound'
                  @select='onSelect'
                  @expand='onExpand'
                  :template="$Constants.TREEVIEW_TEMPLATE">
                  </kendo-treeview>
            </div>
            <div id="edrm-right">
               <edrm-list v-if="!edrmlist"></edrm-list>
               <iframe v-else id="customiframe" :src="customPageUrl" class='loginFrame' frameborder="0" scrolling="no" marginwidth="0" marginheight="0"></iframe>
              <!--progressBar-->
              <progressbar ref="mainProgressbar" message="Copy" :autoClose="true" @postAction="postAction"></progressbar>
            </div>
            <div id="edrm-search">
              <OverlapList ref="OverlapList"></OverlapList>
            </div>
        </kendo-splitter>

        <context-menu id="context-menu" ref="ctxMenu">
          <div v-if="contextHeader" >
            <li class="ctx-item" style="font-weight: 600;">{{ contextHeader }}</li>
            <hr class="ctx-line">
            <li v-if="!hasActions" class="ctx-item" style="font-weight: 600;">{{ $t('messages.noCommands') }}</li>
          </div>
          <div v-if="hasActions" v-for="(action,index) in actions" :key="action.id">
            <hr v-if="action.line && index > 0" class="ctx-line">
            <li @click="executeAction(action)" class="ctx-item">
                <i v-bind:class=action.icon></i> {{ $t( action.id ) }}
            </li>
          </div>
        </context-menu>

    </div>

</template>

<script>
import Vue from "vue";
import { mapGetters, mapState, mapMutations } from "vuex";
import EdrmListGrid from "./EdrmLIstGrid";
import ShortCuts from "./ShortCuts";

import { Splitter } from "@progress/kendo-layout-vue-wrapper";
import { DataSourceInstaller } from "@progress/kendo-datasource-vue-wrapper";
import {
  TreeView,
  TreeViewItem,
  TreeViewInstaller
} from "@progress/kendo-treeview-vue-wrapper";
import * as actions from "@/utils/actions";
import ContextMenu from "vue-context-menu";
import * as api from "@/utils/api";
import OverlapList from "@/views/OverlapList";

// Tell Vue to install the plugin.
Vue.use(TreeViewInstaller);
Vue.use(DataSourceInstaller);

export default {
  name: "files",
  components: {
    shortcut: ShortCuts,
    "edrm-list": EdrmListGrid,
    progressbar: () => import("@/components/prompts/Progressbar"),
    Splitter,
    ContextMenu,
    OverlapList
  },
  data() {
    return {
      addSitesToPath: false,
      recentMenus: null,
      activePanels: ["1", "2"],
      rootBounded: false,
      scrollinit: true,
      templateData: $("#treeview-template").html(),
      remoteDataSource: new kendo.data.HierarchicalDataSource({
        transport: {
          read: {
            url: this.getRequestUrl,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            beforeSend: function(req) {
              console.log("tree read requested");
              req.setRequestHeader(
                "Authorization",
                `Bearer ${Utils.getCookie("auth")}`
              );
            }
            // complete: function(jqXHR, textStatus) {
            //     console.log(textStatus, jqXHR)
            // }
            // dataFilter: function(data) {
            //   console.log('--------------------------------')
            //   console.log(data);
            //   return data
            // }
          }
        },
        schema: {
          model: {
            id: "rid",
            hasChildren: function(item) {
              return !(item.hasChildren === "false");
            }
          },
          data: "list"
        }
      }),
      urlParts: [],
      url: null,
      actions: [],
      treeview: null,
      init: false,
      contextHeader: null,
      overlap: {
        searchPane: false
      },
      treePage: 1,
      treePageSize: this.$Utils.features("tree.admin.pageSize") || 100
    };
  },
  watch: {
    $route: function() {
      this.searchPath();
    },
    $mq: function() {
      if (!this.init) return;
      var splitter = $("#files-splitter").data("kendoSplitter");
      if (this.$mq === "sm" || this.$mq === "md") {
        splitter.toggle("#edrm-left", false);
      } else if (this.$mq === "lg") {
        splitter.toggle("#edrm-left", true);
      }
    },
    reload: function() {
      this.reloadSelected();
    }
  },
  computed: {
    ...mapState([
      "info",
      "user",
      "req",
      "staticGen",
      "reload",
      "selected",
      "currentDir",
      "currentDirInfo",
      "rootId",
      "isCarryout",
      "carryoutList",
      "currentPath"
    ]),
    hasActions() {
      return this.actions && this.actions.length > 0;
    },
    // contextHeader() {
    //   let selected = this.$Utils.getCurrentSelect()
    //   if (!selected || selected.length < 1)
    //     return null
    //   let header = ''
    //   if (selected.length == 1)
    //     header = this.$t('label.selected', {name: this.$Utils.truncate(selected[0].object_name,20)})
    //   else
    //     header = this.$t('label.selectedWithCount', {name: this.$Utils.truncate(selected[0].object_name,20), count: selected.length})
    //   return header
    // },
    treePanePercent() {
      if (!this.user.treePanePercent) return "25%";
      return this.user.treePanePercent;
    },
    searchPercent() {
      return "0px";
    },
    edrmlist() {
      this.$Utils.featuresDefault("customPage", false);
    },
    customPageUrl() {
      return this.$Utils.featuresDefault("customPageUrl", "");
    }
  },
  created() {
    Event.off(EventList.RELOAD_TREE);
    Event.off(EventList.FOLDER_SELECTED);
    Event.off(EventList.FILE_OPEN);
    Event.off(EventList.FILE_DOWNLOAD);
    Event.off(EventList.GOTO_PARENT);
    Event.listen(EventList.RELOAD_TREE, this.reloadTree);
    // set events
    Event.listen(EventList.FOLDER_SELECTED, this.selectFolder);
    Event.listen(EventList.FILE_OPEN, this.openFile);
    Event.listen(EventList.FILE_DOWNLOAD, this.downloadFile);
    Event.listen(EventList.GOTO_PARENT, this.gotoParent);

    let self = this;
    window.addEventListener(
      "keydown",
      function(e) {
        e = e || window.event;
        var key = e.which || e.keyCode;
        var ctrl = e.ctrlKey ? e.ctrlKey : key === 17 ? true : false;

        // if ( key == 67 && ctrl ) { // 복사
        //     self.copy_keydown();
        // } else if ( key == 86 && ctrl ) { // 붙여넣기
        //     self.paste_keydown();
        // } else if ( key == 88 && ctrl ) {   // 잘라내기
        //     self.move_keydown();
        // }
      },
      false
    );
  },
  mounted() {
    let vue = this;
    $("#treeview").on("mouseup", ".k-item", function(event) {
      if (event.which === 3) {
        event.preventDefault();
        event.stopPropagation();

        // select
        let tree = kendo.jQuery('#treeview').data("kendoTreeView");
        vue.selectTreeView(this, true);
        // open context
        vue.openContext2({
          event: event,
          from: constants.ATTRIBUTE.COMMON_FOLDER
        });
      }
    });
    this.remoteDataSource.bind("error", this.handleError);
    this.treeview = kendo.jQuery('#treeview').data("kendoTreeView");
    // this.remoteDataSource.fetch();

    $("#treeview").on("click", "li .k-state-selected", function(e) {
      var treeview = kendo.jQuery('#treeview').data("kendoTreeView"),
        node = $(this).closest("li")[0];
      node.refresh = true;
      treeview.trigger("select", { node: node });
      node.refresh = false;
    });

    // event listen
    Event.off(EventList.OPEN_CONTEXT);
    Event.listen(EventList.OPEN_CONTEXT, this.openContext2);
    // clear selection event
    Event.off(EventList.TREE_CLEAR_SELECTION);
    Event.listen(EventList.TREE_CLEAR_SELECTION, this.clearSelection);

    // overlap event listen
    Event.off(EventList.OPEN_SPLITTER);
    Event.listen(EventList.OPEN_SPLITTER, this.overlapOpen);

    Event.off(EventList.CLOSE_SPLITTER);
    Event.listen(EventList.CLOSE_SPLITTER, this.overlapClose);

    //Restore event listen
    Event.off(EventList.RESTORE_RELOAD);
    Event.listen(EventList.RESTORE_RELOAD, this.restoreExpand);

    //Progress bar init listen
    Event.off(EventList.SHOW_PROGRESS);
    Event.listen(EventList.SHOW_PROGRESS, this.loadProgress);

    this.init = true;
  },
  beforeDestroy() {
    console.log("files destroying");
    this.setCurrentDir(constants.NOPE);
  },
  methods: {
    ...mapMutations([
      "setSelected",
      "setCurrentDir",
      "setCurrentDirName",
      "setCurrentDirInfo",
      "addRoot",
      "setReloadList",
      "setRootId",
      "setCurrentPath"
    ]),
    getContextHeader() {
      let selected = this.$Utils.getCurrentSelect();
      if (!selected || selected.length < 1) return this.$t("label.noItems");
      let header = "";
      if (selected.length == 1)
        header = this.$t("label.selected", {
          name: this.$Utils.truncate(selected[0].object_name, 20)
        });
      else
        header = this.$t("label.selectedWithCount", {
          name: this.$Utils.truncate(selected[0].object_name, 20),
          count: selected.length
        });

      this.$store.commit("setStatusMessage", header); // 클립보드 복사/이동 메세지
      return header;
    },
    copy_keydown() {
      if (store.state.canCopy == false) {
        return false;
      } else {
        if (store.state.copySelectedList.length <= 0) {
          return false;
        } else {
          store.commit("setMoveList", null);
          store.commit("setCopyList", store.state.copySelectedList);
          vue.$message(
            vue.$t("messages.copyToClipboard", {
              target: this.getContextHeader()
            })
          );
        }
      }
    },
    move_keydown() {
      if (store.state.canCopy == false) {
        return false;
      } else {
        if (store.state.moveSelectedList <= 0) {
          return false;
        } else {
          store.commit("setCopyList", null);
          store.commit("setMoveList", store.state.moveSelectedList);
          vue.$message(
            vue.$t("messages.copyToClipboard", {
              target: this.getContextHeader()
            })
          );
        }
      }
    },
    paste_keydown() {
      if (store.state.canCopy == false) {
        return false;
      } else {
        let self_vue = vue;

        if (store.state.copyList != null) {
          api
            .copy(store.state.copyList, store.state.currentDir, "allowRename")
            .then(data => {
              Event.fire(EventList.SHOW_PROGRESS, data.actionId, true);
              store.commit("setCopyList", null);
              store.commit("setMoveList", null);
            });
        } else if (store.state.moveList != null) {
          api
            .move(
              store.state.moveList,
              store.state.currentDir,
              "overwrite",
              null,
              true
            )
            .then(data => {
              Event.fire(EventList.SHOW_PROGRESS, data.actionId, true);
              store.commit("setCopyList", null);
              store.commit("setMoveList", null);
            });
        }
      }
    },
    getRequestUrl(data) {
      if (this.url) {
        // if(this.user.isAdmin){
        //   this.url+="&page="+this.treePage+"&pageSize="+this.treePageSize
        // }
        return this.url;
      }
      var type = this.rootId || data.rid;
      let isWeb = Utils.featuresDefault("vfmap.usableClient", false);
      let url = `${
        store.state.baseURL
      }/json/getTreeList2?simple=true&type=${type}&isWeb=${isWeb}`;
      // if(this.user.isAdmin){
      //   url+="&page="+this.treePage+"&pageSize="+this.treePageSize
      // }
      console.log("getRequestUrl : " + url);
      return url;
    },
    getContextHeader() {
      let selected = this.$Utils.getCurrentSelect();
      if (!selected || selected.length < 1) return this.$t("label.noItems");
      let header = "";
      if (selected.length == 1)
        header = this.$t("label.selected", {
          name: this.$Utils.truncate(selected[0].object_name, 20)
        });
      else
        header = this.$t("label.selectedWithCount", {
          name: this.$Utils.truncate(selected[0].object_name, 20),
          count: selected.length
        });

      this.$store.commit("setStatusMessage", header); // 클립보드 복사/이동 메세지
      return header;
    },
    openContext2(data) {
      console.log(`context open`);
      console.log(data);
      this.actions = null;
      this.contextHeader = null;
      if (this.$refs.ctxMenu.ctxVisible) this.$refs.ctxMenu.ctxVisible = false;
      let from = data.from || constants.ATTRIBUTE.NONE;
      let idArray = this.$Utils.getCurrentSelectId();
      console.log(idArray);
      let currentRootId = this.$Utils.getRootType(this.$route.path);
      currentRootId =
        this.$store.state.rootId === "search" &&
        this.$store.state.lastSearchOption.content.r_object_id
          ? this.$store.state.lastSearchOption.content.r_object_id
          : currentRootId || this.rootId;
      /*
      2020-04-21 : 김준호
      검색결과창이더라도 '휴지통' 등의 기능을 가진 문서함의 검색결과일 경우
      해당 컨텍스트메뉴가 보이도록 수정
      */
      //currentRootId = currentRootId || this.rootId
      console.log(`rootId : ${this.rootId}, current: ${currentRootId}`);
      if (this.rootId == "search") {
        if (this.$store.state.lastSearchOption.content.r_folder_id)
          currentRootId = this.$store.state.lastSearchOption.content
            .r_folder_id;
        else currentRootId = "search";
      }

      if (idArray) {
        let myvue = this;
        api.getMenu(idArray, currentRootId).then(response => {
          let selected = myvue.$Utils.getCurrentSelect();
          myvue.actions = actions.getActions(selected, response, from);
          myvue.recentMenus = response;
          // 상단 메뉴 클릭하거나, 액션이 있을 때만 오픈
          if (myvue.hasActions || from == constants.ATTRIBUTE.NONE) {
            myvue.contextHeader = this.getContextHeader();
            myvue.$refs.ctxMenu.open(data.event, {});
            console.log(idArray);
          }
          myvue.$nextTick(_ => {
            var obj = $("#toolbar-menu").offset();
            console.log("context from : " + from);
            if (obj && from == constants.ATTRIBUTE.NONE) {
              // #div의 현재 위치에서 특정치(50px)만큼 이동
              $("#context-menu").css("left", obj.left);
              $("#context-menu").css("top", obj.top + 30);
            }
          });
        });
      }
    },
    openFile(dataItem) {
      api.getMenu(dataItem.r_object_id, this.rootId).then(response => {
        if (response.openDoc == "Y") {
          let action = actions.getAction(this.$Constants.ACTIONS.VIEWER);
          action.do(this);
        }
      });
      // this.$router.push({
      //     path: "/viewer/"+dataItem.r_object_id,
      //   });
    },
    downloadFile(evData) {
      Utils.contentDownload(evData);
    },
    getPane(index) {
      index = Number(index);
      var splitterElement = $("#files-splitter");
      var panes = splitterElement.children(".k-pane");

      if (!isNaN(index) && index < panes.length) {
        return panes[index];
      }
    },
    overlapOpen(e) {
      this.overlap = e;
      var splitter = $("#files-splitter").data("kendoSplitter");
      var pane = this.getPane("2");
      splitter.size(pane, "350px");
    },
    overlapClose(e) {
      var splitter = $("#files-splitter").data("kendoSplitter");
      var pane = this.getPane("2");
      splitter.size(pane, "0px");
    },
    // tree error handling. ex 401
    handleError(e) {
      console.log("tree error : " + e.xhr.status);
      if (e.xhr.readyState == 0 || e.xhr.status == 401 || e.xhr.status == 0) {
        api.toLogin();
      }
    },
    // clear selection
    clearSelection(node) {
      this.treeview.select($());
      this.setCurrentDir("");
      this.setCurrentDirName("");
      this.setCurrentDirInfo(null);
      this.$store.commit("setMovableToParent", false); // disable
    },
    reloadTree(parent = false) {
      let selectedNode = this.treeview.select();
      this.reloadNode(selectedNode, parent);
    },
    reloadSelected(parent = false) {
      if (this.reload == false) return;

      if (this.reload == true) this.$store.commit("setReload", false);
      let selectedNode = this.treeview.select();
      this.reloadNode(selectedNode, parent);
    },
    reloadNode(node, parent = false) {
      if (node) {
        let dataItem = null;
        if (parent) {
          let parentNode = this.treeview.parent(node);
          if (parentNode.length > 0) {
            dataItem = this.treeview.dataItem(parentNode);
            // select parent
            this.selectFolder(dataItem);
          }
        } else {
          dataItem = this.treeview.dataItem(node);
          Event.fire(EventList.RELOAD_DIR, this.currentDir);
        }
        dataItem.hasChildren = true;
        dataItem.loaded(false);
        dataItem.load();
        // this.nodeToSelect = node
      } else {
        this.searchPath();
      }
    },
    searchPath: function() {
      console.log("SEARCHPATH");
      this.$store.commit("setReload", false);
      let path = decodeURIComponent(this.$route.fullPath);
      this.urlParts = Utils.getPath(path, store.state.webBaseURL).split("/");
      this.urlParts = Utils.cleanArray(this.urlParts);

      // let treeview = kendo.jQuery('#treeview').data("kendoTreeView");
      if (this.urlParts.length == 0) {
        let firstNode = $("#treeview").find(".k-first");
        let ibm = Utils.featuresDefault("ibm.root.sites", true);
        if (ibm) {
          if (!this.isCarryout) {
            this.setCurrentDir("Sites");
            this.setRootId("Sites");
            console.log("setRootId +++++>");
          } else {
            this.setRootId("carryout");
            this.setCurrentDir;
          }
        }
        Event.fire(EventList.RELOAD_LIST, this.currentDir);
        this.selectTreeView(firstNode, false);
        this.addSitesToPath = true;
      } else {
        console.log("expand to path :: " + this.urlParts);
        if (this.urlParts[0]) {
          let type = store.getters.getRootIdByName(
            decodeURIComponent(this.urlParts[0])
          );
          type = type || "";
          this.setRootId(type);
          let isWeb = Utils.featuresDefault("vfmap.usableClient", false);
          this.url = `${
            store.state.baseURL
          }/json/getTreeList2?simple=true&type=${type}&isWeb=${isWeb}`;
        }
        if (!this.isCarryout)
          this.expandPath(this.urlParts, this.onExpandCompleted);
      }
    },
    // 이름으로 찾아서 펼치기
    expandPath: function(path, complete, notRestore = true) {
      console.log(path);
      let treeview = this.treeview;
      var names = path;
      var callback = complete || $.noop;
      var lastId = null;
      var path = "";
      var count = 0;
      var treelistcount = path.length;

      function proceed() {
        names.shift();
        if (names.length) {
          expand(names[0]).then(proceed);
        } else {
          callback.call(treeview, lastId);
        }
      }

      function expand(name) {
        let childs = null;
        if (lastId) {
          childs = treeview.dataSource.get(lastId).list;
        } else {
          childs = treeview.dataSource.data();
        }
        var result = $.Deferred();
        let node = null;
        for (let i = 0; i < childs.length; i++) {
          if (childs[i].text === name) {
            node = childs[i];
            path += name + "/";
            node.set("pathName", path);
            lastId = node.id;
            break;
          }
        }

        if (node) {
          // 안펴지는 경우가 가끔있어서 혹시 몰라 한번더..
          // treeview.expand(node)
          console.log(node, node.loaded());
          if (node.loaded()) {
            if (!notRestore) {
              if (count == treelistcount) {
                node.loaded(false);
                treeview._progress(treeview.findByUid(node.uid), true);
                node.load();
              } else {
                node.set("expanded", true);
                result.resolve();
              }
              count++;
            } else {
              node.set("expanded", true);
              result.resolve();
            }
          } else {
            // manually show progress of the node
            // should be moved to `refresh`
            // if the datasource starts triggering a `requestStart` event for nodes
            treeview._progress(treeview.findByUid(node.uid), true);
            node.load().then(function() {
              node.set("expanded", true);
              result.resolve();
            });
          }
        } else {
          result.resolve();
        }

        return result.promise();
      }

      // expand async nodes
      expand(names[0]).then(proceed);
    },
    restoreExpand(e) {
      console.log(e.path);
      this.expandPath(e.path, this.onExpandCompleted, false);
    },
    onExpand: function(e) {
      let treeview = e.sender;
      var dataItem = treeview.dataItem(e.node);
      let parentData = dataItem.parentNode();

      let parentPath =
        parentData && parentData.pathName ? parentData.pathName : "";
      dataItem.set("pathName", parentPath + "/" + dataItem.text);

      console.log("onExpand : " + dataItem.pathName);

      // rootId는 다른 곳이면서, + 버튼만으로 tree 펼칠 경우를 판단해야함
      let currentRootId = this.$Utils.getRootType(parentPath);
      currentRootId = currentRootId || this.rootId;

      let type = currentRootId || "";
      if (dataItem.idPath.split("/").length <= 1) {
        //THIS IS ROOT
        type = dataItem.id || "";
      }
      let isWeb = Utils.featuresDefault("vfmap.usableClient", false);
      this.url = `${
        store.state.baseURL
      }/json/getTreeList2?simple=true&type=${type}&isWeb=${isWeb}`;
    },
    onExpandCompleted(id) {
      console.log("expand completed : " + this.urlParts + " " + id);
      let item = this.treeview.dataSource.get(id);
      if (item === undefined) return;
      let node = this.treeview.findByUid(item.uid);
      this.selectTreeView(node);
      document.title = item.text;
      if (this.scrollinit) {
        $("#edrm-left").scrollTop(node[0].offsetTop);
        this.scrollinit = false;
      }
    },
    onDataBound: function(ev) {
      console.log("Event :: dataBound");
      // 부서함 하위 팀 폴더는 CSS 적용
      let childNodes = $(".k-item", ev.node);
      for (let index = 0; index < childNodes.length; index++) {
        const n = childNodes[index];
        let d = this.treeview.dataItem(n);
        if (d && d.groupId)
          $(n)
            .find(".k-in")
            .addClass("tree-department");
      }
      if (!this.rootBounded) {
        // apply css
        $("#treeview > li > div").addClass("tree-root");
        // set root map
        const data = this.treeview.dataSource.data();
        //초기 RootId 설정
        if (data) {
          this.setCurrentDir(data[0].rid);
          this.setRootId(data[0].rid);
        }
        for (let index = 0; index < data.length; index++) {
          this.addRoot({
            name: data[index].text,
            id: data[index].rid,
            css: data[index].spriteCssClass
          });
          if (data[index].subFolders) {
            let subFolders = JSON.parse(data[index].subFolders);
            subFolders.forEach(sub => {
              this.addRoot({
                name: sub.text,
                id: sub.rid,
                css: sub.spriteCssClass
              });
            });
          }
        }

        if (this.$store.state.rootMap.values().next().value.id === "carryout") {
          this.$store.commit("setIsCarryout", true);
        }
        // just root
        this.searchPath();

        this.rootBounded = true;

        //미디어 라이브러리 제거
        const datalist = this.treeview.dataSource.data();
        for (var i = 0; i < datalist.length; i++) {
          if (datalist[i].r_object_type == "media") {
            var tree = kendo.jQuery('#treeview').data("kendoTreeView");
            var node = tree.findByUid(datalist[i].uid);
            tree.remove(node);
          }
        }
      }
    },
    getGroupID() {
      let grouplist = store.state.user.group;
      let groupId = "";
      if (grouplist) {
        for (var i = grouplist.length - 1; i > -1; i--) {
          if (grouplist[i].type != -1) {
            groupId = grouplist[i].id;
          }
        }
      }
      return groupId;
    },
    selectTreeView(node, withRoute = false) {
      if (withRoute) {
        this.treeview.trigger("select", { node: node });
      } else {
        this.treeview.select(node);
        let dataItem = this.treeview.dataItem(node);
        if (!dataItem.expanded) this.treeview.expand(node);
        this.updateState(node);
      }
      // this.updateState(node);
    },
    // goto parent
    gotoParent() {
      if (this.isCarryout) {
        let currPath = this.currentPath.split("/");
        let fullPath = this.$route.fullPath;
        let p = fullPath.split("/");

        if (fullPath.slice(-1) !== "/") {
          fullPath += "/";
        }

        if (p[p.length - 1] === "") {
          p.pop();
        }

        for (let i = currPath.length; i >= 0; i--) {
          if (this.carryoutList.includes(currPath[currPath.length - i])) {
            console.log(
              currPath,
              currPath[currPath.length - i],
              currPath.length - i,
              currPath.length - 3
            );

            if (currPath.length - i < currPath.length - 3) {
              this.setCurrentDir(currPath[currPath.length - 3]);
              this.setCurrentPath(
                currPath.splice(0, currPath.length - 2).join("/") + "/"
              );
              this.$router.push(p.slice(0, p.length - 1).join("/"));
              break;
            } else if (currPath.length - i === currPath.length - 3) {
              this.setCurrentDir(currPath[currPath.length - i]);
              this.setCurrentPath(
                currPath.splice(0, currPath.length - i).join("/") + "/"
              );
              this.$router.push(p.slice(0, p.length - 1).join("/"));
              break;
            } else {
              this.$router.push("/");
              break;
            }
          } else if (i === 0) {
            this.$router.push("/");
          }
        }
      } else {
        let selectedNode = this.treeview.select();
        if (selectedNode) {
          let parentNode = this.treeview.parent(selectedNode);
          if (parentNode.length > 0) {
            this.selectTreeView(parentNode, true);
          }
        }
      }
    },
    updateState(node, dataItem = null) {
      if (!dataItem) {
        dataItem = this.treeview.dataItem(node);
      }
      this.setCurrentDir(dataItem.rid);
      this.setCurrentDirName(dataItem.text);
      // enable or disable goto parent button
      if (this.treeview.parent(node).length > 0) {
        this.$store.commit("setMovableToParent", true); // enable
      } else if (this.isCarryout) {
        this.$store.commit("setMovableToParent", true); // enable
      } else {
        this.$store.commit("setMovableToParent", false); // disable
      }
    },
    // select event. called from kendo jquery.
    onSelect: function(ev) {
      let node = ev.node;
      let dataItem = ev.sender.dataItem(node);
      console.log(dataItem);
      console.log("Event select :: " + dataItem.idPath);

      // grid 선택 초기화
      this.$store.commit("clearSelected");
      this.updateState(node, dataItem);

      if (node.refresh) {
        node.refresh = undefined;
        Event.fire(EventList.RELOAD_DIR, this.currentDir);
        dataItem.loaded(false);
        dataItem.load();
      } else {
        this.selectFolder(dataItem);
        let type = this.rootId || "";
        if (dataItem.idPath.split("/").length <= 1) {
          //THIS IS ROOT
          type = dataItem.id || "";
        }
        let isWeb = Utils.featuresDefault("vfmap.usableClient", false);
        this.url = `${
          store.state.baseURL
        }/json/getTreeList2?simple=true&type=${type}&isWeb=${isWeb}`;
      }

      //복사 붙여넣기
      var selectList = [];
      selectList.push(dataItem.id);
      store.commit("setCopySelectedList", selectList);
      store.commit("setmoveSelectedList", selectList);
    },
    // select folder and route
    selectFolder(dataItem) {
      if (!dataItem.pathName) {
        // grid 또는 list에서 폴더 이동시
        if (typeof dataItem.parentNode !== "function") {
          if (this.rootId == "receivedShare") {
            let currentPath = this.$route.path;
            if (!currentPath.endsWith("/")) currentPath += "/";
            currentPath += dataItem.object_name;
            currentPath += "/";
            this.$router.push({ path: currentPath });
            return;
          }
          if (this.isCarryout) {
            this.setCurrentPath(dataItem.idPath);
            this.setCurrentDir(dataItem.r_object_id);

            if (this.$route.path === "/") {
              let enPath = dataItem.idPath.split("/");
              let koPath = dataItem.r_folder_path.split("/");

              for (let i = 0; i < enPath.length; i++) {
                if (this.carryoutList.includes(enPath[i])) {
                  koPath.splice(0, i);
                  koPath.unshift(this.$t("files.carryout2"));
                }
              }

              this.$router.push({
                path: this.$route.path + "/" + koPath.join("/")
              });
            } else {
              this.$router.push({
                path: this.$route.path + "/" + dataItem.object_name
              });
            }

            return;
          }
          if (this.currentDirInfo) {
            // 폴더 존재하는지 판단하여 없으면 reload 함.
            if (this.ReturnAddSitesVal()) {
              console.log("여기에 들어가지면 망한거임");
              this.$router.push({
                path:
                  "/files/" +
                  this.$t("files.Sites") +
                  "/" +
                  dataItem.object_name
              });
            } else {
              let parentItem = this.treeview.dataItem(this.treeview.select());
              let childs = parentItem.children.data();
              let found = false;
              for (let index = 0; index < childs.length; index++) {
                if (dataItem.object_name === childs[index].text) {
                  found = true;
                  break;
                }
              }

              console.log(found);
              if (!found) {
                // reload
                parentItem.loaded(false);
                parentItem.load();
              }
              this.$router.push({
                path: this.$route.path + "/" + dataItem.object_name
              });
            }
          } else {
            this.$router.push({ path: "/files/" + dataItem.r_folder_path });
          }
        }
        // treeview에서 폴더 이동시
        else {
          if (this.isCarryout) {
            this.setCurrentPath("/carryout");
            this.setCurrentDir("carryout");
            this.$router.push("/");
          } else {
            let lParentItem = dataItem.parentNode();
            let parentPath = "";
            if (lParentItem)
              parentPath =
                lParentItem.pathName && lParentItem.pathName.length > 0
                  ? lParentItem.pathName
                  : lParentItem.text;
            if (parentPath) {
              if (parentPath.substr(parentPath.length - 1, 1) == "/") {
                dataItem.set("pathName", parentPath + dataItem.text);
                this.$router.push({ path: "/files/" + dataItem.pathName });
              } else {
                dataItem.set("pathName", parentPath + "/" + dataItem.text);
                this.$router.push({ path: "/files/" + dataItem.pathName });
              }
            } else {
              dataItem.set("pathName", parentPath + "/" + dataItem.text);
              this.$router.push({ path: "/files/" + dataItem.pathName });
            }
          }
        }
      } else {
        this.$router.push({ path: "/files/" + dataItem.pathName });
      }
    },
    ReturnAddSitesVal() {
      let treeview = kendo.jQuery('#treeview').data("kendoTreeView");
      let dataItem = treeview.dataItem(treeview.select());
      if (dataItem.id == "Sites") {
        return true;
      } else {
        return false;
      }
    },
    // action context menu
    executeAction(action) {
      let currentView = this.$store.state.viewOption.view;
      let treeview = kendo.jQuery('#treeview').data("kendoTreeView");
      let dataItem = treeview.dataItem(treeview.select());
      //this.setCurrentDir(dataItem.rid);
      // vuex do not mutate error 야기.
      // this.setSelected(Utils.getSelectedListInView(this));
      action.do(this);
    },
    postAction() {
      Event.fire(EventList.RELOAD_LIST);
      Event.fire(EventList.RELOAD_TREE);

      var tree = kendo.jQuery('#treeview').data("kendoTreeView");
      for (var i = 0; i < store.state.moveList.length; i++) {
        var dataItem = tree.dataSource.get(store.state.moveList[i]);
        try {
          var node = tree.findByUid(dataItem.uid);
          tree.remove(node);
        } catch (e) {
          console.log(e);
        }
      }

      store.commit("setCopyList", null);
      store.commit("setMoveList", null);
      store.commit("setMoveTreeList", null);
      store.commit("setMoveTableList", null);
      store.commit("setmoveTableEnabled", false);
    },
    loadProgress(param) {
      this.$refs.mainProgressbar.getStatus(param, true);
    },
    callMorelist(pageUp) {
      this.treePage = parseInt(this.treePage) + parseInt(1);
      console.log("+++++++++++++++++++++++++> 트리 페이징");
      console.log(this.treePage);
    }
  }
};
</script>

<style lang="scss">
#edrm-main {
  /* header : 50, breadcrumb : 35 */
  height: calc(100% - #{$header-height});
  height: -o-calc(100% - #{$header-height}); /* opera */
  height: -webkit-calc(100% - #{$header-height}); /* google, safari */
  height: -moz-calc(100% - #{$header-height}); /* firefox */
}

#files-splitter,
#edrm-left {
  height: 100%;
}
#shortcuts {
  padding: 10px 0px 10px 0px;
  background-color: white;
}
#edrm-right {
  overflow: hidden;
}

#main-kendoList .k-state-selected,
#main-kendoGrid .k-state-selected {
  color: #000;
  background-color: #e2ebff !important;
  /* border: 1px solid #6493FF; */
}
#main-kendoGrid .k-state-selected td {
  color: #000 !important;
}
#main-kendoList > div:hover,
#main-kendoGrid .k-grid-content tr:hover {
  color: #000;
  background-color: #e2ebff !important;
}
#main-kendoList > div:hover .fa,
#main-kendoGrid .k-grid-content tr:hover .fa {
  color: rgba(107, 107, 107, 0.64);
}
#main-kendoList > div:hover .fa-folder,
#main-kendoGrid .k-grid-content tr:hover .fa-folder {
  // color: #2685e894
  color: rgba(255, 229, 90, 0.678);
}

.title-icon {
  padding: 0px 7px;
}

.k-pager-wrap {
  overflow: inherit;
  border: #f6f6f6;
}
.ctx-menu {
  position: absolute;
  top: 100%;
  left: 0;
  padding: 10px 0;
  margin: 5px 0;
  background-color: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  -webkit-box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
.ctx-item {
  /* padding: 3px 10px;*/
  list-style: none;
  line-height: 22px;
  padding: 0 20px;
  margin: 0;
  font-size: 13px;
  color: #606266;
  cursor: pointer;
  outline: 0;
}
.ctx-item > i {
  padding-right: 6px;
  width: 22px;
}
.ctx-line {
  border: none;
  border-bottom: 1px solid #e6e8eb;
  margin: 8px 0;
}

// #edrm-search{
//   display: none;
// }
@media screen and (max-width: 768px) {
  .viewer-details {
    display: none !important;
  }
}
</style>
