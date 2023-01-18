<template>
  <el-dialog id="deleteDialog" ref="windowRef"
    :title="title" :width='width' :visible.sync="dialogVisible" v-draggable:before-close="close">
    <div class='delete-message'>
      <span class='weight'>[{{target}}]</span><span>{{$t('adminMenu.to')}}</span><br>
      <span>{{$t('prompts.deleteMessage')}}</span>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button v-if="btnType==$Constants.ADMINMENU.UNSSIGN" type="danger" @click="unssignAndClose()">{{ $t('label.unassign') }}</el-button>
      <el-button v-else-if="btnType==$Constants.ADMINMENU.DELETE" type="danger" @click="deleteAndClose()">{{ $t('buttons.delete') }}</el-button>
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
  name: 'deleteDialog',
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
    targetType_prop: String,
    targetParentId: String,
  },
  data: function () {
    return {
      target: '',
      target_Id: '',
      target_type: '',
      target_parentId: '',
      dialogVisible: true,
    }
  },
  mounted(){
    this.target=this.target_prop
    this.target_Id=this.targetId_prop
    this.target_type=this.targetType_prop
    this.target_parentId=this.targetParentId

  },
  methods: {
    close() {
      this.dialogVisible=false;
      this.$store.commit('closeHovers')
    },
    deleteAndClose: function (event) {
      this.data = {
        id: Utils.blankValue(this.target_Id),
        type:  Utils.blankValue(this.target_type)
      }
      this.$close(this.data)
    },
    unssignAndClose: function (event) {
      this.data = {
        id: Utils.blankValue(this.target_Id), 
        type: parseInt(this.target_type),
        parentId: this.target_parentId
      }
      this.$close(this.data)
    },
  }
}
</script>

<style>
#groupDialog input[type='text']{
    margin-bottom: 5px;
    margin-top: 5px;
    width: 97%;
}
.infoset{
    height: 30px;
    background-color: #ccc;
    width: 100%;
    padding: 5px;
    margin-bottom: 10px;
    font-weight: 700;
    margin-top : 5px;
}
.groupinfo{
    display: inline-block;
    width: 100px;
}
.groupbox{
    width: 100%;
    position: relative;
    border-width: 1px;
    border-style: solid;
    border-radius: 4px;
    border-color: #C5C5C5;
    background-color: #FFF;
    min-height: 2.7em;
    padding: 3px;
    overflow-x: auto;
    box-sizing: border-box;
    margin-bottom: 10px;
}
.idinput{
  /*margin-left: -5px;*/
}
.delete-message{
  text-align: center;
  padding: 10px;
}
.weight{
  font-weight: 700;
}

</style>

