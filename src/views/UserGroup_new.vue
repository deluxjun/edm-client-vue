<template>
  <el-container class="usergroup-class" :style="containerStyle">
    <script id="treeViewTemplate" type="text/kendo-ui-template">
      <span class="cursor">
        <i class="fa fa-users"></i>
        <span class='desGroup'>#: item.description#</span>
        #if(item.id!=null){#
        <span class='idGroup'>(#: item.id#)</span>
        #}#
      </span>
    </script>

    <el-aside v-show="showTree" :width="treeWidth">
      <el-container>
        <el-main>
          <kendo-treeview :id="treeWidgetId" ref="refTreeview"
            :data-source="treeDataSource"
            :data-text-field="'name'"
            @databound='onTreeDataBound'
            @select='onSelectTree' :auto-bind='false'
            :template='getTemplateScript()'>
          </kendo-treeview>
        </el-main>
      </el-container>
    </el-aside>
    <el-container class="height100 wdith100" v-show="showOnlyGroupTree">
      <el-header class="toolbar bg-purple-light">
        <el-dropdown v-show="showSearch" @command="selectSearchType" trigger="click">
          <el-button size="small" type="info">
          <span class='selectType'>  {{$t('label.user')}}</span>
          <i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <template v-for="item in searchList">
              <el-dropdown-item :command="item.id" >{{$t(item.text)}}</el-dropdown-item>
            </template>
          </el-dropdown-menu>
       </el-dropdown>
        <el-input v-show="showSearch" type="text" :placeholder="$t('buttons.search')" size="small" v-model="autoCompleteValue" @keydown.native="handleChange">
          <i class="el-icon-search el-input__icon" slot="prefix"></i>
          <i class="el-icon-circle-close-outline el-input__icon" slot="suffix" @click='resetSearch'></i>
        </el-input>
      </el-header>
      <el-main>
        <div class='leftAggrid'>
        <ag-grid-vue id="searchGrid" :style="'height: 552px'" class="ag-theme-balham" 
          :gridOptions="gridOptions"
          :rowSelection="setMultiple"
          :selectionChanged="onSelectionChanged"
        ></ag-grid-vue>
        </div>
        <div class='rightMoveBtn' v-if="showMemoryList"><button @click="onMemoryList"><i class='k-icon k-i-arrow-double-60-right rowCursor'></i></button></div>
      </el-main>
    </el-container>
    <el-aside style="overflow: hidden;" width="180px" v-if="showMemoryList">
      <el-header class="toolbar bg-purple-light selectedListHeader" height="50px">
        {{$t('adminMenu.selectedlist')}}
      </el-header>
      <el-main>
        <el-input type="text" :placeholder="$t('buttons.search')" size="small" v-model="selectListSearch" @keydown.native="handleChange2">
          <i class="el-icon-search el-input__icon" slot="prefix"></i>
          <i class="el-icon-circle-close-outline el-input__icon" slot="suffix" @click='resetSearch2'></i>
        </el-input>

        <div id="usergroupSelectedList">
          <div class='rightMoveList'>
            <div :key="data.id" v-for="data in selectedDataTagSearch" class='boxlist'>
                <div v-if='data.type==0 || data.groupNamePath' class='view'><i class='fa fa-users'></i><span :title='data.description+"("+data.id+")"'>{{data.description}}({{ data.id }})</span></div>
                <div v-if='data.type==-1' class='view'><i class='fa fa-user'></i><span :title='data.name+"("+data.id+")"'>{{data.name}}({{ data.id }})</span></div>
                <div class='viewdel' @click="handleRemoveManager(data)"><i class="el-icon-error"></i></div>
            </div>
          </div>
          <div class="loading-modal" v-if="memoryListLoading">
            <div class="center-text">
              Loading...
            </div>
          </div>
        </div>
      </el-main>
    </el-aside>
  </el-container>
</template>

<script>
import Vue from "vue";

import { mapGetters, mapState, mapMutations } from "vuex";
import {
  TreeView,
  TreeViewItem,
  TreeViewInstaller
} from "@progress/kendo-treeview-vue-wrapper";

import listMixin from "./ListGridCommonMixin";

import Constants from "../Constants";
import * as api from "@/utils/api";

import { create } from "vue-modal-dialogs";
import Utils from "@/utils/utils";
import { AgGridVue } from "ag-grid-vue";

Vue.use(TreeViewInstaller);

export default {
  name: "usergroup",
  components: {
    AgGridVue
  },
  props: {
    viewType: {
      default: Constants.VIEW_TYPES.GROUP,
      type: String
    },
    widgetId: {
      default: "user",
      type: String
    },
    treeWidth: {
      default: "250px",
      type: String
    },
    tableWidth: {
      default: "100%",
      type: String
    },
    containerHeight: {
      default: "100%",
      type: String
    },
    containerWidth: String,
    gridSelectable: {
      default: "",
      type: String
    },
    AdminPage: {
      default: false,
      type: Boolean
    },
    memoryList: {
      default: false,
      type: Boolean
    }
  },
  data: function() {
    return {
      treeDataSource: api.getTreeDataSource(
        `${store.state.baseURL}/json/listGroup?includeSystem=` + this.AdminPage,
        "id",
        true,
        "list"
      ),
      grid: null,
      gridInitialized: false,
      autoCompleteValue: "",
      selectListSearch: "",
      timer: null,
      parentId: null,
      searchType: "user",
      templateScript: null,
      treeWidget: null,
      groupId: null,
      gridColumns: null,
      searchState: false,
      emptyMessage: {
        template: "<br><center>" + i18n.t("label.group_empty") + "</center>"
      },
      searchList: [],
      selectedDataTag: [],
      selectedDataTagSearch: [],
      gridOptions: {
        enableColResize: true,
        rowBuffer: 0,
        rowSelection: "multiple",
        rowDeselection: true,
        columnDefs: [
          //초기 기본값이 반드시 있어야함
          {
            headerName: this.$t("adminMenu.session_name"),
            field: "name",
            width: 130,
            lockPosition: true,
            cellRenderer: this.nameCellCreator
          },
          { headerName: "ID", field: "id", width: 80, lockPosition: true },
          {
            headerName: this.$t("label.Jikgub"),
            field: "Jikgub",
            width: 150,
            lockPosition: true,
            cellRenderer: this.Jikgubinfo,
            hide: true
          },
          {
            headerName: this.$t("label.path"),
            field: "path",
            width: 500,
            lockPosition: true,
            cellRenderer: this.pathCellCreator
          },
          {
            headerName: this.$t("label.subGroupInclude"),
            field: "subCheck",
            width: 150,
            cellRenderer: this.subGroupCheck,
            hide: true
          }
        ],
        getRowNodeId: function(data) {
          return data.id;
        },
        rowModelType: "infinite",
        paginationPageSize: 50,
        cacheOverflowSize: 3,
        maxConcurrentDatasourceRequests: 1,
        infiniteInitialRowCount: 0,
        maxBlocksInCache: 60,
        enableServerSideSorting: false,
        overlayNoRowsTemplate: "",
        overlayLoadingTemplate:
          '<span style="padding: 10px; border: 1px solid #444; background: lightgoldenrodyellow;">' +
          i18n.t("files.loading") +
          "</span>"
      },
      checkBoxList: [],
      listOptions: {
        currentPage: 1,
        dataCnt: 100,
        folderId: null,
        sort: "name",
        desc: "asc"
      },
      setMultiple: "",
      memoryListLoading: false
    };
  },
  computed: {
    ...mapState(["user"]),
    treeWidgetId() {
      return this.widgetId + "-tree";
    },
    showTypeIcon() {
      return this.viewType != Constants.VIEW_TYPES.USER;
    },
    showAssign: function() {
      return this.viewType == constants.VIEW_TYPES.GROUP && this.isAdmin;
    },
    showGroupPath: function() {
      return (
        this.viewType == constants.VIEW_TYPES.USER ||
        this.viewType == constants.VIEW_TYPES.SEL_USERGROUP ||
        this.viewType == constants.VIEW_TYPES.SEL_USER ||
        this.viewType == constants.VIEW_TYPES.SEL_GROUP
      );
    },
    showTree: function() {
      return (
        this.viewType == constants.VIEW_TYPES.GROUP ||
        this.viewType == constants.VIEW_TYPES.SEL_USERGROUP ||
        this.viewType == constants.VIEW_TYPES.SEL_USER ||
        this.viewType == constants.VIEW_TYPES.SEL_GROUP ||
        this.viewType == constants.VIEW_TYPES.SEL_GROUP_TREE
      );
    },
    showSearch() {
      return (
        this.viewType != constants.VIEW_TYPES.GROUP ||
        (this.viewType == constants.VIEW_TYPES.GROUP && this.isAdmin)
      );
    },
    showUpdateUser() {
      return this.viewType == constants.VIEW_TYPES.USER && this.isAdmin;
    },
    showOnlyGroupTree() {
      return this.viewType != constants.VIEW_TYPES.SEL_GROUP_TREE;
    },
    showSEL_GROUP() {
      return this.viewType == constants.VIEW_TYPES.SEL_GROUP;
    },
    showDoubleClick() {
      return (
        this.viewType == constants.VIEW_TYPES.SEL_USERGROUP ||
        this.viewType == constants.VIEW_TYPES.SEL_USER ||
        this.viewType == constants.VIEW_TYPES.SEL_GROUP
      );
    },
    showMemoryList() {
      return this.memoryList;
    },
    isAdmin() {
      return this.user.isAdmin;
    },
    containerStyle() {
      return "height: " + this.containerHeight + ";";
    },
    onlyUser() {
      return this.viewType == constants.VIEW_TYPES.SEL_USER;
    }
  },
  mounted() {
    this.init();
    Event.off(EventList.PROFILE_REFRESH);
    Event.listen(EventList.PROFILE_REFRESH, this.loadData);

    //kendo grid double click
    if (this.showDoubleClick) {
      $("#" + this.widgetId).on("dblclick", "tr.k-state-selected", function(e) {
        Event.fire(EventList.USERGROUP_DOUBLECLICK);
      });
    }
  },
  methods: {
    requestCompleted(param) {
      this.$notify({
        title: this.$t("label.success"),
        message: this.$t("messages.completed"),
        type: "success"
      });
      this.loadData();
      if (param != true) {
        this.refreshSelectedTreeNode();
      }
    },
    refreshSelectedTreeNode() {
      // refresh tree
      let selectedNode = this.treeWidget.select();
      if (selectedNode) {
        let selectedDataItem = this.treeWidget.dataItem(selectedNode);
        if (selectedDataItem) {
          selectedDataItem.loaded(false);
          selectedDataItem.load();
          this.treeWidget.select(selectedNode);
        }
      }
    },

    // tree select
    onSelectTree: function(ev) {
      let node = ev.node;
      let dataItem = ev.sender.dataItem(node);
      console.log("Event select :: " + dataItem.id);
      ev.sender.expand(node);
      this.searchState = false;
      this.$Utils.displayhidden("class", "k-grid-unassign", false);
      this.groupId = dataItem.id;
      this.$emit("selected", dataItem);
      this.loadData("tree");
    },
    //tree
    getTemplateScript() {
      if (!this.templateScript)
        this.templateScript = $("#treeViewTemplate").html();
      return this.templateScript;
    },
    handleChange(e) {
      clearTimeout(this.timer);
      if (e.keyCode === 13) {
        this.search(e.target.value);
      } else {
        if (Utils.isSearchableKey(e.keyCode))
          this.timer = setTimeout(() => this.search(e.target.value), 500);
      }
    },
    // autocomplete search
    search(value) {
      // TODO: search
      this.autoCompleteValue = value;
      if (this.searchType === "user" && this.autoCompleteValue != "") {
        this.loadData("userSearch");
      }
      if (this.searchType === "group" && this.autoCompleteValue != "") {
        this.loadData("groupSearch");
      }
      this.searchState = true;
    },
    handleChange2(e) {
      clearTimeout(this.timer);
      if (e.keyCode === 13) {
        this.selectedListSearch(e.target.value);
      } else {
        if (Utils.isSearchableKey(e.keyCode))
          this.timer = setTimeout(
            () => this.selectedListSearch(e.target.value),
            500
          );
      }
    },
    selectedListSearch(value) {
      var temp = [];

      this.selectedDataTag.forEach(e => {
        if (value == "") temp.push(e);
        else if (
          e.description.indexOf(value) != -1 ||
          e.id.indexOf(value) != -1
        ) {
          temp.push(e);
        }
      });
      this.selectedDataTagSearch = temp;

      this.$emit("selected", this.selectedDataTagSearch);
    },
    nameCellCreator(params) {
      if (params.data) {
        if (params.data.type == 0) {
          return (
            "<i class='fa fa-users groupIcon'></i> " + params.data.description
          );
        } else if (params.data.type == -1) {
          return "<i class='fa fa-user userIcon'></i> " + params.data.name;
        } else {
          return (
            "<i class='fa fa-users groupIcon'></i> " + params.data.description
          );
        }
      }
    },
    pathCellCreator(params) {
      if (params.data) {
        if (params.data.type == 0 || params.data.groupNamePath) {
          let count = 0;
          if (params.data.groupPath) {
            count = params.data.groupPath.split(">");
          }
          if (count.length == 1) {
            return "/";
          } else {
            let grouplist = "";
            let listminus = 1;
            if (params.data.groupPath) {
              grouplist = params.data.groupPath.split(",");
            } else if (params.data.groupNamePath) {
              grouplist = params.data.groupNamePath.split(",");
              listminus = 0;
            }

            if (grouplist.length == 0) {
              return "";
            } else if (grouplist.length == 1) {
              return grouplist[0];
            } else if (grouplist.length == 2 && grouplist[1].trim() == "") {
              return grouplist[0];
            } else {
              let titlelist = "";
              for (var i = 0; i < grouplist.length - listminus; i++) {
                titlelist += "(" + (i + 1) + ") " + grouplist[i].trim() + "\n";
              }
              let returnlist =
                "<span title='" +
                titlelist +
                "' class='handcursor'><b>" +
                this.$t("label.includegroup") +
                "(" +
                (grouplist.length - listminus) +
                ")</b></span>";
              return returnlist;
            }
          }
        } else if (params.data.type == -1) {
          let userlist = "";
          let listminus = 1;
          if (params.data.groupPath) {
            userlist = params.data.groupPath.split(",");
          } else if (params.data.parentGroupNamePath) {
            userlist = params.data.parentGroupNamePath.split(",");
            listminus = 0;
          }
          if (userlist.length == 0) {
            return "";
          } else if (userlist.length == 1) {
            return userlist[0];
          } else if (userlist.length == 2 && userlist[1].trim() == "") {
            return userlist[0];
          } else {
            let titlelist = "";
            for (var i = 0; i < userlist.length - listminus; i++) {
              titlelist += "(" + (i + 1) + ") " + userlist[i].trim() + "\n";
            }
            let returnlist =
              "<span title='" +
              titlelist +
              "'><b>" +
              this.$t("label.includegroup") +
              "(" +
              (userlist.length - listminus) +
              ")</b></span>";
            return returnlist;
          }
        }
      }
    },
    subGroupCheck(params) {
      if (params) {
        let hasLimit = Utils.featuresDefault(
          "userGroup.subGroupInclude.hasLimit",
          false
        );
        let isOver = false;

        if (hasLimit) {
          let depth = parseInt(
            Utils.featuresDefault("userGroup.subGroupInclude.showDepth", "3")
          );
          let groupList = params.data.groupPath.split(",");
          for (let g of groupList) {
            let group = g.split(">");

            if (depth <= group.length) {
              isOver = true;
              break;
            }
          }
        }

        if ((params.data.type == 0 && (hasLimit && isOver)) || !hasLimit) {
          var obj = this;

          let checkBox = document.createElement("input");
          checkBox.setAttribute("type", "checkbox");

          if (this.checkBoxList[params.data.count]) {
            checkBox.setAttribute("checked", "");
            checkBox.addEventListener("click", () => {
              obj.checkBoxChanged(params.data.count, false);
            });
          } else {
            checkBox.addEventListener("click", () => {
              obj.checkBoxChanged(params.data.count, true);
            });
          }

          return checkBox;
        }
      }
    },
    Jikgubinfo(params) {
      if (params.data.type == 0) {
        return "-";
      } else {
        if (params.data.JIKGUB_NM) {
          return params.data.JIKGUB_NM;
        }
      }
    },
    checkBoxChanged(index, value) {
      this.checkBoxList[index] = value;
    },
    loadData(loadStatus) {
      // 하위 부서 포함 조건 확인
      if (this.$Utils.featuresDefault("busanIncludeSubGroup", false)) {
        if (this.showMemoryList) {
          this.gridOptions.columnApi.setColumnVisible("subCheck", true);
        }
      }

      if (this.$Utils.featuresDefault("busanJIKGUB_NM", false)) {
        if (this.showMemoryList) {
          this.gridOptions.columnApi.setColumnVisible("Jikgub", true);
        }
      }

      this.resetPage();
      this.loadGridData(loadStatus);
    },
    loadGridData(loadStatus) {
      var obj = this;
      var dataSource = {
        rowCount: null, // behave as infinite scroll
        getRows: function(params) {
          obj.gridOptions.api.showLoadingOverlay();
          var currentPage = obj.listOptions.currentPage;
          var requestFunc = null;
          var requestOption = {};

          switch (loadStatus) {
            case "userSearch":
              {
                requestFunc = obj.requestUserSearch;
              }
              break;
            case "groupSearch":
              {
                requestFunc = obj.requestGroupSearch;
              }
              break;
            case "tree":
              {
                requestFunc = obj.requestTreeSelectedList;
              }
              break;
            default:
              {
                requestFunc = obj.requestTableList;
              }
              break;
          }
          requestOption = {
            currentPage: currentPage
          };
          requestFunc(params, requestOption)
            .then(data => {
              // 막누를 때 리스트 로딩 안되고 비어있는 열들이 로딩될 때 다시 로드함
              if (
                obj.listOptions.currentPage > 1 &&
                data.list.length == 0 &&
                data.totalCount - 1 > data.list.length
              ) {
                return false;
              }

              if (obj.listOptions.currentPage == 1) {
                if (data.list.length <= 0) {
                  obj.gridOptions.api.showNoRowsOverlay();
                  $(".ag-overlay-no-rows-center").html(
                    constants.LISTGRID_EMPTY_MESSAGE_FACTORY(
                      obj.rootId,
                      obj.currentDir
                    )
                  );
                  params.successCallback([], 0);
                  return;
                }
              }

              if (data.list.length > 0) {
                obj.listOptions.currentPage = currentPage + 1;
              }

              var lastRow = -1;
              if (data.list.length < obj.listOptions.dataCnt) {
                //moreData로 확인불가(반환이 안되는 곳도 있음)
                lastRow =
                  (currentPage - 1) * obj.listOptions.dataCnt +
                  data.list.length;
              }

              if (currentPage == 1) obj.checkBoxList = [];

              var rowList = [];
              var count = (currentPage - 1) * obj.listOptions.dataCnt;

              for (let i = 0; i < data.list.length; i++) {
                obj.checkBoxList.push(false);

                data.list[i].count = count;
                data.list[i].subCheck = obj.checkBoxList[count];

                count++;
              }

              // obj.checkBoxList = [];
              // // row data
              // data.list.forEach(rowData => {
              //   obj.checkBoxList.push(false);

              //   rowList.push(
              //     {
              //       count: count,
              //       data: rowData,
              //       id: rowData.id,
              //       subCheck: obj.checkBoxList[count]
              //     }
              //   );

              //   count++;
              // });

              params.successCallback(data.list, lastRow);
              obj.gridOptions.api.hideOverlay(); //로딩창 가리기
            })
            .then(() => {
              if (obj.isDialog == false) {
                $(".ag-row").attr("draggable", true);
              }
            });
        }
      };
      this.gridOptions.api.setDatasource(dataSource);
      this.gridOptions.api.sizeColumnsToFit();
    },
    resetPage() {
      this.listOptions.currentPage = 1;
    },
    requestTableList() {
      return api.getlistGroupAndUser(
        this.AdminPage,
        "list",
        null,
        this.onlyUser,
        true,
        this.listOptions.currentPage,
        this.listOptions.dataCnt
      );
    },
    requestTreeSelectedList() {
      if (this.groupId) {
        return api.getlistGroupAndUser(
          this.AdminPage,
          "tree",
          this.groupId,
          this.onlyUser,
          true,
          this.listOptions.currentPage,
          this.listOptions.dataCnt
        );
      } else {
        return api.getlistGroupAndUser(
          this.AdminPage,
          "list",
          null,
          this.onlyUser,
          true,
          this.listOptions.currentPage,
          this.listOptions.dataCnt
        );
      }
    },
    requestUserSearch() {
      if (this.autoCompleteValue) {
        return api.getlistGroupAndUserSearch(
          `/json/pagingUsersByIdOrName?userName=` +
            encodeURI(this.autoCompleteValue) +
            `&moreData=true&page=` +
            this.listOptions.currentPage +
            `&pageSize=` +
            this.listOptions.dataCnt
        );
      }
    },
    requestGroupSearch() {
      if (this.autoCompleteValue) {
        return api.getlistGroupAndUserSearch(
          `/json/pagingGroupsByName?groupName=` +
            encodeURI(this.autoCompleteValue) +
            `&moreData=true&page=` +
            this.listOptions.currentPage +
            `&pageSize=` +
            this.listOptions.dataCnt
        );
      }
    },
    listGroupIncludeSub(id, includeSelf, includeSubGroup) {
      return api.getListGroupIncludeSub(id, includeSelf, includeSubGroup);
    },
    resetSearch() {
      this.autoCompleteValue = "";
      this.search("");
    },
    resetSearch2() {
      this.selectListSearch = "";
      this.selectedListSearch("");
    },
    onTreeDataBound: function(ev) {
      console.log("Event :: tree dataBound");
    },
    onDataBound: function(ev) {
      // kendo 버그로 직접 갱신
      if ($(".usergroup-grid .k-pager-info")[0])
        $(
          ".usergroup-grid .k-pager-info"
        )[0].textContent = this.getPageMessage();

      if (this.searchState) {
        this.$Utils.displayhidden("class", "k-grid-unassign", true);
      } else {
        this.$Utils.displayhidden("class", "k-grid-unassign", false);
      }
      // set grid status message
      // if (this.$refs.usergroupGrid) {
      //   this.$refs.usergroupGrid.kendoWidget().pager.options.messages.display = this.getPageMessage();
      // }
    },
    // grid selection changed
    onSelectionChanged(e) {
      var selected = this.gridOptions.api.getSelectedRows();
      var selectedDataItems = [];
      let status = this.showMemoryList;

      this.gridOptions.api.getSelectedRows().forEach(function(e) {
        console.log(e);
        selectedDataItems.push(e);
      });

      if (!status) {
        this.$emit("selected", selectedDataItems);
      }
    },
    async onMemoryList() {
      var grid = this.gridOptions;
      var selected = grid.api.getSelectedRows();
      var selectedDataItems = [];
      var selectedDataTagId = [];
      var temp = this.selectedDataTag;

      for (var i = 0; i < this.selectedDataTag.length; i++) {
        selectedDataTagId.push(this.selectedDataTag[i].id);
      }

      //var obj = this;

      //grid.api.showLoadingOverlay();

      this.memoryListLoading = true;
      let selectedRows = grid.api.getSelectedRows();

      for (let i = 0; i < selectedRows.length; i++) {
        if (this.checkBoxList[selectedRows[i].count]) {
          const result = await this.listGroupIncludeSub(
            selectedRows[i].id,
            false,
            true
          );

          if (result) {
            if (result.errcode == "0") {
              result.list.forEach(function(e2) {
                if (selectedDataTagId.indexOf(e2.id) == -1) {
                  temp.push(e2);
                }
              });
            }
          }
        }

        if (selectedDataTagId.indexOf(selectedRows[i].id) == -1) {
          temp.push(selectedRows[i]);
        }
      }
      this.memoryListLoading = false;

      this.selectedDataTag = temp;
      this.selectedDataTagSearch = temp;

      this.$emit("selected", this.selectedDataTagSearch);

      // grid.api.getSelectedRows().forEach(async function(e) {
      //   if (obj.checkBoxList[e.count]){

      //     const result = await obj.listGroupIncludeSub(e.data.id, false, true);

      //     if (result){
      //       if (result.errcode == '0'){
      //         result.list.forEach(function(e2) {
      //           if (selectedDataTagId.indexOf(e2.id) == -1){
      //             temp.push(e2);
      //           }
      //         });
      //       }
      //     }
      //   }

      //   if(selectedDataTagId.indexOf(e.data.id) == -1){
      //     temp.push(e.data);
      //   }

      //   // grid.api.hideOverlay();

      //   obj.selectedDataTag = temp;
      //   obj.selectedDataTagSearch = temp;

      //   obj.$emit('selected', obj.selectedDataTagSearch)

      //   // obj.gridOptions.api.setDatasource(dataSource);
      // });
    },
    onTreeExpandComplete(e) {
      for (var i = 0; i < this.selectedDataTag.length; i++) {
        selectedDataTagId.push(this.selectedDataTag[i].id);
      }
    },
    selectSearchType(cmd) {
      this.searchType = cmd;
      $(".selectType").html("" + this.$t("label." + cmd));
    },
    handleRemoveManager(data) {
      // this.selectedDataTagSearch.splice(this.selectedDataTagSearch.findIndex(e => e === data), 1);
      this.selectedDataTag.splice(
        this.selectedDataTag.findIndex(e => e === data),
        1
      );
      this.selectedListSearch(this.selectListSearch);
    },
    init() {
      this.pageNum = 1;
      let vue = this;

      //grid selection option
      if (this.gridSelectable === "row") {
        this.setMultiple = "single";
      } else {
        this.setMultiple = "multiple";
      }

      //searchlist

      if (this.onlyUser) {
        this.searchList.push({
          id: "user",
          text: "label.user",
          icon: "fa fa-user"
        });
      } else if (this.showSEL_GROUP) {
        this.searchList.push({
          id: "group",
          text: "label.group",
          icon: "fa fa-group"
        });
      } else {
        this.searchList.push({
          id: "user",
          text: "label.user",
          icon: "fa fa-user"
        });
        this.searchList.push({
          id: "group",
          text: "label.group",
          icon: "fa fa-group"
        });
      }

      if (!this.gridInitialized) {
        //grid
        if (this.showOnlyGroupTree) {
          this.gridInitialized = true;
        }
        this.loadData();
        // tree
        if (this.showTree) {
          this.treeDataSource.add({ id: null, name: "/", description: "/" });
          this.treeDataSource.bind();
          // load root and select
          this.treeWidget = $("#" + this.treeWidgetId).data("kendoTreeView");
          this.treeWidget.expandPath([null], this.onTreeExpandComplete);
          var dataItem = this.treeDataSource.get(null);
          var node = this.treeWidget.findByUid(dataItem.uid);
          this.treeWidget.select(node);
        }
      }
    }
  }
};
</script>

<style lang="scss">
.usergroup-class .el-header,
.usergroup-class .el-footer {
  line-height: 50px;
}

.usergroup-class .el-input {
  min-width: 140px;
  width: auto;
}

.height100 {
  height: 100%;
}
.wdith100 {
  width: 100% !important;
}

.usergroup-class {
  //height: 100%;
}
// .usergroup-class .el-main .k-grid  {
//   height: calc(100% - 2px);
// }
.toolbar {
  margin-left: 5px;
  margin-right: 5px;
  margin-bottom: 5px;
  border-radius: 4px;
}
.usergroup-grid {
  padding-left: 5px;
  padding-right: 5px;
}
.bg-purple-dark {
  background: #99a9bf;
}
.bg-purple {
  background: #d3dce6;
}
.bg-purple-light {
  background: #e5e9f2;
}

.usergroup-grid td {
  text-align: center;
}

ul.groupPath {
  font-family: FontAwesome;
}

ul.groupPath li:before {
  content: "\f105 ";
  font-size: 15px;
  vertical-align: middle;
}
ul.groupPath li span {
  padding: 0 5px;
}
.color-success {
  color: #67c23a;
}
.color-warning {
  color: #e6a23c;
}
.space {
  margin-right: 5px;
}
#usergroupSelectedList .boxlist {
  width: 155px;
  border-bottom: 1px solid #ccc;
  margin-left: 6px;
  height: 30px;
}

#usergroupSelectedList .el-main {
  border: 1px solid #ccc;
  overflow-y: hidden;
}
.leftAggrid {
  float: left;
  width: calc(100% - 20px);
}
.rightMoveBtn {
  height: 550px;
  float: right;
}
.rightMoveBtn button {
  width: 10px;
  margin-top: 150px;
  height: 220px;
  background-color: #fff;
  border: 2px solid #fb6f26;
  color: #fb6f26;
}
.rightMoveList {
  height: 520px;
  width: 180px;
  float: left;
  border: 1px solid #ccc;
  overflow-y: scroll;
}
.boxlist i {
  margin-right: 5px;
  font-size: 10pt;
}
#usergroupSelectedList .view {
  width: 120px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  font-size: 10pt;
  margin-left: 5px;
  float: left;
}
#usergroupSelectedList .viewdel {
  float: right;
  cursor: pointer;
}
.usergroup-class .el-header {
  height: 42px !important;
  line-height: 40px !important;
}
.usergroup-class input {
  height: 30px !important;
}
.usergroup-class .el-dropdown {
  margin-left: -15px !important;
}
.userIcon {
  font-size: 11pt;
  color: #848484;
  margin-right: 5px;
}
.groupIcon {
  font-size: 11pt;
  color: #656565;
  margin-right: 5px;
}
.handcursor {
  cursor: pointer;
}
.rowCursor {
  margin-left: -5px;
  font-size: 12px !important;
}
.selectedListHeader {
  text-align: center;
}
.loading-modal {
  background: #d8d8d8;
  height: 100%;
  width: 100%;
  text-align: center;
}
.center-text {
  position: relative;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #000000;
}
</style>
