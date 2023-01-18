<template>
  <el-dialog id="volumeDialog" ref="windowRef"
    :title="title" :width='width' :visible.sync="dialogVisible" v-draggable:before-close="close">
    <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="120px" :label-position="labelPosition" class="ruleForm">
      <el-form-item :label="$t('adminMenu.user_curMaxVolume')" prop="curVol">
          <span>{{ruleForm.curVol}}</span>
      </el-form-item>
      <el-form-item :label="$t('adminMenu.user_changeVolume')" prop="setVol">
          <el-input class="" type="text" v-model.trim="ruleForm.setVol"></el-input>
          <kendo-dropdownlist id="volumeDrop" :data-source="dataSource" data-text-field='name' :data-value-field="'id'" :change="typeChange"></kendo-dropdownlist>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="setvolAndClose()">{{ $t('buttons.ok') }}</el-button>
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
import { create } from 'vue-modal-dialogs'

export default {
  name: 'volumeDialog',
  props: {
    title: String,
    width: {
      default: '50%',
      type: String
    },
    containerHeight: String,
    btnType: String,
    target_prop: String,
    targetId_prop: String,
    target_vol_prop: String,
  },
  data: function () {
    return {
      labelPosition: 'left',
      target: '',
      target_Id: '',
      target_vol: '',
      dialogVisible: true,
      calcValue: 1024*1024*1024,
      dataSource: [
          { name: 'GB', id: 1024*1024*1024 },
          { name: 'MB', id: 1024*1024 },
          { name: 'KB', id: 1024 }
      ],
      ruleForm: {
          curVol : '',          
          setVol: '',
      },
      rules: {
          
      }
    }
  },
  mounted(){
    this.target=this.target_prop
    this.target_Id=this.targetId_prop
    this.ruleForm.curVol=this.target_vol_prop
  },
  methods: {
    close() {
      this.dialogVisible=false;
      this.$store.commit('closeHovers')
    },
    setvolAndClose: function (event) {
      this.data = {
        volumeId: Utils.blankValue(this.target_Id), 
        maxSize: Utils.blankValue(this.ruleForm.setVol*this.calcValue)
      }
      this.$close(this.data)
    },
    typeChange: function (ev) {
      let node = ev.node;
      let dataItem = ev.sender.dataItem(node);
      this.calcValue=dataItem.id
    }
  }
}
</script>

<style>
.delete-message{
  text-align: center;
  padding: 10px;
}
.weight{
  font-weight: 700;
}

</style>

