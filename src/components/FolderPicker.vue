<template id="boxTempl">
<el-dialog ref="windowRef" :title="$t('messages.selectFolder')" top="5vh" 
    :width="width" :before-close="onClose" :visible.sync="dialogVisible" v-draggable>
  
  <div id="box-tree" :style="{'max-height': containerHeight}" class="rules" v-loading="isLoading">
    <script id="boxTreeViewTemplate" type="text/kendo-ui-template">
      <span class="cursor">
        <span class='desGroup'>
           <i class='fa fa-folder treeFolderIcon'></i>
          #: item.text #
        </span>
      </span>
    </script>
    <el-container>
      <el-header class="toolbar bg-purple-light" height="50px">
        <el-dropdown @command="selectRootIdEvent" trigger="click">
          <span class="el-dropdown-link">
            {{ $t('messages.selectDocumentBox') }}<i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
          <template v-for="item in rootIdList">
            <el-dropdown-item v-if="item.type=='filefolder'" :command="item">{{ item.name }}</el-dropdown-item>
          </template>
          </el-dropdown-menu>
        </el-dropdown>
        <div>
          <span class="selectedItems">{{ selectedRootName }} </span>
          <span class="selectedItems">{{ showSelectedFolder }} </span>
        </div>
      </el-header>
      <el-main v-if="!showTree">
        <div class='defaultBox'>
          <i class='k-icon k-i-folder-open'></i>
        </div>
      </el-main>
      <el-main style="height: 500px;" v-if="showTree">
        <kendo-treeview id="boxTree" :data-source="remoteDataSource"
                :data-text-field="'text'"
                @databound='onDataBound'
                @select='onTreeSelect' :template="$Constants.TREEVIEW_TEMPLATE">
        </kendo-treeview>
      </el-main>
    </el-container>
  </div>

<span slot="footer" class="dialog-footer">
  <el-button type="primary" @click="selectAndClose()" :disabled="!canSave">{{ $t('buttons.ok') }}</el-button>
  <el-button @click="onClose">{{ $t('buttons.close') }}</el-button>
</span>

</el-dialog>  
</template>

<script>
import Vue from "vue";
import * as api from "@/utils/api";
import Constants from "@/Constants";
import { mapState } from "vuex";
import Utils from "@/utils/utils";
import {
  TreeView,
  TreeViewItem,
  TreeViewInstaller
} from "@progress/kendo-treeview-vue-wrapper";
import SelectUserGroupDialog from "@/views/SelectUserGroupDialog";
import refProgressbar from "@/components/prompts/Progressbar";
import { create } from "vue-modal-dialogs";

const userDialog = create(SelectUserGroupDialog);

Vue.use(TreeViewInstaller);

export default {
  name: "folderPicker",
  components: {
    //'async-progressbar': () => import('@/components/prompts/Progressbar'),
    refProgressbar,
    TreeView
  },
  props: {
    containerHeight: {
      default: "600px",
      type: String
    },
    width: {
      default: "300px",
      type: String
    },
    dynamic: {
      // createDialog 로 생성되면 true
      default: true,
      type: Boolean
    }
  },
  data() {
    return {
      dialogVisible: true,
      isLoading: true,
      templateScript: null,
      selectedName: "",
      selectedEid: "",
      selectedOwner: {
        id: "",
        name: ""
      },
      requestReload: true,
      selectedFolder: "",
      rootIdList: null,
      selectedRootId: null,
      selectedRootName: null,
      remoteDataSource: null,
      showTree: false
    };
  },
  watch: {},
  computed: {
    ...mapState(["user"]),
    isAdmin() {
      return this.user.isAdmin;
    },
    containerStyle() {
      return "height: " + this.containerHeight + ";";
    },
    showOwner() {
      if (this.selectedOwner.id)
        return Utils.getIdName(this.selectedOwner.id, this.selectedOwner.name);
      return "";
    },
    showSelectedFolder() {
      if (this.selectedName)
        return (
          " | " + this.$t("messages.selected", { folder: this.selectedName })
        );
      return "";
    },
    canSave() {
      return this.selectedName;
    }
  },
  components: {},
  mounted() {
    this.getRootId();
  },
  methods: {
    selectRootIdEvent(event) {
      this.showTree = true;
      $("#boxTree").empty();
      $("#boxTree").append("<div class='k-icon k-i-loading'></div> Loading...");
      this.selectedName = "";
      this.selectedRootId = event.id;
      this.selectedRootName = event.name;
      this.selectedEid = event.id;
      this.selectedName = event.name;
      this.remoteDataSource = api.getTreeDataSource(
        `${store.state.baseURL}/json/getTreeList2?rootId=${
          this.selectedRootId
        }`,
        "rid",
        true,
        "list"
      );
    },
    getRootId() {
      let list = [];
      api.rootIdSearch().then(data => {
        for (var i = 0; i < data.totalCount; i++) {
          // 나중에 개선 여지 있음.. 모든 문서함을 띄우려면 if지우고 v-if='filefolder'지우면 됨
          /*
          2020-04-20 : 김준호
          선택가능한 폴더에 휴지통을 포함시킴
          */
          if (
            data.list[i].rid == "onlyExpired" ||
            data.list[i].rid == "trash"
          ) {
            list.push({
              name: data.list[i].text,
              id: data.list[i].rid,
              type: "filefolder"
            });
          } else {
            list.push({
              name: data.list[i].text,
              id: data.list[i].rid,
              type: data.list[i].target_type
            });
          }
        }
      });
      this.rootIdList = list;
    },
    async init() {
      this.isLoading = false;
    },
    onDataBound: function(ev) {
      // 부서함 하위 팀 폴더는 CSS 적용
      let treeview = $("#boxTree").data("kendoTreeView");
      let childNodes = $(".k-item", ev.node);
      for (let index = 0; index < childNodes.length; index++) {
        const n = childNodes[index];
        let d = treeview.dataItem(n);
        if (d && d.groupId)
          $(n)
            .find(".k-in")
            .addClass("tree-department");
      }
    },
    onTreeSelect: function(ev) {
      let node = ev.node;
      let dataItem = ev.sender.dataItem(node);
      this.selectedName = dataItem.text;
      this.selectedEid = dataItem.id;
    },
    selectAndClose() {
      // this.close();
      let dataItem = {
        name: this.selectedName,
        eid: this.selectedEid
      };
      this.$close(dataItem);
    },
    close() {
      if (this.dynamic) this.$close(null);
      else {
        this.dialogVisible = false;
        this.$store.commit("closeHovers");
      }
    },
    hide() {
      this.dialogVisible = false;
    },
    onClose(e) {
      this.close();
    }
  },
  created() {
    this.init();
  }
};
</script>

<style>
.edit-del-btn {
  float: right;
}
#box-tree .bg-purple-light {
  background: #e5e9f2;
  padding: 5px;
  height: inherit !important;
}
#box-tree .k-i-expand {
  /* //display : none !important; */
}
#box-tree .icon-margin {
  margin-left: 10px;
}
#box-tree .el-dropdown {
  vertical-align: top;
}
#box-tree .el-dropdown + .el-dropdown {
  margin-left: 15px;
}
#box-tree .el-icon-arrow-down {
  font-size: 12px;
}
#box-tree .selectedItems {
  color: #409eff;
}
#box-tree .el-container {
  max-height: 500px;
}
.defaultBox {
  width: 100%;
  text-align: center;
  padding: 30px;
}
.defaultBox i {
  font-size: 150px;
}
</style>
