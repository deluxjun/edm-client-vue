
<template >
    <div id="main-tableview" :style="{ height: dialogHeight }">
        <ag-grid-vue id="myGrid" style="width: 100%;" :style="{ height: dialogMyGridHeight }" class="ag-theme-balham"
                     :gridOptions="gridOptions"
                     :rowDoubleClicked="onDoubleClicked"
                     :cellContextMenu="onRightClicked"
                     :selectionChanged="onSelectionChanged"
                     :bodyScroll="onBodyScroll"
                     :rowSelection="setMultiple">
        </ag-grid-vue>
        <div v-if="!isDialog" id="tablev_toolbar" style="height:30px;border: 1px solid lightgray;background-color:#f6f6f6" >
            <div class="level-left" style="height:100%;width:50%;float:left">
                &nbsp;&nbsp;<h4>{{ toolbarSelectedMessage }}</h4>
            </div>
            <div class="level-right refreshbtn" style="height:100%;float:right;">
                <h4>{{ toolbarMessage }}</h4>&nbsp;&nbsp;
                <!-- <el-button @click="refreshPage" icon="el-icon-refresh" type="info" size="mini" circle></el-button>&nbsp;&nbsp; -->
            </div>
        </div>
    </div>
</template>
<script>
import Vue from "vue";
import fp from "lodash/fp";

import * as api from "@/utils/api";
import listMixin from "./ListMixin";
import { mapGetters, mapState, mapMutations } from "vuex";
import { AgGridVue } from "ag-grid-vue";
import constants from "../Constants";
import mgCheck from "@/utils/MGCheckLogin";
import Utils from "@/utils/utils";

export default {
  name: "table-view",
  mixins: [listMixin],
  ...mapMutations(["setSelected", "setCurrentDirInfo", "setRootId"]),
  components: {
    AgGridVue
  },
  watch: {
    "$store.state.lastSearchOption.content.r_folder_id"(val) {
      this.setGridColumns();
    },
    rootId() {
      this.setGridColumns();
    },
    currentDir() {
      this.resetPage();
      //this.loadGridData();
    }
  },
  computed: {
    ...mapState(["user"])
  },
  props: {
    gridSelectable: {
      default: constants.SELECTABLE.MULTIPLE,
      type: String
    },
    dialogHeight: {
      default: "calc(100% - 30px)",
      type: String
    },
    isDialog: {
      default: false,
      type: Boolean
    }
  },
  data: function() {
    return {
      setMultiple: "",
      dialogFolderId: "",
      dialogMyGridHeight: "95%",
      toolbarMessage: "",
      toolbarSelectedMessage: "",
      listOptions: {
        currentPage: 1,
        dataCnt: this.$store.state.viewOption.pageSize,
        folderId: null,
        sort: "name",
        desc: "asc"
      },
      sortModel: {
        colId: "object_name",
        sort: "asc"
      },
      initSelect: true,
      currentSelected: [],
      gridOptions: {
        enableColResize: true,
        rowBuffer: 0,
        rowSelection: "multiple",
        rowDeselection: true,
        columnDefs: [
          //?????? ???????????? ????????? ????????????
          { headerName: "Filename", field: "object_name", sort: "asc" },
          { headerName: "Size", field: "r_content_size" },
          { headerName: "Modified Date", field: "r_modify_date" },
          { headerName: "Modifier", field: "modifier_name" },
          { headerName: "Version", field: "doc:Version" }
        ],
        getRowNodeId: function(data) {
          return data.r_object_id;
        },
        rowModelType: "infinite",
        paginationPageSize: this.$store.state.viewOption.pageSize,
        cacheBlockSize: this.$store.state.viewOption.pageSize,
        maxConcurrentDatasourceRequests: 1,
        infiniteInitialRowCount: 0,
        maxBlocksInCache: 60,
        enableServerSideSorting: true,
        overlayNoRowsTemplate: "",
        overlayLoadingTemplate:
          '<span style="padding: 10px; border: 1px solid #444; background: lightgoldenrodyellow;">' +
          i18n.t("files.loading") +
          "</span>"
      },
      NEW_GRID_COLUMN: {
        // ??????????????? ???????????? ????????? ?????? constants??? ?????? ????????? ???????????? ?????? -byungho
        FILENAME: {
          headerName: i18n.t("files.name"),
          field: "object_name",
          checkboxSelection: true,
          cellRenderer: this.iconCellCreator,
          sort: "asc",
          width: 250
        },
        INDICATOR: {
          headerName: "",
          field: "r_object_id",
          cellRenderer: this.indicatorCellCreator,
          suppressSorting: true,
          width: 50
        },
        PATH: {
          headerName: i18n.t("label.path"),
          field: "r_folder_path",
          suppressSorting: true,
          width: 200
        },
        DRM: {
          headerName: i18n.t("label.drm"),
          field: "drm",
          suppressSorting: true,
          width: 78,
          cellRenderer: this.DRMCellCreator
        },
        FILESIZE: {
          headerName: i18n.t("files.size"),
          field: "r_content_size",
          cellRenderer: this.sizeCellCreator,
          width: 85
        },
        MODIFIED_DATE: {
          headerName: i18n.t("files.lastModified"),
          field: "r_modify_date",
          width: 140
        },
        MODIFIER: {
          headerName: i18n.t("files.modifier"),
          field: "modifier_name",
          width: 100
        },
        CREATED_DATE: {
          headerName: i18n.t("label.creation_date"),
          field: "r_creation_date",
          width: 140
        },
        CREATER: {
          headerName: i18n.t("label.create_userid"),
          field: "producer_name",
          width: 100
        },
        OWNER: {
          headerName: i18n.t("files.owner"),
          field: "owner_name",
          width: 100
        },
        VERSION: {
          headerName: i18n.t("files.version"),
          field: "doc:Version",
          suppressSorting: true,
          width: 85
        },
        DELETE_DATE: {
          headerName: i18n.t("files.deleteDate"),
          field: "r_modify_date",
          width: 140
        },
        LOCK_OWNER: {
          headerName: i18n.t("files.lockowner"),
          field: "r_lock_owner_name",
          width: 100
        },
        DELETE: {
          headerName: i18n.t("files.deleteName"),
          field: "modifier_name",
          width: 100
        }
      },
      receivedShare: false
    };
  },
  mounted() {
    this.init();
    this.setGridColumns();

    // ??????????????? ?????????
    if (this.isDialog == false) {
      Event.off(EventList.GRID_UPDATE_DATA);
      Event.listen(EventList.GRID_UPDATE_DATA, this.updateData);

      Event.off(EventList.GRID_SELECT_ALL);
      Event.listen(EventList.GRID_SELECT_ALL, this.selectAll);

      Event.off(EventList.GRID_DESELECT_ALL);
      Event.listen(EventList.GRID_DESELECT_ALL, this.deselectAll);

      Event.off(EventList.TABLE_REFRESH);
      Event.listen(EventList.TABLE_REFRESH, this.refreshPage);

      this.setMultiple = "multiple";
      let self = this;

      // ???????????? ??????
      let draggedRow;

      // treeview ????????? ?????????
      let treeview = $("#treeview").data("kendoTreeView");

      if (Utils.featuresDefault("userDragDropFileMove", false)) {
        // ????????? ?????????
        $(document)
          .on("dragstart", ".ag-row", function(e) {
            draggedRow = $(e.target).attr("row-id");
            store.commit("setIsDragged", true);
            // ??????????????? ??? ?????????????????? ???
            $(".ag-row")
              .off("drop")
              .on("drop", function(e2) {
                if (draggedRow == null) return false;

                // ?????? ?????? ????????? ?????????
                var parentNodeRow = $(e2.target.closest(".ag-row"));
                var rowId = parentNodeRow.attr("row-id");

                // ?????? ?????????
                var files = self.gridOptions.api.getSelectedRows();

                // ???????????? ????????? ?????? ???????????? ??????????????? ??????
                var tmp = files.find(x => x.r_object_id == rowId);

                // ????????? ?????? ?????????
                var moveList = [];

                var p1 = new Promise((resolve, reject) => {
                  // ????????? ??????
                  for (var i = 0, l = files.length; i < l; i++) {
                    moveList.push(files[i].r_object_id);
                  }

                  // ??????????????? ??????????????? ???????????? ???
                  if (!moveList.includes(draggedRow)) {
                    moveList.push(draggedRow);
                  }
                  resolve();
                }).then(() => {
                  if (tmp == undefined) {
                    // ????????? ???????????? ?????? move?????????
                    if (
                      parentNodeRow
                        .find("i")[0]
                        .classList.contains("fa-folder") &&
                      moveList.length != 0 &&
                      !moveList.includes(rowId)
                    ) {
                      api.copy(moveList, rowId, "allowRename").then(data => {
                        console.log(data);
                        Event.fire(
                          EventList.SHOW_PROGRESS,
                          data.actionId,
                          true
                        );
                        store.commit("setCopyList", null);
                        store.commit("setMoveList", null);
                      });
                    }
                    draggedRow = null;
                  } else {
                    draggedRow = null;
                    return false;
                  }
                });
              });
          })
          .on("dragover", function(e) {
            e.preventDefault();
          })
          .on("dragend", function(e) {
            e.preventDefault();
            draggedRow = null;
            store.commit("setIsDragged", false);
          });

        // ????????? ????????? ????????? ???
        $(document).on("dragenter", ".k-item", function(e) {
          e.originalEvent.preventDefault();
          e.originalEvent.stopPropagation();
          if (draggedRow == null) {
            return false;
          }
          // ???????????? ????????? ???????????????
          $(e.target)
            .off("drop")
            .on("drop", function(e2) {
              if (draggedRow == null) {
                return false;
              }
              e2.originalEvent.preventDefault();
              e2.originalEvent.stopPropagation();

              // treeview?????? ?????? ????????? ?????????
              var uid = $($(e2.target).closest(".k-item")[0]).data("uid");
              var target = treeview.findByUid(uid);
              var dataSet = treeview.dataItem(target);

              var rowId = dataSet.r_object_id;
              var files = self.gridOptions.api.getSelectedRows();
              var moveList = [];

              var p1 = new Promise((resolve, reject) => {
                for (var i = 0, l = files.length; i < l; i++) {
                  moveList.push(files[i].r_object_id);
                }

                // ??????????????? ??????????????? ???????????? ???
                if (!moveList.includes(draggedRow)) {
                  moveList.push(draggedRow);
                }
                resolve();
              }).then(() => {
                // ???????????? ????????? ?????? ???????????? ?????????????????? ??????
                if (!moveList.includes(rowId) && moveList.length != 0) {
                  api.copy(moveList, rowId, "overwrite").then(data => {
                    self.refreshPage();
                    Event.fire(EventList.SHOW_PROGRESS, data.actionId, true);
                    store.commit("setCopyList", null);
                    store.commit("setMoveList", null);
                  });
                } else {
                  return false;
                }
              });
            });
        });
      }
    } else {
      Event.off(EventList.NOTIFY_SELECTED);
      Event.listen(EventList.NOTIFY_SELECTED, this.noti_selected);
      // $("#explorer-right").css({"overflow": "hidden"})
      // this.setMultiple = "single";
      this.setMultiple = "multiple";
      this.dialogMyGridHeight = "100%";
    }
  },
  methods: {
    init() {
      // ???????????? ??? ?????? ??????????????? ?????? ????????? ????????? ????????? ???
      $("#main-tableview").on("mouseup", ".ag-body-viewport", function(ev) {
        var eBodyContainer = $(ev.target)
          .parent()
          .parent()[0].attributes["ref"].nodeValue;
        var checkIsRealEmptyArea =
          $(ev.target)
            .parent()
            .parent()[0].childNodes.length > 3
            ? true
            : false;
        if (
          ev.button == 2 &&
          checkIsRealEmptyArea &&
          eBodyContainer != "eBodyContainer"
        ) {
          Event.fire(EventList.GRID_DESELECT_ALL);
          ev.preventDefault();
          // open context
          Event.fire(EventList.OPEN_CONTEXT, {
            event: ev,
            from: constants.ATTRIBUTE.CURRENT_DIR
          });
        }
      });
    },
    handleChanged(e) {
      this.$emit("changed", e);
      this.dialogFolderId = e.r_object_id;
    },
    noti_selected(e) {
      this.dialogFolderId = e;
      this.loadGridData(true);
      this.resetPage();
    },
    loadData() {
      this.resetPage();
      if (this.isDialog == true) {
        this.dialogFolderId = store.state.rootId;
        this.loadGridData(true);
      } else {
        this.loadGridData();
      }
      this.gridOptions.api.deselectAll();
      this.setSelected(this.gridOptions.api.getSelectedRows());
    },
    refreshPage() {
      this.resetPage();
      if (this.isDialog != true) {
        this.loadGridData();
      } else {
        this.loadGridData(true);
      }
      this.gridOptions.api.deselectAll();
      this.setSelected(this.gridOptions.api.getSelectedRows());
    },
    resetPage() {
      this.listOptions.currentPage = 1;
      this.toolbarSelectedMessage = "";
      this.toolbarMessage = "";
    },
    setGridColumns() {
      var obj = this;
      var type = "COMMON";
      console.log("===========================>");
      console.log(this.rootId);
      if (
        this.rootId == "approval" ||
        this.rootId == "request" ||
        this.rootId == "complete"
      ) {
        type = "APPROVAL";
      }
      if (this.rootId == "trash" || this.rootId == "onlyExpired") {
        type = "TRASH";
      } else if (this.rootId == "receivedShare" || this.rootId == "inShare") {
        type = "RECVSHARE";
      } else if (this.rootId == "search") {
        if (
          this.$store.state.lastSearchOption.content.r_folder_id ==
            "onlyExpired" ||
          this.$store.state.lastSearchOption.content.r_folder_id == "trash"
        ) {
          type = "TRASH";
        } else {
          type = "SEARCH";
        }
      }
      var gridColumnList;
      //kendo???????????? ?????? column ????????? ag grid ???????????? ???????????? ?????? ???(???????????? ??????)
      var commonColums = Utils.features("gridColumn");
      if (type === "COMMON") {
        if (commonColums) {
          gridColumnList = commonColums.split(",");
        } else {
          gridColumnList = constants.GRID_COLUMN_TEMPLATE[type];
        }
      } else {
        gridColumnList = constants.GRID_COLUMN_TEMPLATE[type];
      }
      var columns = [];
      gridColumnList.forEach(name => {
        name = name.trim();
        var column = obj.NEW_GRID_COLUMN[name];
        if (column) {
          columns.push(column);
        }
      });
      /*
      2020-04-23 : ?????????
      ???????????? ?????? ??????????????? ????????? ?????? ??????????????? ?????? ?????? ????????? ????????? ?????????
      ??????????????? ????????? ??????????????? ???????????? ?????? ???????????? ?????? ???????????? ?????????.
      */
      this.gridOptions.api.setColumnDefs([]);
      this.gridOptions.api.setColumnDefs(columns);
      if (
        this.rootId == "search" ||
        this.rootId == "trash" ||
        this.rootId == "receivedShare" ||
        this.rootId == "inShare" ||
        this.rootId == "onlyExpired"
      ) {
        this.gridOptions.columnApi.setColumnVisible("r_folder_path", true);
      } else {
        this.gridOptions.columnApi.setColumnVisible("r_folder_path", false);
      }
      //this.gridOptions.columnApi.moveColumn('r_folder_path', 2);
    },
    loadGridData(loadDialogGrid = false, receivedFolderId) {
      if (this.currentDir === null) return false;
      var obj = this;
      var dataSource = {
        rowCount: null, // behave as infinite scroll
        getRows: function(params) {
          obj.gridOptions.api.showLoadingOverlay();
          //?????? ?????? ?????????????????? ??????
          if (!params.sortModel[0] && obj.sortModel) {
            obj.sortModel = null;
            obj.resetPage();
            obj.sortFactory(null);
          } else if (params.sortModel[0]) {
            if (
              !obj.sortModel ||
              (params.sortModel[0].sort != obj.sortModel.sort ||
                params.sortModel[0].colId != obj.sortModel.colId)
            ) {
              obj.sortModel = params.sortModel[0];
              obj.resetPage();
              obj.sortFactory(params.sortModel[0]);
            }
          }

          var currentPage = obj.listOptions.currentPage;
          var requestFunc = null;
          var requestOption = {};

          if (loadDialogGrid != true) {
            switch (obj.rootId) {
              case "search":
                {
                  requestFunc = obj.requestSearch;
                  requestOption = {
                    currentPage: currentPage,
                    args: store.state.lastSearchOption.content
                  };
                }
                break;
              case "Categories":
                {
                  requestFunc = obj.requestNormalFileList;
                  requestOption = {
                    currentPage: currentPage,
                    type: "elementEclass"
                  };
                }
                break;
              // case 'onlyExpired':{
              //     requestFunc = obj.requestExpiredFileList;
              //     requestOption={
              //         currentPage:currentPage,
              //         type:obj.rootId
              //     }
              // }; break;
              default:
                {
                  requestFunc = obj.requestNormalFileList;
                  requestOption = {
                    currentPage: currentPage,
                    type: obj.rootId
                  };
                }
                break;
            }
          } else if (
            obj.rootId == "receivedShare" &&
            receivedFolderId != null
          ) {
            requestFunc = obj.requestReceivedShare;
            requestOption = {
              folderId: receivedFolderId,
              currentPage: currentPage
            };
          } else {
            requestFunc = obj.requestDialogFileList;
            requestOption = {
              folderId: obj.dialogFolderId,
              currentPage: currentPage,
              type: obj.rootId
            };
          }
          requestFunc(params, requestOption)
            .then(data => {
              if (obj.listOptions.currentPage == 1) {
                if (data.list.length <= 0) {
                  obj.gridOptions.api.showNoRowsOverlay();
                  $(".ag-overlay-no-rows-center").html(
                    constants.LISTGRID_EMPTY_MESSAGE_FACTORY(
                      obj.rootId,
                      obj.currentDir
                    )
                  );
                  obj.toolbarMessageFactory(0, true);
                  params.successCallback([], 0);
                  obj.setCurrentDirInfo(data.current);
                  return;
                }
                obj.setCurrentDirInfo(data.current);
              }

              if (obj.listOptions.dataCnt == data.list.length) {
                obj.listOptions.currentPage = currentPage + 1;
              }

              var lastRow = -1;
              if (data.list.length < obj.listOptions.dataCnt) {
                //moreData??? ????????????(????????? ????????? ?????? ??????)
                lastRow =
                  (currentPage - 1) * obj.listOptions.dataCnt +
                  data.list.length;
                obj.toolbarMessageFactory(lastRow, true);
              } else {
                obj.toolbarMessageFactory(
                  (currentPage - 1) * obj.listOptions.dataCnt +
                    data.list.length,
                  false
                );
              }

              params.successCallback(data.list, lastRow);
              obj.gridOptions.api.hideOverlay(); //????????? ?????????
            })
            .then(() => {
              if (
                obj.isDialog == false &&
                Utils.featuresDefault("userDragDropFileMove", false)
              ) {
                $(".ag-row").attr("draggable", true);
              }
            });
        }
      };
      this.gridOptions.api.setDatasource(dataSource);
    },
    onDoubleClicked(event) {
      if (this.isDialog != true) {
        this.mgLoginCheck(event);
      }
    },
    mgLoginCheck(event) {
      let evData = {
        r_object_id: event.data.r_object_id,
        object_name: event.data.object_name,
        r_folder_path: event.data.r_folder_path,
        idPath: event.data.idPath
      };
      this.setSelected([evData]);
      let mgConnect = Utils.featuresDefault("mgConnect.websocket.open", false);

      if (mgConnect) {
        //????????? ????????? ??????
        if (this.rootId == "trash") {
          //??????????????? ?????? ??????
        } else {
          if (event.data.r_object_type == "dm_folder") {
            //??????????????? ??????
            // if(this.rootId=='receivedShare'){
            //     this.resetPage();
            //     this.loadGridData(true,evData.r_object_id);
            // }else{
            Event.fire(EventList.FOLDER_SELECTED, evData);
            //}
          } else if (this.rootId === "myShared") {
            evData = {
              r_object_id: event.data.rid,
              object_name: event.data.object_name,
              r_folder_path: this.$t("files.myShared") + "/" + event.data.text,
              idPath: event.data.idPath
            };
            Event.fire(EventList.FOLDER_SELECTED, evData);
          } else {
            //????????? ??????
            let dalimeRequest = Utils.featuresDefault(
              "mgConnect.dbClick.dalimeRequest",
              false
            );
            if (this.user.isOutsideSubnet && dalimeRequest) {
              //?????????
              api
                .getDocInfo(event.data.r_object_id)
                .then(data => {
                  let list = data.list;
                  let localPath = list[0].path + list[0].object_name;
                  let successCallback = function() {};
                  let failCallCheckout = function() {
                    let NotInstall = Utils.featuresDefault(
                      "mgConnect.dbClick.syn",
                      false
                    );
                    if (NotInstall) {
                      Event.fire(EventList.FILE_OPEN, evData);
                    } else {
                      Event.fire(EventList.FILE_DOWNLOAD, evData);
                    }
                  };
                  mgCheck.openDoc(
                    successCallback,
                    failCallCheckout,
                    event.data.r_object_id,
                    localPath,
                    "R"
                  );
                })
                .catch(error => {});
            } else {
              api
                .getDocInfo(event.data.r_object_id)
                .then(data => {
                  let list = data.list;
                  let localPath = list[0].path + list[0].object_name;
                  api
                    .getMenu(event.data.r_object_id)
                    .then(data => {
                      if (data.editLockDoc == "Y") {
                        let successCallback = function() {};
                        let failCallCheckout = function() {
                          let NotInstall = Utils.featuresDefault(
                            "mgConnect.dbClick.syn",
                            false
                          );
                          if (NotInstall) {
                            Event.fire(EventList.FILE_OPEN, evData);
                          } else {
                            Event.fire(EventList.FILE_DOWNLOAD, evData);
                          }
                        };
                        mgCheck.openDoc(
                          successCallback,
                          failCallCheckout,
                          event.data.r_object_id,
                          localPath,
                          "W"
                        );
                      } else {
                        let successCallback = function() {};
                        let failCallCheckout = function() {
                          let NotInstall = Utils.featuresDefault(
                            "mgConnect.dbClick.syn",
                            false
                          );
                          if (NotInstall) {
                            Event.fire(EventList.FILE_OPEN, evData);
                          } else {
                            Event.fire(EventList.FILE_DOWNLOAD, evData);
                          }
                        };
                        mgCheck.openDoc(
                          successCallback,
                          failCallCheckout,
                          event.data.r_object_id,
                          localPath,
                          "R"
                        );
                      }
                    })
                    .catch(error => {});
                })
                .catch(error => {});
            }
          }
        }
      } else {
        //????????? ?????? ?????? ??????
        console.log(this.rootId);
        if (this.rootId == "trash") {
          //??????????????? ?????? ??????
        } else {
          if (event.data.r_object_type == "dm_folder") {
            //??????????????? ??????
            // if(this.rootId=='receivedShare'){
            //    this.resetPage();
            //    this.loadGridData(true,evData.r_object_id);
            //    //this.$router.push({ path: "/files/" + evData.r_folder_path });
            // }
            // else{
            Event.fire(EventList.FOLDER_SELECTED, evData);
            //}
          } else {
            //????????? ??????
            if (this.user.isOutsideSubnet) {
              //?????????
              Event.fire(EventList.FILE_DOWNLOAD, evData);
            } else {
              let NotInstall = Utils.featuresDefault(
                "mgConnect.dbClick.syn",
                false
              );
              if (NotInstall) {
                Event.fire(EventList.FILE_OPEN, evData);
              } else {
                Event.fire(EventList.FILE_DOWNLOAD, evData);
              }
            }
          }
        }
      }
    },
    onRightClicked(ev) {
      if (this.isDialog) {
        return;
      }
      if (!ev.node.selected) {
        ev.api.deselectAll();
        ev.node.setSelected(true);
        var selected = this.gridOptions.api.getSelectedRows();
        this.setSelected(selected);
        Event.fire(EventList.OPEN_CONTEXT, {
          event: ev.event,
          from: constants.ATTRIBUTE.COMMON_FILE
        });
      } else {
        Event.fire(EventList.OPEN_CONTEXT, {
          event: ev.event,
          from: constants.ATTRIBUTE.COMMON_FILE
        });
      }
      store.commit("setmoveTableEnabled", true);
    },
    onSelectionChanged(ev) {
      var selected = this.gridOptions.api.getSelectedRows();
      this.setSelected(selected);

      if (selected == null) {
        this.toolbarSelectedMessageFactory(0, null);
      }
      if (selected[0]) {
        this.toolbarSelectedMessageFactory(
          selected.length,
          selected[0].object_name
        );
      }

      var selectList = [];
      this.gridOptions.api.getSelectedRows().forEach(e => {
        selectList.push(e.r_object_id);
      });
      store.commit("setCopySelectedList", selectList);
      store.commit("setmoveSelectedList", selectList);

      // if(this.isDialog == true && this.gridOptions.api.getSelectedRows()[0]) {
      //     this.handleChanged(this.gridOptions.api.getSelectedRows()[0]);
      // }
      if (this.gridOptions.api.getSelectedRows()[0]) {
        this.handleChanged(this.gridOptions.api.getSelectedRows()[0]);
      }
    },
    onBodyScroll() {
      if (this.isDialog == false && Utils.features("userDragDropFileMove")) {
        $(".ag-row").attr("draggable", true);
      }
    },
    DRMCellCreator(params) {
      if (params.data) {
        if (params.data.r_object_type == "dm_folder") {
          return "";
        } else {
          let drm = "N";
          if (params.data) {
            if (params.data.attrList) {
              for (var i = 0; i < params.data.attrList.length; i++) {
                if (params.data.attrList[i]["name"] == "ext:drm") {
                  drm = params.data.attrList[i].value;
                }
              }
            }
          }
          return drm;
        }
      }
    },
    sizeCellCreator(params) {
      return Utils.filesize(params.value) || "-";
    },
    iconCellCreator(params) {
      if (!params.data) {
        return params.value;
      }
      var template = `<i class="${
        this.rootId === "myShared"
          ? "fa fa-share-alt"
          : Utils.getContentTypeClass(
              params.data.r_object_type,
              params.data.dos_ext
            )
      }"></i> <span style="margin-left:5px;">${params.value}</span>`;

      let ibm = Utils.featuresDefault("ibm.root.sites", true);
      if (ibm) {
        if (
          this.rootId != "trash" &&
          this.rootId != "onlyExpired" &&
          this.rootId != "bookmark" &&
          this.rootId != "myShared" &&
          !(
            store.state.rootId == "search" &&
            (store.state.lastSearchOption.content.r_folder_id == "trash" ||
              store.state.lastSearchOption.content.r_folder_id == "onlyExpired")
          )
        ) {
          if (typeof params.data.bookmarked == "undefined") {
            template +=
              "<span id='star_" +
              params.data.r_object_id +
              "' class='fa fa-star-o bookmarked' onclick='Utils.changeBookmarkLogo(\"" +
              params.data.r_object_id +
              "\");' title='" +
              i18n.t("files.bookmark") +
              "'></span>";
          } else {
            template +=
              "<span id='star_" +
              params.data.r_object_id +
              "' class='fa fa-star bookmarked' onclick='Utils.changeBookmarkLogo(\"" +
              params.data.r_object_id +
              "\");' title='" +
              i18n.t("files.bookmark") +
              "'></span>";
          }
        }
      }
      return template;
    },
    indicatorCellCreator(params) {
      if (!params.data) {
        return "";
      }
      var template =
        "<div id='indic_" +
        params.data.r_object_id +
        "' class='list-indicator'>" +
        Utils.getIndicators(params.data) +
        "</div>";
      return template;
    },
    sortFactory(sortModel) {
      if (!sortModel) {
        sortModel = { colId: "object_name", sort: "asc" };
      }

      console.log(sortModel.colId);
      switch (sortModel.colId) {
        case "object_name":
          this.listOptions.sort = "name";
          break;
        case "owner_name":
          this.listOptions.sort = "creator";
          break;
        case "r_content_size":
          this.listOptions.sort = "size";
          break;
        case "r_modify_date":
          this.listOptions.sort = "lastModified";
          break;
        case "r_modify_date":
          this.listOptions.sort = "lastModified";
          break;
        case "r_creation_date":
          this.listOptions.sort = "creationDate";
          break;
        case "modifier_name":
          this.listOptions.sort = "modifier";
          break;
        case "producer_name":
          this.listOptions.sort = "producer";
          break;
        default:
          this.listOptions.sort = "name";
      }

      this.listOptions.desc = sortModel.sort || "asc";

      console.log("aaaaaaaaaaaaaaaa");
      console.log(this.listOptions);
    },
    toolbarMessageFactory(cnt, isEnd) {
      if (isEnd) {
        this.toolbarMessage = cnt + i18n.t("files.items");
      } else {
        this.toolbarMessage = cnt + i18n.t("files.moreItems");
      }
    },
    toolbarSelectedMessageFactory(cnt, first) {
      if (cnt == 0) {
        this.toolbarSelectedMessage = "";
      } else if (cnt == 1) {
        this.toolbarSelectedMessage = first;
      } else {
        this.toolbarSelectedMessage = i18n.t("label.selectedWithCount", {
          name: first,
          count: cnt
        });
      }
    },
    requestNormalFileList(params, requestOption) {
      return api.getFileFolderList(
        this.currentDir,
        requestOption.currentPage,
        this.listOptions.dataCnt,
        this.listOptions.sort || "name",
        this.listOptions.desc || "asc",
        requestOption.type
      );
    },
    requestFolderList(params, requestOption) {
      return api.getFolderList(
        this.currentDir,
        requestOption.currentPage,
        this.listOptions.dataCnt,
        this.listOptions.sort || "name",
        this.listOptions.desc || "asc",
        requestOption.type
      );
    },
    requestDialogFileList(params, requestOption) {
      return api.getFileFolderList(
        requestOption.folderId,
        requestOption.currentPage,
        this.listOptions.dataCnt,
        this.listOptions.sort || "name",
        this.listOptions.desc || "asc",
        requestOption.type
      );
    },
    requestSearch(params, requestOption) {
      return api.searchIndex(
        requestOption.args,
        requestOption.currentPage,
        this.listOptions.dataCnt,
        this.listOptions
      );
    },
    requestExpiredFileList(params, requestOption) {
      return api.getExpiredFileFolderList(
        this.currentDir,
        requestOption.currentPage,
        this.listOptions.dataCnt,
        this.listOptions.sort || "name",
        this.listOptions.desc || "asc",
        requestOption.type
      );
    },
    requestReceivedShare(params, requestOption) {
      return api.getFileFolderList(
        requestOption.folderId,
        requestOption.currentPage,
        this.listOptions.dataCnt,
        this.listOptions.sort || "name",
        this.listOptions.desc || "asc",
        requestOption.type
      );
    },
    selectAll() {
      console.log("?????? ?????????");
      this.gridOptions.api.forEachNode(node => {
        node.setSelected(true);
      });
    },
    deselectAll() {
      this.gridOptions.api.deselectAll();
    },
    updateData(data) {
      console.log(data);
      var rowNode = this.gridOptions.api.getRowNode(data.object_id.toString());

      var rowData = fp.clone(rowNode.data);
      rowData[data.key] = data.value;
      rowNode.setData(rowData);
    }
  }
};
</script>
