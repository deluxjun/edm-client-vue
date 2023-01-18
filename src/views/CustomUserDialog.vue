<template>
  <el-dialog
    id="CustomUserDialog"
    ref="windowRef"
    top="5vh"
    :title="title"
    :width="width"
    :visible.sync="dialogVisible"
    :close-on-press-escape="false"
    :close-on-click-modal="false"
    :show-close="closeState"
    v-draggable:before-close="closeState"
    :fullscreen="false"
  >
    <el-form
      :model="ruleForm"
      :rules="rules"
      ref="ruleForm"
      label-width="120px"
      :label-position="labelPosition"
      class="ruleForm"
    >
      <div :class="changeWidth()">
        <div class="infoset">{{ $t('adminMenu.userinfo') }}</div>
        <el-form-item :label="$t('adminMenu.user_id')" prop="userName">
          <el-input
            autofocus
            class
            :placeholder="$t('adminMenu.idcheck')"
            type="text"
            v-if="type==$Constants.ADMINMENU.CREATE"
            v-model.trim="ruleForm.userName"
          ></el-input>
          <el-input
            class
            type="text"
            v-if="type!=$Constants.ADMINMENU.CREATE"
            v-model.trim="ruleForm.userName"
            disabled
          ></el-input>
        </el-form-item>
        <el-form-item :label="$t('adminMenu.user_name')" prop="name">
          <el-input class type="text" v-model.trim="ruleForm.name"></el-input>
        </el-form-item>

        <!--1차 패스워드-->
        <el-button
          size="small"
          type="primary"
          class="info-btn"
          :disabled="true"
        >{{ $t('adminMenu.oneEps') }}</el-button>
        <el-tooltip class="item" effect="dark" placement="right">
          <div slot="content">
            1. {{ $t('adminMenu.checktext1')}}
            <br />
            2. {{ $t('adminMenu.checktext2')}}
          </div>
          <i class="fa fa-question-circle questionText"></i>
        </el-tooltip>
        <el-form-item :label="$t('adminMenu.user_pw')" prop="oneEps">
          <el-input class type="password" v-model.trim="ruleForm.oneEps"></el-input>
        </el-form-item>
        <el-form-item :label="$t('adminMenu.user_pwconfirm')" prop="checkPass">
          <el-input class type="password" v-model.trim="ruleForm.checkPass"></el-input>
        </el-form-item>

        <!--2차 패스워드-->
        <template v-if="isHq == 'true' || isHq == true">
          <el-button
            size="small"
            type="primary"
            class="info-btn"
            :disabled="true"
          >{{ $t('adminMenu.twoEps') }}</el-button>
          <el-tooltip class="item" effect="dark" placement="right">
            <div slot="content">
              1. {{ $t('adminMenu.checktext3')}}
              <br />
              2. {{ $t('adminMenu.checktext4')}}
            </div>
            <i class="fa fa-question-circle questionText"></i>
          </el-tooltip>
          <el-form-item :label="$t('adminMenu.user_pw')" prop="twoEps">
            <el-input class type="password" v-model.trim="ruleForm.twoEps"></el-input>
          </el-form-item>
          <el-form-item :label="$t('adminMenu.user_pwconfirm')" prop="checkPass2">
            <el-input class type="password" v-model.trim="ruleForm.checkPass2"></el-input>
          </el-form-item>
        </template>
        <el-form-item :label="$t('adminMenu.user_group')" prop="groupIdArr" required>
          <div class="groupbox" id="grouplist">
            <el-tag
              type="success"
              :v-model="ruleForm.groupIdArr"
              :key="tag.id"
              v-for="tag in ruleForm.groupIdArr"
              :closable="showAdmin? true : false"
              :disable-transitions="false"
              @close="removeItem(tag)"
            >{{tag.description}}</el-tag>
          </div>
        </el-form-item>
      </div>

      <div class="etc-box">
        <el-radio-group v-show="showAdmin" v-model="active" id="radio_group">
          <el-radio :label="true">{{$t('adminMenu.user_active')}}</el-radio>
          <el-radio :label="false">{{$t('adminMenu.user_inactive')}}</el-radio>
        </el-radio-group>

        <div v-if="type!=$Constants.ADMINMENU.CREATE">
          <el-button
            type="info"
            @click="setVolume()"
            class="vol-btn"
            plain
            v-show="showAdmin"
          >{{ $t('adminMenu.setting') }}</el-button>
          <div class="infoset">{{ $t('adminMenu.user_Volume') }}</div>
          <div v-show="volume_info">
            <el-progress
              :text-inside="true"
              :stroke-width="18"
              :percentage="volume.percentage"
              :color="volume.color"
            ></el-progress>
            <el-input class="label-custom" :value="volume.text" readonly></el-input>
          </div>
        </div>
      </div>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button
        v-if="type!=$Constants.ADMINMENU.CREATE"
        type="success"
        @click="editAndClose()"
      >{{ $t('buttons.save') }}</el-button>
      <el-button v-if="closeState" @click="close()">{{ $t('buttons.cancel') }}</el-button>
    </div>
  </el-dialog>
</template>

<script>
import Vue from "vue";
import axios from "axios";
import url from "@/utils/url";
import Utils from "@/utils/utils";
import * as api from "@/utils/api";
import { mapState } from "vuex";
import Constants from "@/Constants";
import { localeData } from "moment";
import SelectUserGroupDialog from "@/views/SelectUserGroupDialog";
import UserGroup from "@/views/UserGroup";
import { create } from "vue-modal-dialogs";
import setVolumeDialog from "@/admintool/volumeDialog";

const userGroupDialog = create(SelectUserGroupDialog);
const volumeDialog = create(setVolumeDialog);

export default {
  name: "userDialog",
  props: {
    closeState: {
      default: true,
      type: Boolean
    },
    width: {
      default: "50%",
      type: String
    },
    containerHeight: String,
    type: String,
    userName_prop: String
  },
  data() {
    var kin3 = (str, max) => {
      if (!max) max = 3; // 글자수를 지정하지 않으면 3로 지정
      var i, j, k, x, y;
      var buff = [
        "0123456789",
        "abcdefghijklmnopqrstuvwxyz",
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
      ];
      var src,
        src2,
        ptn = "";

      for (i = 0; i < buff.length; i++) {
        src = buff[i]; // 0123456789
        src2 = buff[i] + buff[i]; // 01234567890123456789
        for (j = 0; j < src.length; j++) {
          x = src.substr(j, 1); // 0
          y = src2.substr(j, max); // 0123
          ptn += "[" + x + "]{" + max + ",}|"; // [0]{4,}|0123|[1]{4,}|1234|...
          ptn += y + "|";
        }
      }
      ptn = new RegExp(ptn.replace(/.$/, "")); // 맨마지막의 글자를 하나 없애고 정규식으로 만든다.

      if (ptn.test(str)) return true;
      return false;
    };
    var validatePass = (rule, value, callback) => {
      //1차 비밀번호
      let reg_pw = /^.*(?=.{9,17})(?=.*[0-9])(?=.*[a-zA-Z]).*$/;

      // if(this.type==this.$Constants.ADMINMENU.EDIT){ //그냥 변경
      //   if (value === '' && this.ruleForm.oneEps==='') {
      //     callback();
      //   } else if(value != '' && this.ruleForm.oneEps==''){
      //     callback(new Error(this.$t('adminMenu.rule_pwcheck2')));
      //   } else if (!reg_pw.test(value)) {
      //     callback(new Error(this.$t('adminMenu.checktext1')));
      //   } else if (kin3(value)) {
      //     callback(new Error(this.$t('adminMenu.checktext2')));
      //   }else{
      //     callback();
      //   }
      // }else{ //무조건 변경
      if (value === "") {
        callback(new Error(this.$t("adminMenu.rule_pw")));
      } else if (!reg_pw.test(value)) {
        callback(new Error(this.$t("adminMenu.checktext1")));
      } else if (kin3(value)) {
        callback(new Error(this.$t("adminMenu.checktext2")));
      } else {
        callback();
      }
      //}
    };
    var validatePass2 = (rule, value, callback) => {
      //1차 비밀번호 확인
      let reg_pw = /^.*(?=.{9,17})(?=.*[0-9])(?=.*[a-zA-Z]).*$/;

      //  if(this.type==this.$Constants.ADMINMENU.EDIT){ //그냥 변경
      //     if (value === '' && this.ruleForm.oneEps==='') {
      //       callback();
      //     } else if(value == '' && this.ruleForm.oneEps!=''){
      //       callback(new Error(this.$t('adminMenu.rule_pwcheck2')));
      //     } else if (!reg_pw.test(value)) {
      //       callback(new Error(this.$t('adminMenu.checktext1')));
      //     } else if (kin3(value)) {
      //       callback(new Error(this.$t('adminMenu.checktext2')));
      //     } else if (value !== this.ruleForm.oneEps) {
      //       callback(new Error(this.$t('adminMenu.rule_pwcheck2')));
      //     }else{
      //       callback();
      //     }
      //  }else{ //무조건 변경
      if (value === "") {
        callback(new Error(this.$t("adminMenu.rule_pwcheck")));
      } else if (!reg_pw.test(value)) {
        callback(new Error(this.$t("adminMenu.checktext1")));
      } else if (kin3(value)) {
        callback(new Error(this.$t("adminMenu.checktext2")));
      } else if (value !== this.ruleForm.oneEps) {
        callback(new Error(this.$t("adminMenu.rule_pwcheck2")));
      } else {
        callback();
      }
      // }
    };

    var validatePassTwo = (rule, value, callback) => {
      if (!this.isHq || this.isHq == "false") callback();
      //2차 비밀번호
      let reg_pw = /[^0-9]/g;

      // if(this.type==this.$Constants.ADMINMENU.EDIT){ // 그냥 변경
      //   if (value === '' && this.ruleForm.twoEps==='') {
      //     callback();
      //   } else if(value != '' && this.ruleForm.twoEps==''){
      //     callback(new Error(this.$t('adminMenu.rule_pwcheck2')));
      //   } else if (value.length < 4 || value.length > 4) {
      //     callback(new Error(this.$t('adminMenu.checktext4')));
      //   } else if (value.search(reg_pw) >= 0) {
      //     callback(new Error(this.$t('adminMenu.checktext3')));
      //   }else{
      //     callback();
      //   }
      // }else{ //무조건 변경
      if (value === "") {
        callback(new Error(this.$t("adminMenu.rule_pw")));
      } else if (value.length < 4 || value.length > 4) {
        callback(new Error(this.$t("adminMenu.checktext4")));
      } else if (value.search(reg_pw) >= 0) {
        callback(new Error(this.$t("adminMenu.checktext3")));
      } else {
        callback();
      }
      // }
    };
    var validatePassTwo2 = (rule, value, callback) => {
      if (!this.isHq || this.isHq == "false") callback();
      //2차 비밀번호 확인
      let reg_pw = /[^0-9]/g;

      //  if(this.type==this.$Constants.ADMINMENU.EDIT){ // 그냥 변경
      //     if (value === '' && this.ruleForm.twoEps==='') {
      //       callback();
      //     } else if(value === '' && this.ruleForm.twoEps!=''){
      //       callback(new Error(this.$t('adminMenu.rule_pwcheck2')));
      //     } else if (value.length < 4 || value.length > 4) {
      //       callback(new Error(this.$t('adminMenu.checktext4')));
      //     } else if (value.search(reg_pw) >= 0) {
      //       callback(new Error(this.$t('adminMenu.checktext3')));
      //     } else if (value !== this.ruleForm.twoEps) {
      //       callback(new Error(this.$t('adminMenu.rule_pwcheck2')));
      //     } else {
      //       callback();
      //     }
      //  }else{ //무조건 변경
      if (value === "") {
        callback(new Error(this.$t("adminMenu.rule_pwcheck")));
      } else if (value.length < 4 || value.length > 4) {
        callback(new Error(this.$t("adminMenu.checktext4")));
      } else if (value.search(reg_pw) >= 0) {
        callback(new Error(this.$t("adminMenu.checktext3")));
      } else if (value !== this.ruleForm.twoEps) {
        callback(new Error(this.$t("adminMenu.rule_pwcheck2")));
      } else {
        callback();
      }
      // }
    };
    var validateKorea = (rule, value, callback) => {
      let checkkorea = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
      if (value === "") {
        callback(new Error(this.$t("adminMenu.rule_userName")));
      } else if (checkkorea.test(value)) {
        callback(new Error(this.$t("adminMenu.idcheck")));
      } else {
        callback();
      }
    };
    var validategroup = (rule, value, callback) => {
      if (value.length == 0) {
        callback(new Error(this.$t("adminMenu.rule_group")));
      } else {
        callback();
      }
    };
    return {
      labelPosition: "left",
      item: null,
      active: true,
      dialogVisible: true,
      data: null,
      confirm: "",
      volume_info: null,
      progress_view: false,
      imgloading: true,
      ruleForm: {
        userName: "",
        name: "",
        oneEps: "",
        checkPass: "",
        twoEps: "",
        checkPass2: "",
        groupIdArr: [],
        address: "",
        email: ""
      },
      userImgSrc: null,
      userImgSaveApi: null,
      showimg: true,
      theme: "theme0",
      state: false,
      showViewImg: true,
      initsetImg: false,
      pwErrmsg: "",
      title: this.$t("login.myinfo"),
      rules: {
        userName: [
          {
            required: true,
            message: this.$t("adminMenu.rule_userName"),
            trigger: "blur"
          },
          { validator: validateKorea, trigger: "blur" }
        ],
        name: [
          {
            required: true,
            message: this.$t("adminMenu.rule_name"),
            trigger: "blur"
          }
        ],
        oneEps: [
          { validator: validatePass, message: this.pwErrmsg, trigger: "blur" }
        ],
        checkPass: [{ validator: validatePass2, trigger: "blur" }],
        twoEps: [
          {
            validator: validatePassTwo,
            message: this.pwErrmsg,
            trigger: "blur"
          }
        ],
        checkPass2: [{ validator: validatePassTwo2, trigger: "blur" }]
      }
    };
  },
  components: {
    SelectUserGroupDialog,
    UserGroup
  },
  computed: {
    ...mapState(["user", "isHq"]),
    volume() {
      return this.$Utils.volumeInfo(this.volume_info);
    },
    showBtn() {
      return this.type != Constants.ADMINMENU.CREATE;
    },
    showAdmin() {
      return this.user.isAdmin;
    },
    showIndividualInfo() {
      console.log(this.rules);
      return Utils.featuresDefault("profile.individual.info", true);
    }
  },
  created() {
    this.$store.commit("setIsHq", Utils.getCookie("isHq"));
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.ruleForm.userName = this.userName_prop;
      if (this.type != Constants.ADMINMENU.CREATE) {
        api.getUser(this.ruleForm.userName).then(data => {
          this.ruleForm.name = data.user.name;
          this.ruleForm.email = data.user.email;
          this.ruleForm.address = data.user.address;
          this.active = data.user.enabled;
          for (var i = 0; i < data.user.groups.length; i++) {
            if (data.user.groups[i].type == "0") {
              this.ruleForm.groupIdArr.push({
                id: data.user.groups[i].id,
                description: data.user.groups[i].description
              });
            }
          }
          this.volume_info = data.volume_info;
          this.welcome = data.user.welcome;
          this.theme = data.user.theme;
        });
      }
    },
    changeWidth() {
      if (this.type == Constants.ADMINMENU.CREATE) {
        return "userinfo-box width100";
      } else if (!this.showProfileImg) {
        return "userinfo-box width100";
      } else {
        return "userinfo-box";
      }
    },
    oneEpsText() {
      return "";
    },
    close() {
      this.dialogVisible = false;
      this.$store.commit("closeHovers");
    },
    editAndClose() {
      this.$refs["ruleForm"].validate(valid => {
        if (valid) {
          //편집 가능
          api
            .dealimAddEdituser(
              this.ruleForm.userName,
              this.ruleForm.name,
              this.ruleForm.oneEps,
              this.ruleForm.twoEps,
              this.ruleForm.groupIdArr,
              true,
              constants.ADMINMENU.EDIT
            )
            .then(data => {
              Utils.deleteCookie("loginWithOut");
              this.$notify({
                title: this.$t("label.success"),
                message: this.$t("messages.completed"),
                type: "success"
              });
              this.close();
            })
            .catch(error => {
              console.log(error);
            });
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    async setVolume() {
      const result = await volumeDialog({
        title: this.$t("adminMenu.user_setMaxVolume"),
        width: "30%",
        containerHeight: "400px",
        target_prop: "",
        targetId_prop: this.volume_info.volumeId,
        target_vol_prop: this.volume.max
      });
      if (result) {
        console.log(result);
        api
          .settingVolume(result.volumeId, result.maxSize)
          .then(data => {
            this.requestCompleted(true);
          })
          .catch(error => {
            console.log(error);
          });
      }
    }
  }
};
</script>

<style>
#CustomUserDialog .el-dialog {
  min-width: 600px;
}
#CustomUserDialog .el-input input {
  height: 35px !important;
}
#CustomUserDialog .el-form-item {
  margin-bottom: 25px;
}
.infoset {
  height: 30px;
  background-color: #ccc;
  width: 100%;
  padding: 5px;
  margin-bottom: 10px;
  font-weight: 700;
  margin-top: 5px;
}
.userinfo {
  display: inline-block;
  width: 100px;
}
.groupbox {
  width: 100%;
  position: relative;
  border-width: 1px;
  border-style: solid;
  border-radius: 4px;
  border-color: #c5c5c5;
  background-color: #fff;
  min-height: 2.7em;
  padding: 3px;
  overflow-x: auto;
  box-sizing: border-box;
  margin-bottom: 10px;
}
.groupbox .el-tag {
  margin-bottom: 3px;
}
.search-btn {
  float: right;
  position: relative;
  right: 10px;
  padding: 5px !important;
  top: -3px;
}
.vol-btn {
  float: right;
  position: relative;
  right: 10px;
  padding: 5px !important;
  top: 3px;
}
.idinput {
  margin-left: -5px;
}
#radio_group {
  margin-left: 10px;
  margin-bottom: 5px;
}
.profile-box {
  width: 40%;
  margin: auto;
  float: left;
}
.profile-center {
  width: 200px;
  margin: auto;
  margin-top: 15px;
}
.profile-center .el-upload {
  width: 80px;
}

.userinfo-box {
  width: 60%;
  float: right;
}
.etc-box {
  width: 100%;
  float: left;
}
#userDialog .dialog-footer {
  width: 100%;
  float: left;
}

#profileImg {
  width: 150px;
  height: 150px;
  border-radius: 50%;
}
#initial {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: #8c489f;
  color: rgb(236, 233, 233);
  text-align: center;
  font-weight: 400;
  font-size: 70px;
  display: inline-block;
  line-height: 2;
}
.width100 {
  width: 100% !important;
}
span#sizeNotice {
  margin: 2%;
  width: 93%;
  text-align: center;
  float: inherit;
  color: #606266cc;
}
.info-btn {
  margin-top: 5px;
  margin-bottom: 5px;
}
.questionText {
  position: relative;
  top: 5px;
  font-size: 28px;
  cursor: pointer;
}
</style>