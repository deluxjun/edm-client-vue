<template>
  <el-dialog
    :title="this.$t('adminMenu.user_pwchange')"
    width="380px"
    :show-close="false"
    :visible.sync="dialogVisible"
    v-draggable
    :before-close="close"
    :close-on-click-modal="false"
  >
    <span>{{ this.$t('messages.passwordExpired') }}</span>
    <el-form
      style="margin-top: 20px;"
      :model="ruleForm"
      :rules="rules"
      ref="ruleForm"
      label-width="120px"
      label-position="'left'"
    >
      <el-form-item :label="$t('adminMenu.user_pw')" prop="oneEps">
        <el-input class type="password" v-model.trim="ruleForm.oneEps"></el-input>
      </el-form-item>
      <el-form-item
        :label="$t('adminMenu.user_pwconfirm')"
        prop="checkPass"
        style="margin-top: 22px"
      >
        <el-input class type="password" v-model.trim="ruleForm.checkPass"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm">{{ $t('buttons.change') }}</el-button>
      <el-button @click="logout()">{{ $t('buttons.cancel') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { postUrl } from "@/utils/api";
import auth from "@/utils/auth";

export default {
  data() {
    let kin3 = (str, max) => {
      if (!max) max = 3; // 글자수를 지정하지 않으면 3로 지정
      let i, j, k, x, y;
      let buff = [
        "0123456789",
        "abcdefghijklmnopqrstuvwxyz",
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
      ];
      let src,
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

    let validatePass = (rule, value, callback) => {
      //1차 비밀번호
      let reg_pw = /^.*(?=.{9,17})(?=.*[0-9])(?=.*[a-zA-Z]).*$/;

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
    let validatePass2 = (rule, value, callback) => {
      let reg_pw = /^.*(?=.{9,17})(?=.*[0-9])(?=.*[a-zA-Z]).*$/;

      if (value === "") {
        callback(new Error(this.$t("adminMenu.rule_pwcheck")));
      } else if (value !== this.ruleForm.oneEps) {
        callback(new Error(this.$t("adminMenu.rule_pwcheck2")));
      } else {
        callback();
      }
    };

    return {
      pChanged: false,
      dialogVisible: true,
      ruleForm: {
        oneEps: "",
        checkPass: ""
      },
      rules: {
        oneEps: [{ validator: validatePass, trigger: "blur" }],
        checkPass: [{ validator: validatePass2, trigger: "blur" }]
      }
    };
  },
  methods: {
    submitForm() {
      this.$refs["ruleForm"].validate(valid => {
        if (valid) {
          const formData = new FormData();
          const pChangeData = {
            userName: this.$store.state.user.userId,
            name: this.$store.state.user.userName,
            password: this.ruleForm.oneEps
          };
          postUrl(`/json/addUser`, jQuery.param(pChangeData), true).then(
            res => {
              store.commit("setPasswordExpired", false);
              this.$close();
            }
          );
        }
      });
    },
    close() {
      this.$close();
    },
    logout: auth.logout
  }
};
</script>
