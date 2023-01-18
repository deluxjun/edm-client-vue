<template>
  <el-dialog id="groupDialog" ref="windowRef"
    :title="title" :width='width' :visible.sync="dialogVisible" v-draggable:before-close="close">
    <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="120px" :label-position="labelPosition" class="ruleForm">
      <el-form-item :label="$t('adminMenu.group_id')" prop="groupId" v-if="type!=$Constants.VIEW_TYPES.PERMISSION">
        <el-input autofocus class="" type="text" :placeholder="$t('adminMenu.idcheck')" v-if="type!=$Constants.ADMINMENU.EDIT" v-model.trim="ruleForm.groupId"></el-input>
        <el-input autofocus class="" type="text" v-if="type==$Constants.ADMINMENU.EDIT" v-model.trim="ruleForm.groupId" disabled></el-input>
      </el-form-item>
      <el-form-item :label="$t('adminMenu.group_desc')" prop="desc">
          <el-input  class="" type="text" v-model.trim="ruleForm.desc"></el-input>
      </el-form-item>
       <el-form-item :label="$t('adminMenu.group_manager')" v-if="type!=$Constants.VIEW_TYPES.PERMISSION">
        <el-tag :key="manager" v-for="manager in managerId" :closable="true" :disable-transitions="false" @close="handleRemoveManager(manager)">
          <i class="fa fa-user" aria-hidden="true"></i>
          {{ manager }}
        </el-tag>
        <el-button class="button-new-tag" size="small" @click="managerIdSearach">{{ $t('label.add') }} </el-button>

         <!-- <el-input type="text" :placeholder="$t('buttons.search')" size="small" v-model="managerId" @focus='managerIdSearach'>
          <i class="el-icon-search el-input__icon" slot="prefix"></i>
        </el-input> -->
        </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="editAndClose()">{{ $t('buttons.ok') }}</el-button>
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
import SelectUserGroupDialog from '@/views/SelectUserGroupDialog'
import UserGroup from '@/views/UserGroup'
import { create } from 'vue-modal-dialogs'

const userGroupDialog = create(SelectUserGroupDialog)

export default {
  name: 'groupDialog',
  props: {
    title: String,
    width: {
      default: '50%',
      type: String
    },
    containerHeight: String,
    type: String,
    groupId_prop: String,
    parentId_prop: String,
    desc_prop : String,
    attr_prop: Object,
    elementid: String,
  },
  data: function () {
    var validateKorea = (rule, value, callback) => {
       let checkkorea = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
       if (value === '') {
          callback(new Error(this.$t('adminMenu.rule_groupId')));
        } else if (checkkorea.test(value)) {
          callback(new Error(this.$t('adminMenu.idcheck')));
        } else {
          callback();
        }
    }
    return {
      parentId: '',
      create:true,
      dialogVisible: true,
      labelPosition: 'left',
      managerId: [],
      ruleForm: {
          groupId: '',
          desc: '',
      },
      rules: {
          groupId: [
            { required: true, message: this.$t('adminMenu.rule_groupId'), trigger: 'blur' },
            { validator: validateKorea, trigger: 'blur' }
          ],
          desc: [
            { required: true, message: this.$t('adminMenu.rule_groupName'), trigger: 'blur' },
          ],
      }
    }
  },
  components:{
    SelectUserGroupDialog,
    UserGroup
  },
  computed: {

  },
  mounted(){
    this.parentId=this.parentId_prop
    if(this.type==Constants.ADMINMENU.EDIT){
        this.ruleForm.groupId=this.groupId_prop
        this.ruleForm.desc=this.desc_prop
        if (this.attr_prop && this.attr_prop.length > 0) {
          this.attr_prop.forEach(element => {
            if (element.attrName == 'g:manager')
              this.managerId.push(element.attrValue)
          });
        }
        this.create=false;
    }
  },
  methods: {
    handleRemoveManager(manager) {
      this.managerId.splice(this.managerId.findIndex(e => e === manager), 1);
    },
    async managerIdSearach(){
          const result = await userGroupDialog({
            type: Constants.VIEW_TYPES.SEL_USER, title: this.$t('messages.selectUserAndGroup'), width: '80%', containerHeight: '600px',
            gridSelectable: Constants.SELECTABLE.ROW
          })
          if (result) {
            this.managerId.push(result[0].id);
          }
    },

    close() {
      this.dialogVisible=false;
      this.$store.commit('closeHovers')
    },
    editAndClose() {
      this.$refs['ruleForm'].validate((valid) => {
          if (valid) {
            let tempGroupID= Utils.blankValue(this.ruleForm.groupId)
            if(this.type==Constants.VIEW_TYPES.PERMISSION){
               let selectedList=Utils.getCurrentSelect();
                
                api.createEditGroup(this.parentId_prop, tempGroupID, Utils.blankValue(this.ruleForm.desc),
                  this.create, this.managerId.join(','),1,this.elementid)
                .then(data => {
                  let returnData = {
                    parentId: Utils.blankValue(this.parentId),
                    name: data.id,
                    desc: Utils.blankValue(this.ruleForm.desc),
                    tpye: 1,
                    create: false,
                    managerId: this.managerId.join(','),
                    elementId : this.elementid
                  }
                  this.$close(returnData)
                })
            }else{
               this.data = {
                  parentId: Utils.blankValue(this.parentId),
                  name: tempGroupID,
                  desc: Utils.blankValue(this.ruleForm.desc),
                  tpye: 0,
                  create: false,
                  managerId: this.managerId.join(',')
              }
              api.createEditGroup(this.parentId_prop, tempGroupID, Utils.blankValue(this.ruleForm.desc),
                this.create, this.managerId.join(','),0)
              .then(data => {
                this.$close(this.data)
              })
            }

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
#groupDialog input[type='text']{
    margin-bottom: 5px;
    margin-top: 5px;
    width: 97%;
}
#groupDialog .el-form-item{
  margin-bottom: 25px;
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


</style>

