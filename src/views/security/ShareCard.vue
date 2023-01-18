<template>
  <el-card class="box-card">
    <el-alert v-if="shareInfo.status==1" :title="$t('label.success')" type="success" show-icon></el-alert>
    <el-alert v-else-if="shareInfo.status==2" :title="$t('label.error')" type="error" show-icon></el-alert>
    <div>
      <!-- URL 창 -->
      <el-form style="text-align:left">
        <el-form-item
          :label="$t('label.url')"
          v-if="this.isURLShare"
          style="margin-bottom: 5px; margin-top: 5px;"
        >
          <el-input :value="shareInfo.url" style="width:80%" id="url_text" :readonly="true"></el-input>
          <el-button
            @click="copyToClipboard"
            :disabled="shareInfo.url==''"
          >{{ $t('share.copyURL') }}</el-button>
        </el-form-item>
        <el-form-item v-if="this.isURLShare">
          <el-radio
          v-if="!disableSelectUserRadio"
            v-model="optionSelect"
            label="SELECT"
            @change="handleChange"
            border
          >{{ this.$t('share.select') }}</el-radio>
          <el-radio
            v-if="!disableAllUserRadio"
            v-model="optionSelect"
            label="ALL"
            @change="handleChange"
            border
          >{{ this.$t('share.all')}}</el-radio>
        </el-form-item>
        <!-- 공유할 사용자 목록 -->
        <el-table
          v-if="!(this.isURLShare&&this.setUserPicker==false)"
          :data="shareInfo.userListData"
          style="width: 100%; max-height: 250px; overflow: auto;"
        >
          <el-table-column :label="$t('label.name')">
            <template slot-scope="scope">
              <i v-if="scope.row.type==-1" class="fa fa-user" aria-hidden="true"></i>
              <i v-else class="fa fa-users" aria-hidden="true"></i>
              {{scope.row.roleName}}
            </template>
          </el-table-column>
          <el-table-column prop="refinedRoleId" :label="$t('label.id')"></el-table-column>
          <el-table-column :label="$t('label.path')">
            >
            <template slot-scope="scope">
              <span v-html="parseLocation(shareInfo.userListData[scope.$index].groupName)"></span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('permission.permission')">
            <template slot-scope="scope">
              <kendo-dropdownlist
                :id="'permissionList'+scope.$index"
                :data-source="shareInfo.permission"
                :data-text-field="'name'"
                :data-value-field="'id'"
                :value="shareInfo.userListData[scope.$index].privilege"
                :select="changeSelection"
                style="width:100%"
              ></kendo-dropdownlist>
            </template>
          </el-table-column>
          <el-table-column>
            <template slot-scope="scope">
              <span class="el-icon-error" @click="deleteUser(scope.$index)"></span>
            </template>
          </el-table-column>
        </el-table>

        <span class="share-user-add">
          <el-button
            v-if="!(this.isURLShare&&this.setUserPicker==false)"
            @click="openUserPicker"
            size="small"
            :disabled="optionSelect=='ALL'"
          >{{$t('adminMenu.user')}}{{ $t('label.add') }}</el-button>
        </span>
        <!-- 추가, 삭제 버튼 -->
        <span class="shareBtn">
          <el-button
            v-if="this.isURLShare&&optionSelect=='SELECT'"
            type="primary"
            @click="saveURLShareSetting(true)"
            :disabled="!shareInfo.hasChanged&&setUserPicker"
            :loading="shareInfo.sending"
            size="small"
          >{{ $t('share.createURL') }}</el-button>
          <el-button
            v-if="this.isURLShare&&optionSelect=='ALL'"
            type="primary"
            @click="allCreateURLShare(true)"
            :disabled="this.shareInfo.url!=''"
            :loading="shareInfo.sending"
            size="small"
          >{{ $t('share.createURL') }}</el-button>
          <el-button
            v-if="!this.isURLShare"
            type="primary"
            @click="setShare()"
            :disabled="!shareInfo.hasChanged"
            size="small"
            :loading="shareInfo.sending"
          >{{ $t('buttons.share') }}{{ $t('buttons.save') }}</el-button>
          <el-button
            v-if="!this.isURLShare"
            @click="cancelShare"
            type="info"
            size="small"
            :disabled="!shareInfo.cancelBtnEnable"
          >{{ $t('share.cancel') }}</el-button>
          <el-button
            v-if="this.isURLShare"
            @click="saveURLShareSetting(false)"
            type="info"
            size="small"
            :disabled="!shareInfo.cancelBtnEnable"
          >{{ $t('share.unshareURL') }}</el-button>
        </span>
      </el-form>
    </div>
  </el-card>
</template>

<script>
import Vue from "vue";
import url from "@/utils/url";
import * as api from "@/utils/api";
import { mapState } from "vuex";
import Utils from "@/utils/utils";
import SelectUserGroupDialog from "@/views/SelectUserGroupDialog";
import Constants from "../../Constants";
import { create } from "vue-modal-dialogs";
import moment from "moment";

const userGroupDialog = create(SelectUserGroupDialog);

export default {
  name: "share-card",
  data: function() {
    return {
      shareInfo: {
        loading: true,
        enabled: false,
        url: "",
        expired: "",
        count: 10,
        isExpire: false,
        selectedList: null,
        userListData: [],
        permission: [
          { name: this.$t("permission.name.Read"), id: "USER_VIEW" },
          { name: this.$t("permission.name.Write"), id: "USER_UPDATE" }
        ],
        status: 0,
        hasChanged: false,
        cancelBtnEnable: false,
        sending: false
      },
      optionSelect: "SELECT",
      options: [
        {
          value: "SELECT",
          label: this.$t("share.select")
        },
        {
          value: "ALL",
          label: this.$t("share.all")
        }
      ],
      object_id: "",
      version: "",
      dialogVisible: true,
      activeNames: ["share", "url"],
      // settingEvent:null,
      pickerOptions: {
        disabledDate(time) {
          const date = new Date();
          date.setTime(date.getTime() - 3600 * 1000 * 24);
          return time.getTime() < date;
        }
      },
      urlShare: true
    };
  },
  props: ["isURLShare", "showShare"],
  computed: {
    ...mapState(["selected", "rootId"]),
    setUserPicker() {
      return Utils.featuresDefault("setURLShareUser", true);
    },
    setURLButtonName() {},
    disableSelectUserRadio() {
      return (
        Utils.featuresDefault("urlShare.disableSelectUserRadio") == "true" ||
        Utils.featuresDefault("urlShare.disableSelectUserRadio") === true
      );
    },
    disableAllUserRadio() {
      return (
        Utils.featuresDefault("urlShare.disableAllUserRadio") == "true" ||
        Utils.featuresDefault("urlShare.disableAllUserRadio") === true
      );
    }
  },
  methods: {
    getShareInfo: function() {
      api
        .getURLShareInfo(this.object_id, false)
        .then(data => {
          if (data.share != undefined) {
            this.shareInfo.userListData = data.share.privs;
            if (
              this.shareInfo.userListData &&
              this.shareInfo.userListData.length > 0
            ) {
              // set type
              this.shareInfo.userListData.forEach(element => {
                if (element.roleId.startsWith("_user_")) {
                  element.type = -1;
                } else {
                  element.type = 0;
                }
              });
            }
            this.shareInfo.enabled = true;
            this.shareInfo.cancelBtnEnable = true;
          }
        })
        .catch(error => {
          this.shareInfo.status = 0;
        });
    },
    getURLShareInfo: function() {
      api
        .getURLShareInfo(this.object_id, true)
        .then(data => {
          if (!data.share) {
            this.shareInfo.enabled = false;
            return;
          }
          this.shareInfo.userListData = data.share.privs;
          if (
            this.shareInfo.userListData &&
            this.shareInfo.userListData.length > 0
          ) {
            // set type
            this.shareInfo.userListData.forEach(element => {
              if (element.roleId.startsWith("_user_")) {
                element.type = -1;
              } else {
                element.type = 0;
              }
            });
          }
          this.shareInfo.enabled = true;
          this.shareInfo.cancelBtnEnable = true;
          this.shareInfo.url = data.linkURL;
          this.shareInfo.expired = data.share.expiredString;
          this.shareInfo.count = data.share.count;
          this.shareInfo.loading = false;
          this.shareInfo.anonymous = data.share.anonymous;
          if (this.shareInfo.anonymous == 1) {
            this.optionSelect = "ALL";
          } else {
            this.optionSelect = "SELECT";
          }
        })
        .catch(error => {});
    },
    setShare: function() {
      var sendData = { privs: [] };
      var cnt = this.shareInfo.userListData.length;
      this.shareInfo.sending = true;
      if (cnt <= 0) {
        var obj = this;
        api
          .deleteURLShare(this.object_id, false)
          .then(data => {
            this.shareInfo.status = 1;
            Utils.updateIndicator(obj.object_id, "share", false);
            this.shareInfo.hasChanged = false;
            this.shareInfo.cancelBtnEnable = false;
            this.shareInfo.sending = false;
          })
          .catch(err => {
            this.shareInfo.status = 2;
            this.shareInfo.sending = false;
          });
      } else {
        for (var i = 0; i < cnt; i++) {
          var tmp = { roleId: "", privilege: "" };
          tmp.roleId = this.shareInfo.userListData[i].refinedRoleId;
          tmp.type = this.shareInfo.userListData[i].type;
          tmp.privilege = this.shareInfo.userListData[i].privilege;
          sendData.privs.push(tmp);
        }
        var obj = this;
        api
          .createShare(this.object_id, "", false, JSON.stringify(sendData))
          .then(data => {
            this.shareInfo.status = 1;
            this.shareInfo.hasChanged = false;
            this.shareInfo.cancelBtnEnable = true;
            Utils.updateIndicator(obj.object_id, "share", true);
            this.shareInfo.sending = false;
          })
          .catch(error => {
            this.shareInfo.status = 2;
            this.shareInfo.sending = false;
          });
      }
    },
    allCreateURLShare() {
      this.createURLShareAnonymous();
    },
    saveURLShareSetting(create) {
      this.shareInfo.status = 0;
      this.shareInfo.loading = true;
      // if(this.shareInfo.enabled){
      if (create) {
        this.createURLShare();
      } else {
        var obj = this;
        api
          .deleteURLShare(this.object_id)
          .then(data => {
            this.shareInfo.status = 1;
            Utils.updateIndicator(obj.object_id, "share", false);
            this.shareInfo.hasChanged = false;
            this.shareInfo.cancelBtnEnable = false;
            this.shareInfo.userListData = [];
            this.shareInfo.url = "";
            //this.urlshareInfo.enabled=false;
          })
          .catch(err => {
            this.shareInfo.status = 2;
          });
      }
      this.shareInfo.loading = false;
    },
    createURLShare: function() {
      if (!this.shareInfo.loading) {
        this.getURLShareInfo();
        return;
      }
      var obj = this;
      var cnt = this.shareInfo.userListData.length;
      var sendData = { privs: [] };
      this.shareInfo.expired =
        this.shareInfo.expired ||
        new Date().setFullYear(new Date().getFullYear() + 1);
      this.shareInfo.expired = moment(this.shareInfo.expired).format(
        "YYYY-MM-DD"
      );
      if (this.shareInfo.count < 1) {
        this.shareInfo.count = 10;
      }
      for (var i = 0; i < cnt; i++) {
        var tmp = { roleId: "", privilege: "" };
        tmp.roleId = this.shareInfo.userListData[i].refinedRoleId;
        tmp.type = this.shareInfo.userListData[i].type;
        tmp.privilege = this.shareInfo.userListData[i].privilege;
        sendData.privs.push(tmp);
      }
      api
        .createURLShare(
          this.object_id,
          this.version,
          true,
          JSON.stringify(sendData),
          this.shareInfo.count,
          this.shareInfo.expired
        )
        .then(data => {
          data = JSON.parse(data);
          this.shareInfo.hasChanged = false;
          this.shareInfo.cancelBtnEnable = true;
          this.shareInfo.url = data.linkURL;
          this.shareInfo.expired = data.share.expiredString;
          this.shareInfo.count = data.share.count;
          this.shareInfo.status = 1;
          Utils.updateIndicator(obj.object_id, "share", true);
        })
        .catch(error => {
          console.log(error);
          this.shareInfo.status = 2;
          this.shareInfo.sending = false;
        });
    },
    createURLShareAnonymous: function() {
      var obj = this;
      var cnt = this.shareInfo.userListData.length;
      var sendData = { privs: [] };
      this.shareInfo.expired =
        this.shareInfo.expired ||
        new Date().setFullYear(new Date().getFullYear() + 1);
      this.shareInfo.expired = moment(this.shareInfo.expired).format(
        "YYYY-MM-DD"
      );
      if (this.shareInfo.count < 1) {
        this.shareInfo.count = 10;
      }
      for (var i = 0; i < cnt; i++) {
        var tmp = { roleId: "", privilege: "" };
        tmp.roleId = this.shareInfo.userListData[i].refinedRoleId;
        tmp.type = this.shareInfo.userListData[i].type;
        tmp.privilege = this.shareInfo.userListData[i].privilege;
        sendData.privs.push(tmp);
      }
      api
        .createURLShareAnonymous(
          this.object_id,
          this.version,
          true,
          JSON.stringify(sendData),
          this.shareInfo.count,
          this.shareInfo.expired
        )
        .then(data => {
          data = JSON.parse(data);
          this.shareInfo.hasChanged = false;
          this.shareInfo.cancelBtnEnable = true;
          this.shareInfo.url = data.linkURL;
          this.shareInfo.expired = data.share.expiredString;
          this.shareInfo.count = data.share.count;
          this.shareInfo.status = 1;
          Utils.updateIndicator(obj.object_id, "share", true);
        })
        .catch(error => {
          console.log(error);
          this.shareInfo.status = 2;
          this.shareInfo.sending = false;
        });
    },
    cancelShare: function() {
      var obj = this;
      api
        .deleteURLShare(this.object_id, false)
        .then(data => {
          this.shareInfo.status = 1;
          Utils.updateIndicator(obj.object_id, "share", false);
          this.shareInfo.hasChanged = false;
          this.shareInfo.cancelBtnEnable = false;
          this.shareInfo.userListData = [];
        })
        .catch(err => {
          this.shareInfo.status = 2;
        });
    },
    deleteUser: function(index) {
      if (this.shareInfo.userListData.length == 1) {
        this.cancelShare();
      }
      this.shareInfo.userListData.splice(index, 1);
      this.shareInfo.hasChanged = true;
    },
    changeSelection: function(e) {
      var id = e.sender.element[0].id;
      var idx = parseInt(id.replace("permissionList", ""));
      this.shareInfo.userListData[idx].privilege = e.dataItem.id;
      this.shareInfo.hasChanged = true;
    },
    parseLocation(str) {
      if (!str) return;
      var rawhtml = "";
      var a = str.split(",");
      for (var i = 0; i < a.length - 1; i++) {
        rawhtml += "<li>";
        rawhtml += a[i];
        rawhtml += "</li>";
      }
      return rawhtml;
    },
    handleChange(values) {
      if (this.shareInfo.url) {
        this.$confirm(this.$t("messages.urlShareChange"), "", {
          cancelButtonText: vue.$t("buttons.cancel"),
          confirmButtonText: vue.$t("buttons.ok"),
          type: "warning"
        })
          .then(() => {
            this.saveURLShareSetting(false);
            this.shareInfo.url = "";
          })
          .catch(() => {
            if (values == "SELECT") {
              this.optionSelect = "ALL";
            } else {
              this.optionSelect = "SELECT";
            }
          });
      } else {
      }
    },
    async openUserPicker() {
      let params = {
        type: Constants.VIEW_TYPES.SEL_USERGROUP,
        title: this.$t("messages.selectUser"),
        width: "80%",
        containerHeight: "600px",
        gridSelectable: Constants.SELECTABLE.MULTIPLE,
        memoryList: true
      };
      const result = await userGroupDialog(params);
      console.log(result);
      if (process.env.NODE_ENV === "development") {
        console.log("selected data is..");
        console.log(result);
      }
      if (!result) return;
      var cnt = result.length;
      var totalCnt = this.shareInfo.userListData.length;
      var flag = false;
      for (var i = 0; i < cnt; i++) {
        flag = true;
        for (var j = 0; j < totalCnt; j++) {
          if (
            this.shareInfo.userListData[j].refinedRoleId == result[i].id &&
            this.shareInfo.userListData[j].type == result[i].type
          ) {
            result.splice(i, 1);
            flag = false;
            break;
          }
        }
        if (!flag) continue;
        var tmp = {
          type: -1,
          groupName: "",
          privilege: "USER_VIEW",
          refinedRoleId: "",
          roleName: "",
          groupPath: ""
        };
        tmp.type = result[i].type;
        if (tmp.type == -1) {
          if (result[i].parentGroupNamePath) {
            tmp.roleName = result[i].name;
            tmp.groupName = result[i].parentGroupNames;
          } else {
            tmp.roleName = result[i].name;
            tmp.groupName = result[i].groupPath;
          }
        } else {
          if (result[i].groupNamePath) {
            tmp.roleName = result[i].description;
            tmp.groupName = result[i].groupNamePath + ",";
          } else {
            tmp.roleName = result[i].description;
            tmp.groupName = result[i].groupPath;
          }
        }
        tmp.refinedRoleId = result[i].id;
        this.shareInfo.userListData.push(tmp);
        this.shareInfo.hasChanged = true;
      }
    },
    close() {
      this.$store.commit("closeHovers");
      this.dialogVisible = false;
    },
    requestSaveSetting() {
      // this.shareInfo.status=0;
      // this.saveURLShareSetting(true);
      // var obj=this;
      // if(this.settingEvent!=null){
      //   clearTimeout(this.settingEvent);
      // }
      // this.settingEvent=setTimeout(function(){
      // obj.saveURLShareSetting(true);
      // obj.settingEvent=null;
      // },1000);
    },
    copyToClipboard() {
      var copyText = document.getElementById("url_text");
      copyText.select();
      document.execCommand("copy");
      console.log("URL 복사");
    }
  },
  beforeMount() {
    this.urlShare = this.isURLShare;
  },
  mounted() {
    console.log(store.state.sharedContent);
    this.selectedList = store.state.sharedContent;
    this.object_id = this.selectedList[0].r_object_id;
    this.version = this.selectedList[0]["doc:Version"] || "";
    this.isFolder = this.selectedList[0].docTypeName;
    // 임시 수정 false 였음.
    this.shareInfo.isExpire = store.state.info.urlshareNotExpire || false;
    if (this.showShare && !this.urlShare) {
      this.getShareInfo();
    }
    if (this.showShare && this.urlShare) {
      this.getURLShareInfo();
    }

    if (this.isFolder == "FOLDER") {
      this.urlShare = false;
    }
  }
};
</script>

<style>
#share-div .el-input input {
  height: 40px;
}
.shareBtn {
  float: right;
  margin-top: 7px;
  margin-bottom: 7px;
}
.share-option-select {
  float: left;
  width: 150px;
}
.share-user-add {
  float: left;
  margin-top: 7px;
  margin-bottom: 7px;
}
</style>
