<template>
  <el-dialog id="overWriteDialog" class='overWriteDialog' ref="windowRef"
    :title="title" :width='width' :visible.sync="dialogVisible" v-draggable:before-close="close">
    {{this.$t('messages.overWriteFileName', {name: this.name})}}<br>
     <el-radio v-model="check" label="overwrite" border><i class='k-icon k-i-check'></i> {{ this.$t('messages.overwrite') }}</el-radio>
     <el-radio v-model="check" label="skipfile" border><i class='k-icon k-i-rotate'></i> {{ this.$t('messages.skipfile')}}</el-radio>
     <el-radio v-model="check" label="allowRename" border><i class='k-icon k-i-copy'></i> {{ this.$t('messages.allowRename')}}</el-radio>
     <el-checkbox v-if="allcheckView" v-model="allcheck">{{ this.$t('messages.allcheck')}}</el-checkbox>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="confirm()">{{ $t('buttons.ok') }}</el-button>
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
  name: 'overWriteDialog',
  props: {
    title: String,
    width: {
      default: '50%',
      type: String
    },
    containerHeight: String,
    fileName: String,
    allcheckType: {
      defult: true,
      type: Boolean
    }
  },
  data: function () {
    return {
      check: "overwrite",
      dialogVisible: true,
      allcheck: false,
      name: '',
      overwrite: false,
      skipfile: false,
      allowRename: false,
      allcheckView: true,
    }
  },
  mounted(){
    this.name=this.fileName
    this.allcheckView=this.allcheckType
  },
  methods: {
    close() {
      this.dialogVisible=false;
      let data={
        overwrite : this.overwrite,
        skipfile : this.skipfile,
        allowRename: this.allowRename,
        close : true,
        all : this.allcheck
      }
      this.$close(data)
    },
    confirm: function (event) {
      this.checkedDate();
      let data={
        overwrite : this.overwrite,
        skipfile : this.skipfile,
        allowRename: this.allowRename,
        close : false,
        all : this.allcheck
      }
      this.$close(data)
    },
    checkedDate(status){
      if(this.check=="overwrite"){
        this.overwrite=true;
      }else if(this.check=="skipfile"){
        this.skipfile=true;
      }else if(this.check=="allowRename"){
        this.allowRename=true;
      }
    }
  }
}
</script>

<style>
#overWriteDialog input[type='text']{
    margin-bottom: 5px;
    margin-top: 5px;
    width: 97%;
}
#overWriteDialog .el-form-item{
  margin-bottom: 20px;
}
#overWriteDialog .el-radio{
  margin-left: 0px !important;
  width: 100% !important;
  margin-bottom: 3px;
}
</style>

