<template>
  <nav :class="['navbar is-transparent edrm-header', headerClassName]" :style="HeaderColorSetting">
    <div class="navbar-brand" id="header_navbar">
      <a class="navbar-item brand-logo" @click="gotoMain">
        <span v-if="showlogoImg">
          <img :src="logoPath" alt="xedrm" id="logo" :style="LogoSetting" />
        </span>
        <span v-else>
          <span class='logo'>Collaboss</span>
        </span>
      </a>
    </div>

    <div id="navbarExampleTransparentExample" class="navbar-menu">
      <div class="navbar-start">
        <div class="level-item">
          <i
            class="k-icon k-i-layout fa-x white iconlink"
            v-if="mainType != 'files'"
            @click="gotoPage('files')"
            :title="$t('files.files')"
          ></i>
        </div>
        <div class="level-item">
          <el-breadcrumb
            id="headerBread"
            v-if="mainType === 'files'"
            class="edrm-breadcrumbs input"
            separator-class="el-icon-arrow-right"
          >
            <el-breadcrumb-item
              v-for="(link, i) in breadcrumbs"
              :key="link.url"
              @click.native="clickBreadcrumb(link, i)"
            >{{ $Utils.truncate(link.name, 20) }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
      </div>

      <div class="navbar-end">
        <div class="level-item" v-if="showSearch">
          <search v-if="mainType === 'files'"></search>
        </div>
        <div class="level-item">
          <!-- <el-badge :value="200" :max="99" class="badge">
          <i class="el-icon-bell fa-2x white"></i>
          </el-badge>-->
        </div>
        <div class="navbar-item has-dropdown user-menu dropdown minsize" @click="toggleUserInfo">
          <a class="navbar-link js-dropdown" v-if="showHeaderStyle">
            <i class="fa fa-user white"></i>
            <span class="headerNameUI" :title="userHeaderName">{{ userHeaderName }}</span>
          </a>
          <a class="navbar-link js-dropdown" v-if="!showHeaderStyle">
            <img id="headprofile-img" :src="userImgSrc" v-if="initsetImg" />
            <span id="profile-initial" v-else>
              <b>{{initialName}}</b>
            </span>
            <!-- <i class="fa fa-user white"></i> -->
          </a>
          <div class="navbar-dropdown is-right is-boxed header-drop">
            <span
              class="navbar-item xe-header-username"
              :title="userHeaderName"
            >{{ userHeaderName }}</span>
            <hr class="navbar-divider" v-if="showProfileMenu" />

            <a v-if="volume" class="navbar-item">
              <el-progress :percentage="volume.percentage" :color="volume.color"></el-progress>
            </a>
            <a v-if="volume" class="navbar-item">{{ volume.text }}</a>

            <hr class="navbar-divider" v-if="!isAdmin&&showGroupware" />
            <a class="navbar-item" v-if="!isAdmin&&showGroupware" @click.prevent="groupwareLink()">
              <i class="el-icon-news headericon"></i>
              {{ $t('login.groupwareWorkspace')}}
            </a>

            <hr class="navbar-divider" v-if="showProfileMenu&&!isAdmin" />
            <a class="navbar-item" v-if="showProfileMenu" @click.prevent="OpenProfileDialog()">
              <i class="el-icon-setting headericon"></i>
              {{ $t('login.profile')}}
            </a>

            <hr class="navbar-divider" v-if="showDaelimSite" />
            <a
              class="navbar-item"
              v-if="showDaelimSite"
              @click.prevent="dealimCustomProfileDialog()"
            >
              <i class="fa fa-user headericon"></i>
              {{ $t('login.myinfo')}}
            </a>

            <!-- <hr class="navbar-divider"  v-if="showDaelimSite">
          <a class="navbar-item" v-if="showDaelimSite" @click.prevent="DatePassWordChange()">
            180일 처리 테스트 작업중
            </a>-->

            <a
              v-if="showAddShortCut"
              class="navbar-item"
              @click.prevent="addShortCut()"
            >{{ $t('login.addShortCut')}}</a>

            <a
              v-if="mainType === 'dashboardOld'"
              class="navbar-item"
              @click.prevent="changeMode(true,'edit')"
            >{{ $t('Dashboard.editmode')}}</a>

            <hr class="navbar-divider" v-if="showAlarm" />
            <a class="navbar-item" v-if="showAlarm" @click.prevent="callAlarmDialog()">
              <i class="el-icon-bell headericon"></i>
              {{ $t('login.alarm')}}
            </a>

            <hr class="navbar-divider" v-if="isAdmin" />
            <a class="navbar-item" v-if="isAdmin" @click.prevent="callsearchPermissionDialog()">
              <i class="el-icon-search headericon"></i>
              {{ $t('login.permission')}}
            </a>

            <hr class="navbar-divider" />
            <a class="navbar-item">
              {{ $t('login.language')}} :
              <el-select v-model="language" placeholder="Select" @change="languageChange">
                <el-option
                  v-for="item in languagelist"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </a>
            <!--
          <a v-if="user.isAdmin" class="navbar-item" @click.prevent="gotoPage('admin')">
            {{ $t('login.adminManager')}}
          </a>
          <a v-if="user.isAdmin" class="navbar-item" @click.prevent="gotoPage('statistic')">
            {{ $t('login.statistic')}}
          </a>
            -->
            <hr class="navbar-divider" v-if="showlogout" />
            <a class="navbar-item" @click.prevent="logout" v-if="showlogout">
              <i class="el-icon-back headericon"></i>
              {{ $t('login.logout')}}
            </a>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
//import Search from './Search'
import { mapGetters, mapState } from "vuex";
import * as api from "@/utils/api";
import buttons from "@/utils/buttons";
import auth from "@/utils/auth";
import Search from "@/views/Search";
import { create } from "vue-modal-dialogs";
import SEL_PROFILE_DIALOG from "@/views/userDialog";
import CUSTOM_PROFILE_DIALOG from "@/views/CustomUserDialog";
import DATE_PW_DIALOG from "@/views/DateChangePasswordDialog";
import GROUPWARE_DIALOG from "@/views/groupwareDialog";
import searchNotificationDialog from "@/views/settings/searchNotificationDialog";
import searchPermission from "@/views/security/searchPermissionDialog";
import * as i18n from "@/i18n";
import moment from "moment";

const profileDialog = create(SEL_PROFILE_DIALOG);
const customProfileDialog = create(CUSTOM_PROFILE_DIALOG);
const dateChangeDialog = create(DATE_PW_DIALOG);
const groupwareDialog = create(GROUPWARE_DIALOG);
const alarmDialog = create(searchNotificationDialog);
const searchPermissionDialog = create(searchPermission);

export default {
  name: "site-header",
  props: {
    //src: String
  },
  components: {
    Search
  },
  watch: {
    $route(val, oldValue) {
      this.handleRoute(val, oldValue);
    },
    reload: function() {
      this.reloadSelected();
    },
    breadcrumbs: function() {
      $(document).on("DOMNodeInserted", "#headerBread span", function() {
        $("#headerBread span").css(
          "cssText",
          "color : " +
            Utils.featuresDefault("textSetting", "#fff") +
            " !important"
        );
      });
    }
  },
  data: function() {
    return {
      width: window.innerWidth,
      pluginData: {
        api,
        buttons,
        store: this.$store,
        router: this.$router
      },
      initsetImg: false,
      mainType: this.initPath(),
      prevUrl: null,
      volumeInfo: null,
      userImgSrc: null,
      showlogoImg: true,
      dashlist: [
        { id: "add", icon: " fa fa-plus", text: "Dashboard.add" },
        { id: "save", icon: "fa fa-floppy-o", text: "Dashboard.save" },
        { id: "cancel", icon: "fa fa-ban", text: "Dashboard.editmode-cancel" }
      ],
      editmode: false,
      languagelist: [
        { value: "ko", label: "한국어", icon: "" },
        { value: "en", label: "English", icon: "" }
      ],
      language: this.defaultSetting()
    };
  },
  created() {
    window.addEventListener("resize", () => {
      this.width = window.innerWidth;
    });
  },
  beforeDestroy() {},
  computed: {
    ...mapGetters(["userNameUI"]),
    ...mapState(["info", "user", "currentDirInfo", "rootId", "newUserName"]),
    showAddShortCut() {
      if (!this.$Utils.featuresDefault("shortcut", false)) return false;

      let path = this.$route.path;
      if (path.startsWith("/files/")) return true;
      return false;
    },
    showDashboard() {
      return Utils.featuresDefault("dashboard.enabled", false);
    },
    showHeaderStyle() {
      return Utils.featuresDefault("headerName", true);
    },
    showAlarm() {
      return Utils.featuresDefault("header.alarm", false);
    },
    showGroupware() {
      if (this.user.isOutsideSubnet) {
        return false;
      } else {
        return Utils.featuresDefault("groupware.workspace", false);
      }
    },
    showSearch() {
      let searchView = Utils.featuresDefault("dealim.showSearch", false);
      console.log(searchView);
      if (this.info.isOutsideSubnet && searchView) {
        return false;
      } else {
        return true;
      }
    },
    isMobile() {
      return this.width <= 736;
    },
    headerClassName() {
      if (!this.info.headerClassName)
        // return 'is-dark'
        return "";
      else return this.info.headerClassName;
    },
    HeaderColorSetting() {
      let color = Utils.featuresDefault("headerColor", "#409EFF");
      return "background-color: " + color + " !important;";
    },
    LogoSetting() {
      let logoSetting = Utils.featuresDefault(
        "logoSetting",
        "margin-top: 15px;position: relative;top: 2px;max-height: 58px !important;"
      );
      if (logoSetting) {
        return logoSetting;
      }
    },
    userName() {
      return this.user.userName + "(" + this.user.userId + ")";
    },
    userHeaderName() {
      let grouplist = this.user.group;
      let groupName = "";
      if (grouplist) {
        for (var i = grouplist.length - 1; i > -1; i--) {
          if (grouplist[i].type == 0) {
            groupName = grouplist[i].groupName;
          }
        }
      }
      if (this.newUserName.length == 0) {
        return this.user.userName + "(" + groupName + ")";
      } else {
        return this.newUserName + "(" + groupName + ")";
      }
    },
    initialName() {
      if (this.user.userName) {
        return this.user.userName.substr(0, 1);
      } else {
        return this.user.userName;
      }
    },
    inituserId() {
      return this.user.userId;
    },
    isAdmin() {
      return this.user.isAdmin;
    },
    volume() {
      if (this.user.isAdmin) return null;
      if (this.volumeInfo) return this.$Utils.volumeInfo(this.volumeInfo);
      return { percentage: 0, color: "success", text: "" };
    },
    breadcrumbs() {
      let breadcrumbs = [];
      let namePath = this.$route.fullPath;
      breadcrumbs = this.$Utils.getBreadcrumbs(namePath);
      return breadcrumbs;
    },
    showlogout() {
      let outside = this.$Utils.featuresDefault("logout.outSide", false);
      if (outside) {
        let vfUser = Utils.getCookie("VFUSER");
        if (vfUser) {
          return false;
        } else {
          return true;
        }
      } else {
        let logoutHidden = this.$Utils.featuresDefault("logout.hidden", false);
        if (logoutHidden) {
          if (this.user.isAdmin || this.user.isOutsideSubnet) {
            // 관리자 이거나, 외부망일경우
            return true;
          } else {
            return false;
          }
        } else {
          return true;
        }
      }
    },
    showProfileMenu() {
      if (this.user.isAdmin) {
        return this.$Utils.featuresDefault("headerProfile", false);
      } else {
        return this.$Utils.featuresDefault("headerProfile", false);
      }
    },
    showDaelimSite() {
      return (
        this.$Utils.featuresDefault("daelim.overseas", false) &&
        !this.user.isAdmin
      );
    },
    logoPath() {
      let baseUrl = store.state.webBaseURL || "";
      let logoImgName = Utils.featuresDefault("logoImgName", "NULL");
      if (logoImgName == "" || logoImgName == "NULL") {
        this.showlogoImg = false;
      }
      return `${baseUrl}/static/img/${logoImgName}`;
    }
  },
  mounted() {
    Event.off(EventList.DASHBOARD_SAVE);
    Event.listen(EventList.DASHBOARD_SAVE, this.cancelMode);

    Event.off(EventList.PROFILE);
    Event.listen(EventList.PROFILE, this.OpenProfileDialog);

    Event.off(EventList.PROFILE_CHANGE);
    Event.listen(EventList.PROFILE_CHANGE, this.showImg);

    //groupware 연동 ifame
    Event.off(EventList.GROUPWARE);
    Event.listen(EventList.GROUPWARE, this.groupwareDialogOpen);

    if (!this.showHeaderStyle) {
      this.userImgGetProfile();
    }

    this.userImgSrc =
      `${store.state.baseURL}/json/getProfile?userId=` +
      this.inituserId +
      "&date=" +
      new Date() +
      Math.random();
    this.LogoSize();
    this.textSetting();

    if (!this.user.isAdmin) {
      let pChange = Utils.getCookie("pChange");
      console.log("pChange:" + pChange);
      if (pChange == "true" || pChange == true) {
        this.compulsionProfileDialog();
      }

      let loginWithOut = Utils.getCookie("loginWithOut");
      console.log("loginWithOut:" + loginWithOut);
      if (loginWithOut == "true" || loginWithOut == true) {
        this.DatePassWordChange();
      }
    }

    if (this.$store.state.passwordExpired) {
      this.openPasswordChangeDialog();
    }
  },
  methods: {
    async openPasswordChangeDialog() {
      const passwordChangeDialog = create(
        import("@/components/prompts/PasswordChange")
      );
      const result = await passwordChangeDialog();
    },
    clickBreadcrumb(val, index) {
      if (index === this.breadcrumbs.length - 1) return false;
      if (index === 0) {
        this.$store.commit("setCurrentPath", "");
        this.$store.commit("setCurrentDir", "carryout");
        this.$router.push({ path: "/" });
      } else if (this.$store.state.isCarryout) {
        this.$store.commit("setCurrentPath", val.url2);
        this.$store.commit("setCurrentDir", val.id);
        this.$router.push({ path: val.url });
      } else {
        this.$router.push({ path: val.url });
      }
    },
    userImgGetProfile() {
      let userId = this.inituserId;
      console.log(userId);
      let info = api
        .getProfile(userId)
        .then(data => {
          this.showImg(true);
        })
        .catch(error => {
          this.showImg(false);
        });
    },
    textSetting() {
      let textSetting = Utils.featuresDefault("textSetting", "#fff");
      $(".navbar-link").css(
        "cssText",
        "color : " + textSetting + " !important"
      );
      $("#headerBread span").css(
        "cssText",
        "color : " + textSetting + " !important"
      );
    },
    showImg(div) {
      if (div) {
        this.initsetImg = true;
        this.userImgSrc =
          `${store.state.baseURL}/json/getProfile?userId=` +
          this.inituserId +
          "&date=" +
          new Date() +
          Math.random() +
          "&cache=";
      } else {
        this.initsetImg = false;
        $("#profile-initial").html("<b>" + this.initialName + "</b>");
      }
    },
    LogoSize() {
      let widthSize = Utils.featuresDefault("logoWidthSize", "");
      $("#logo").css("width", widthSize + "px");
      let heightSize = Utils.featuresDefault("logoHeightSize", "35");
      $("#logo").css("height", heightSize + "px");
      let marginSize = Utils.featuresDefault("logoMarginSize", "200");
      $("#header_navbar").css("width", marginSize + "px");
    },
    addShortCut() {
      let path = this.$route.path;
      if (path.startsWith("/files/")) {
        path = path.replace("/files//", "");
        path = path.replace("/files/", "");
        Event.fire(EventList.ADD_SHORTCUT, path);
      }
    },
    gotoPage(type) {
      if (this.mainType === type) return;

      if (this.prevUrl && type === "files") {
        this.$router.push({ path: this.prevUrl });
      } else {
        this.$router.push({ path: "/" + type });
      }
      if (this.mainType != "dashboardOld") {
        this.editmode = false;
      }
      // this.prevUrl = this.$route.path
      this.mainType = type;
      $("body").css("background-image", "");
    },
    handleRoute(value, oldValue) {
      let urlParts = Utils.getPath(oldValue.path, store.state.webBaseURL).split(
        "/"
      );
      urlParts = Utils.cleanArray(urlParts, [store.state.baseURL]);
      if (urlParts[0] === "files") this.prevUrl = oldValue.path;

      urlParts = Utils.getPath(
        this.$route.fullPath,
        store.state.webBaseURL
      ).split("/");
      urlParts = Utils.cleanArray(urlParts, [store.state.baseURL]);
      if (urlParts[0]) this.mainType = urlParts[0];
      else this.mainType = "files";
    },
    initPath() {
      let urlParts = Utils.getPath(
        this.$route.fullPath,
        store.state.webBaseURL
      ).split("/");
      urlParts = Utils.cleanArray(urlParts, [store.state.baseURL]);
      if (urlParts[0] && urlParts[0] != "files") {
        return urlParts[0];
      } else {
        return "files";
      }
    },
    toggleUserInfo() {
      this.$Utils.toggleActive("user-menu");

      // request volume info
      if (!this.user.isAdmin && this.$Utils.isActive("user-menu")) {
        api.getUser(this.user.userId).then(data => {
          this.volumeInfo = data.volume_info;
        });
      }
    },
    dashEvent(event) {
      if (event == "cancel") this.editmode = false;
      Event.fire(EventList.DASHBOARD, event);
    },
    getIdx(arr, id) {
      for (var i = 0; i < arr.length; i++) {
        if (arr[i].id == id) return i;
      }
      return 0;
    },
    changeMode(div, mode) {
      this.editmode = div;
      this.dashEvent(mode);
    },
    cancelMode() {
      this.editmode = false;
      this.dashEvent("cancel");
    },
    gotoMain() {
      this.$router.push({ path: "/" });
    },
    async OpenProfileDialog(param) {
      let setting = {
        type: constants.ADMINMENU.PROFILE,
        title: this.$t("login.profile"),
        width: "50%",
        containerHeight: "400px",
        userName_prop: this.inituserId
      };
      let loadData = false;
      if (param) {
        setting = param;
        loadData = true;
      }
      const result = await profileDialog(setting);
      if (result) {
        api
          .addEdituser(
            result.name,
            result.userName,
            result.password,
            result.email,
            result.groupIds,
            result.address,
            result.enabled,
            result.welcome,
            result.theme,
            constants.ADMINMENU.EDIT
          )
          .then(data => {
            this.requestCompleted(loadData);
          })
          .catch(error => {
            console.log(error);
          });
      }
    },
    async dealimCustomProfileDialog(param) {
      let setting = {
        type: constants.ADMINMENU.EDIT,
        width: "40%",
        containerHeight: "400px",
        userName_prop: this.inituserId,
        closeState: true
      };
      const result = await customProfileDialog(setting);
      if (result) {
      }
    },
    async compulsionProfileDialog(param) {
      let setting = {
        type: "MUST_CHANGE_PW",
        width: "40%",
        containerHeight: "400px",
        userName_prop: this.inituserId,
        closeState: false
      };
      const result = await customProfileDialog(setting);
      if (result) {
      }
    },
    async DatePassWordChange() {
      let setting = {
        type: constants.ADMINMENU.PROFILE,
        title: "180일",
        containerHeight: "400px",
        userName_prop: this.inituserId
      };
      const result = await dateChangeDialog(setting);
      if (result) {
      }
    },
    requestCompleted(param) {
      this.$notify({
        title: this.$t("label.success"),
        message: this.$t("messages.completed"),
        type: "success"
      });
      if (param) {
        Event.fire(EventList.PROFILE_REFRESH);
        console.log("로드행");
      }
    },
    languageChange(locale) {
      moment.locale(locale);
      store.commit("setLocale", locale);
      api.saveUserAttr({ "u:Lang": locale });
      this.$Utils.setCookie("lang", locale);
      location.href = "/";
    },
    defaultSetting() {
      if (i18n.default.locale == "ko") {
        return "한국어";
      } else {
        return "English";
      }
    },
    groupwareLink() {
      let groupwareURL = Utils.featuresDefault("groupware.workspaceLink", "/");
      let param = {
        workspaceSize: this.volumeInfo.spaceLeft
      };
      Utils.postWindowOepn(
        groupwareURL,
        param,
        this.$t("login.groupwareWorkspace")
      );
    },
    async groupwareDialogOpen(data) {
      let setting = {
        title: data.title,
        containerHeight: "400px",
        data: data.param
      };
      const result = await groupwareDialog(setting);
      if (result) {
        console.log(result);
      }
    },
    async callAlarmDialog() {
      let setting = {
        type: constants.ADMINMENU.PROFILE,
        title: this.$t("login.alarm"),
        width: "70%",
        containerHeight: "400px"
      };
      const result = await alarmDialog(setting);
      if (result) {
        console.log(result);
      }
    },
    async callsearchPermissionDialog() {
      let setting = {
        title: this.$t("login.permission"),
        width: "70%",
        containerHeight: "300px"
      };
      const result = await searchPermissionDialog(setting);
      if (result) {
        console.log(result);
      }
    },
    logout: auth.logout
  }
};
</script>

<style lang="scss">
#headprofile-img {
  width: 30px;
  height: 30px;
  border-radius: 50px;
}
#profile-initial {
  width: 30px;
  height: 30px;
  border-radius: 50px;
  background: #8c489f;
  color: rgb(236, 233, 233);
  text-align: center;
  font-weight: 400;
  font-size: 13px;
  line-height: 30px;
}

.edrm-header {
  height: $header-height;
}
.xe-header-username {
  font-weight: 800;
  white-space: nowrap;
  text-overflow: ellipsis;
  display: block !important;
  overflow: hidden;
}

.header-username {
  font-size: 15px;
  margin-left: 10px;
}

#breadcrumbs {
  border-width: 1px;
  border-radius: 3px;
}

.brand-logo {
  height: 54px;
}
.brand-logo span {
  //color: #fff;
  font-size: 32px;
  font-family: "warnock";
  font-weight: 900;
}
.brand-logo span.x {
  font-size: 37px;
  //color: #fff;
}
.navbar-brand {
  width: 150px;
}
.navbar-item {
  padding-left: 1.5rem;
}
.navbar-item .el-progress-bar {
  width: 250px;
}

.navbar-divider {
  /* border: none; */
  border-bottom: 1px solid #e6e8eb;
  margin: 8px 0;
  height: 0;
}
[class*="nav"] .iconlink {
  font-size: 24px;
  margin-left: 10px;
  cursor: pointer;
}
.badge .el-badge__content.is-fixed {
  right: 32px !important;
}

#headerBread .el-breadcrumb__inner,
#headerBread .el-breadcrumb__separator,
#headerBread .el-breadcrumb__item:last-child .el-breadcrumb__inner,
#headerBread .el-breadcrumb__item:last-child .el-breadcrumb__inner a,
#headerBread .el-breadcrumb__item:last-child .el-breadcrumb__inner a:hover,
#headerBread .el-breadcrumb__item:last-child .el-breadcrumb__inner:hover,
#headerBread .el-breadcrumb__inner.is-link {
  //color: #fff !important;
  font-size: 15px;
  line-height: 32px;
  white-space: nowrap;
  letter-spacing: -1px;
  font-weight: inherit;
}
#headerBread .el-breadcrumb__item:last-child .is-link,
#headerBread .el-breadcrumb__item:last-child .is-link:hover {
  //color: #fff !important;
}
.white {
  //color: #fff;
}
.yellow {
  color: gold;
  box-shadow: 0 0 7px 0 gold;
}
.headericon {
  margin-right: 10px;
}
.header-drop {
  max-width: 275px;
}
</style>
