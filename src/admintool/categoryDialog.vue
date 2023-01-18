<template>
  <el-dialog id="categoryDialog" ref="windowRef"
    :title="title" :width='width' :visible.sync="dialogVisible" v-draggable:before-close="close">
    <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="120px" :label-position="labelPosition" class="ruleForm">
      <el-form-item :label="$t('adminMenu.category_ID')" prop="eclassId">
        <el-input autofocus class="" type="text" :placeholder="$t('adminMenu.idcheck')"  v-model.trim="ruleForm.eclassId"></el-input>
      </el-form-item>
      <el-form-item :label="$t('adminMenu.category_Name')" prop="desc">
          <el-input  class="" type="text" v-model.trim="ruleForm.desc"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="createAndClose()">{{ $t('buttons.ok') }}</el-button>
      <el-button @click="close()">{{ $t('buttons.cancel') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import Vue from 'vue'
import url from '@/utils/url'
import Utils from '@/utils/utils'
import * as api from '@/utils/api'
import { mapState } from 'vuex'
import Constants from '@/Constants'
import { localeData } from 'moment';
import UserGroup from '@/views/UserGroup'


export default {
  name: 'categoryDialog',
  props: {
    title: String,
    width: {
      default: '50%',
      type: String
    },
    containerHeight: String,
    type: String,
    eclassId_prop: String,
    parentId_prop: String,
    desc_prop : String,
  },
  data: function () {
    var validateKorea = (rule, value, callback) => {
       let checkkorea = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
       if (value === '') {
          callback(new Error(this.$t('adminMenu.rule_category')));
        } else if (checkkorea.test(value)) {
          callback(new Error(this.$t('adminMenu.idcheck')));
        } else {
          callback();
        }
    }
    return {
      parentId: '',
      dialogVisible: true,
      labelPosition: 'left',
      ruleForm: {
          eclassId: '',
          desc: '',
      },
      rules: {
          eclassId: [
            { required: true, message: this.$t('adminMenu.rule_category'), trigger: 'blur' },
            { validator: validateKorea, trigger: 'blur' }
          ],
          desc: [
            { required: true, message: this.$t('adminMenu.rule_category_Name'), trigger: 'blur' },
          ],
      }
    }
  },
  computed: {

  },
  mounted(){
    this.parentId=this.parentId_prop
    this.ruleForm.eclassId=this.eclassId_prop
    this.ruleForm.desc=this.desc_prop
  },
  methods: {
    close() {
      this.dialogVisible=false;
      this.$store.commit('closeHovers')
    },
    createAndClose: function (event) {
      this.$refs['ruleForm'].validate((valid) => {
          if (valid) {
            this.data = {
              parentId: Utils.blankValue(this.parentId),
              eclassId: Utils.blankValue(this.ruleForm.eclassId),
              desc: Utils.blankValue(this.ruleForm.desc),
            }
            this.$close(this.data)
          } else {
              console.log('error submit!!');
              return false;
          }
      });
    },
  }
}
</script>

<style>
#categoryDialog input[type='text']{
    margin-bottom: 5px;
    margin-top: 5px;
    width: 97%;
}
#categoryDialog .el-form-item{
  margin-bottom: 20px;
}
</style>

