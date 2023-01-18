<template>
  <div class="wrap_login">
    <div class="login">
      <div class="logo">
        <!-- <img src="../assets/img/logo.png" class="logoimg" /> -->
      </div>
      <div class="login_box">
        <!--visual box-->
        <div class="wrap_vsbox">
          <p class="txt1">Welcome to</p>
          <p class="txt2">Collaboss</p>
          <p class="txt3">{{ $t('login.info')}}</p>
        </div>
        <!--//visual box-->
        <!--wrap_field box-->
        <div class="wrap_fieldbox">
          <p>Login</p>
          <!--fieldbox-->
          <form @submit.prevent="submit" @keydown="wrong = false">
            <div class="fieldbox">
              <div class="inputclass">
                <input
                  class="input_id"
                  title="id"
                  type="text"
                  v-model="form.userId"
                  :placeholder="$t('login.username')"
                />
                <input
                  class="input_pw"
                  title="password"
                  type="password"
                  v-model="form.password"
                  :placeholder="$t('login.password')"
                />
              </div>
              <div class="btn">
                <button type="submit" class="btn_login">{{ $t('login.submit') }}</button>
              </div>
              <div class="check">
                <el-checkbox v-model="checked">{{ $t("login.saveId")}}</el-checkbox>
              </div>
              <div>
                <span class="control wrong" v-if="wrong" v-text="errorMessage"></span>
              </div>
            </div>
          </form>
          <!--//fieldbox-->
          <!--notice-->
          <div class="wrap_notice">
            <ul>
              <li onclick="location.href='#';">
                Welcome to Collaboss
                <!-- <span>2018-08-20</span> -->
              </li>
            </ul>
          </div>
          <!--//notice-->
        </div>
        <!--//wrap_field box-->
      </div>
    </div>
  </div>
</template>

<script>
import auth from "@/utils/auth";
import Utils from "@/utils/utils";
import { mapState } from "vuex";
import * as api from "@/utils/api";

export default {
  name: "login",
  props: ["dependencies"],
  data: function () {
    return {
      wrong: false,
      isLoading: false,
      form: { userId: "", password: "" },
      errorMessage: "",
      checked: false,
    };
  },
  computed: {
    ...mapState(["info"]),
    loginStyle() {
      let baseUrl = store.state.webBaseURL || "";
      return {
        backgroundImage: `url(${baseUrl}/static/img/bg_login_pa.383145c.png)`,
      };
    },
  },
  mounted() {
    if (this.dependencies) this.setup();
    if (Utils.getCookie("loginID")) {
      this.form.userId = Utils.getCookie("loginID");
    }
    //this.getNotice();
  },
  watch: {
    dependencies: function (val) {
      if (val) this.setup();
    },
  },
  methods: {
    getNotice() {
      api
        .getMessageList()
        .then((data) => {
          cosnole.log(data);
        })
        .catch((error) => {
          console.log(error);
        });
    },
    submit(event) {
      event.stopPropagation();

      if (this.checked) {
        Utils.deleteCookie("loginID");
        Utils.setCookie("loginID", this.form.userId);
      } else {
        Utils.deleteCookie("loginID");
      }

      this.isLoading = true;
      this.wrong = false;
      this.errorMessage = "";
      vue.$store.commit("setNewUserName", "");

      let redirect = this.$route.query.redirect
        ? this.$route.query.redirect
            .replace(store.state.webBaseURL, "")
            .replace(/^\/\#/g, "")
        : "/";
      if (redirect[0] !== "/") redirect = "/" + redirect;
      //let home = store.state.user.homeUrl || constants.DEFAULT_HOME
      let home = constants.DEFAULT_HOME;

      if (redirect === "/" || redirect === "/login" || !redirect) {
        console.log("======= login =========");
        redirect = home;
      }

      // try login
      auth
        .login(this.form.userId, this.form.password)
        .then((res) => {
          console.warn(redirect);
          this.$store.dispatch("resetState");
          this.$router.push({ path: redirect });
          this.isLoading = false;
        })
        .catch((error) => {
          console.log(error);
          this.wrong = true;
          if (error.httpStatus && error.httpStatus == 404) {
            this.errorMessage = "Not Found";
            return;
          }
          if (error.errmsg) this.errorMessage = error.errmsg;
          else this.errorMessage = error;

          this.isLoading = false;
        });
    },
  },
};
</script>

<style>
.logoimg {
  width: 150px;
}
.wrap_login {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  font-family: Malgun Gothic;
}
.wrap_login .login {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;
  width: 880px;
  height: 533px;
}
.wrap_login .login .logo {
  position: relative;
  height: 30px;
}
.wrap_login .login .login_box {
  width: 870px;
  height: 470px;
  border: 5px solid #d9d9d9;
  margin-top: 8px;
}
.wrap_login .login .login_box .wrap_vsbox p.txt1 {
  font-size: 20px;
}
.wrap_login .login .login_box .wrap_vsbox p.txt2 {
  font-size: 58px;
  font-weight: bold;
}
.wrap_login .login .login_box .wrap_vsbox p.txt3 {
  font-size: 16px;
  line-height: 26px;
  margin-top: 15px;
}
.wrap_login .login .login_box .wrap_fieldbox {
  float: left;
  width: 439px;
  padding: 39px 37px;
}
.wrap_login .login .login_box .wrap_fieldbox p {
  font-size: 28px;
  color: #333;
  font-weight: bold;
  line-height: 1;
}
.wrap_login .login .login_box .wrap_fieldbox .fieldbox {
  position: relative;
  width: 100%;
  height: 138px;
  margin-top: 16px;
}
.wrap_login .login .login_box .wrap_fieldbox .fieldbox .inputclass {
  float: left;
  width: 318px;
  height: 107px;
  padding: 0px;
  margin: 0px;
  display: block;
}
.wrap_login .login .login_box .wrap_fieldbox .fieldbox .inputclass .input_id {
  padding: 15px 15px;
  border: 1px solid #ccc;
  font-size: 15px;
  width: 310px;
}
.wrap_login .login .login_box .wrap_fieldbox .fieldbox .inputclass .input_pw {
  padding: 15px 15px;
  border: 1px solid #ccc;
  font-size: 15px;
  width: 310px;
  margin-top: 7px;
}
.wrap_login .login .login_box .wrap_fieldbox .fieldbox .btn {
  float: left;
  width: 10px;
  height: 107px;
  margin-left: 14px;
}
.wrap_login .login .login_box .wrap_fieldbox .fieldbox .check {
  height: 20px;
  margin-top: 10px;
  float: left;
}
.wrap_login .login .login_box .wrap_fieldbox .fieldbox .check label {
  color: #878787;
  font-size: 16px;
}
.wrap_login .login .login_box .wrap_notice {
  border-top: 1px solid #dadada;
  margin-top: 63px;
}
.wrap_login .login .login_box .wrap_notice ul {
  margin-top: 24px;
  list-style: none;
  line-height: 38px;
  font-size: 16px;
  color: #636363;
}
.wrap_login .login .login_box .wrap_notice ul li span {
  color: #757575;
  font-size: 14px;
  float: right;
}
.wrap_login .login .login_box .wrap_vsbox {
  float: left;
  width: 357px;
  height: 460px;
  padding: 43px 37px;
  background: url(../assets/img/bg_login_pa.png) left top no-repeat;
  color: #fff;
  font-family: Malgun Gothic;
}
.wrap_login .login .login_box .wrap_notice ul li {
  padding-left: 13px;
  background: url(../assets/img/dot1.png) left 16px no-repeat;
  cursor: pointer;
}

.btn_login {
  font-size: 18px;
  font-weight: bold;
  line-height: 107px;
  width: 107px;
  text-align: center;
  font-family: Malgun Gothic;
  border: 0px solid #38a0f4;
  padding: 0px 0px;
  background-color: #38a0f4;
  color: #fff !important;
  display: inline-block;
  vertical-align: middle;
  text-decoration: none !important;
  margin: 0;
}
.btn_login:hover {
  background-color: #3193e2;
  text-decoration: none !important;
  color: #fff !important;
}
.btn_login:active {
  position: relative;
  top: 1px;
  text-decoration: none !important;
  color: #fff !important;
}

#login {
  /* background-color: #F2F6FA; */
}
#login .hero,
#login .nav,
#login .is-success {
  -webkit-box-shadow: none;
  box-shadow: none;
}
.main-body {
  height: 100%;
  width: 100%;
  opacity: 0.9;
  background: no-repeat center center fixed;
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;
}
.loginbox {
  /* margin: auto;
  width: 25%;
  margin-top: 30%; */
  float: left;
  min-width: 400px;
  background-color: #000;
  opacity: 0.9;
  height: 100%;
}
.loginDiv {
  margin-top: 200px;
  margin-left: auto;
  margin-right: auto;
  width: 80%;
  color: #fff;
}
.loginDiv input {
  width: 100%;
}
.welcome {
  font-weight: 700;
  font-size: 26px;
}
.wel-box {
  margin-left: auto;
  margin-right: auto;
  width: 80%;
  text-align: center;
  margin-bottom: 100px;
}
.sizeup {
  font-size: 20pt;
  float: right;
  margin-top: 10px;
  margin-right: 10px;
  color: #ccc;
  cursor: pointer;
}
.loginbtn {
  margin-left: auto;
  margin-right: auto;
  width: 80%;
  margin-top: 50px;
}
.btnclass {
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  background-color: #fff;
}
.avatar {
  margin-top: -70px;
  padding-bottom: 20px;
}
.avatar img {
  padding: 5px;
  background: #fff;
  border-radius: 50%;
  -webkit-box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1),
    0 0 0 1px rgba(10, 10, 10, 0.1);
  box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);
}
#login input {
  font-weight: 300;
}
#login p {
  font-weight: 700;
}
#login p.subtitle {
  padding-top: 1rem;
}

.wrong {
  background: #f44336;
  color: #fff;
  padding: 0.5em;
  text-align: center;
  animation: 0.2s opac forwards;
  opacity: 0.7;
  /*
    2020-04-23 : 김준호
    메세지가 길 경우 ... 처리되고 잘리는 현상이 발생함    
    */
  /* white-space: nowrap; */
  position: relative;
  top: 15px;
  width: 400px;
  text-overflow: ellipsis;
  overflow: hidden;
  display: block;
}

@media screen and (min-width: 769px), print {
  .column.is-offset-4 {
    margin-left: 20%;
    margin-right: 20%;
  }
}
@media screen and (min-width: 769px), print {
  .column.is-4 {
    width: auto;
  }
}

@media screen and (min-width: 1256px), print {
  .column.is-offset-4 {
    margin-left: 30%;
    margin-right: 30%;
  }
}
</style>
