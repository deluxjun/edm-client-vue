<template>
  <el-dialog id="memberDialog" ref="windowRef"
    :title="title" :width='width' :visible.sync="dialogVisible" v-draggable:before-close="close" :before-close="close">
    <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="120px" :label-position="labelPosition" class="ruleForm" :disabled="!editable">
      <el-form-item :label="$t('adminMenu.group_desc')" prop="desc">
          <el-input  class="" type="text" v-model.trim="ruleForm.desc" :disabled="!editable"></el-input>
      </el-form-item>
    </el-form>
    <el-button size='mini' class='memberAddBtn' v-if="editable" @click="addMembersToPrivGroup">{{$t('label.memberAdd')}}</el-button>
    <div id="MebmerTable">
    <el-table :data="tableData" border style="width: 100%" height="300" v-loading="isLoading" >
              <el-table-column prop="groupId" :label="$t('permission.div')" width="120">
                <template slot-scope="scope">
                  {{$Utils.divGroupType(tableData[scope.$index].type)}}
                </template>
              </el-table-column>
              <el-table-column prop="name" :label="$t('permission.usergroup')">
              <template slot-scope="scope">
                <div class='inline permission-user'>
                 {{ tableData[scope.$index].name+"("+tableData[scope.$index].id+")"}} 
                </div>
              </template>
              </el-table-column>
              <el-table-column
                prop="groupId"
                width="180"
                label="-">
                <template slot-scope="scope">
                  <el-button size='mini' v-if="editable" @click="removeMembersFromPrivGroupClick(scope.$index,tableData[scope.$index].id,tableData[scope.$index].type)">{{$t('buttons.delete')}}</el-button>
                </template>
              </el-table-column>
    </el-table>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="editAndClose()" v-if="editable" >{{ $t('buttons.ok') }}</el-button>
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

const userGroupDialog  = create(SelectUserGroupDialog)

export default {
  name: 'memberDialog',
  props: {
    title: String,
    width: {
      default: '50%',
      type: String
    },
    containerHeight: String,
    type: String,
    ruleForm: Object,
    editable: Boolean,
    parentId_prop: Number,
    privType: Number,
    type_prop: Number,
    permission: String,
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
      dialogVisible: true,
      labelPosition: 'left',
      tableData: [],
      rules: {
          groupId: [
            { required: true, message: this.$t('adminMenu.rule_groupId'), trigger: 'blur' },
            { validator: validateKorea, trigger: 'blur' }
          ],
          desc: [
            { required: true, message: this.$t('adminMenu.rule_groupName'), trigger: 'blur' },
          ],
      },
      isLoading: true,
      MemberUserIds:[],
      MemberGroupIds:[]
    }
  },
  components:{
    //SelectUsermemberDialog,
    UserGroup
  },
  computed: {

  },
  mounted(){
    console.log(this.editable);
    this.init();
  },
  methods: {
    init(){
      this.loadData();
    },
    async loadData(){
      if(this.type_prop==0){
        await api.getGroupAndUser(this.ruleForm.groupId).then(data=>{
            this.tableData=data.list;
            this.isLoading=false
        }).catch(error=>{
            console.log(error)
        })
      }else{
         await api.listMembers(this.ruleForm.groupId).then(data=>{
            this.tableData=data.list;
            this.isLoading=false
          }).catch(error=>{
            console.log(error)
          })
      }
    },
    close() {
      let daelimPermission = Utils.featuresDefault("permission.memberCheck",false);
      if(daelimPermission){
        if(this.privType==6&&this.tableData.length==0&&this.permission=='Admin'&&(this.MemberUserIds.length+this.MemberGroupIds.length > 0 )){
            this.dialogVisible=false;
            this.$store.commit('closeHovers')
        }else if(this.privType==7&&this.tableData.length==0&&(this.MemberUserIds.length+this.MemberGroupIds.length > 0 )&&this.permission=='Admin'){
            this.dialogVisible=false;
            this.$store.commit('closeHovers')
        }else if(this.privType==6&&this.tableData.length==0&&this.permission=='Admin'&&(this.MemberUserIds.length+this.MemberGroupIds.length==0 )){
            this.$alert(this.$t('messages.memberExist'), '', {
                          confirmButtonText: this.$t('buttons.ok'),
                          type: 'warning'
            }).then(() => { }).catch(() => { });
        }else if(this.privType==7&&this.tableData.length==0&&(this.MemberUserIds.length+this.MemberGroupIds.length==0 )&&this.permission=='Admin'){
            this.$alert(this.$t('messages.memberExist'), '', {
                      confirmButtonText: this.$t('buttons.ok'),
                      type: 'warning'
            }).then(() => { }).catch(() => { });
        }else{
            this.dialogVisible=false;
            this.$store.commit('closeHovers')
        }
      }else{
            this.dialogVisible=false;
            this.$store.commit('closeHovers')
      }
    },
    editAndClose() {
      if(this.privType==6&&this.tableData.length==0&&this.permission=='Admin'){
            this.$alert(this.$t('messages.memberExist'), '', {
                        confirmButtonText: this.$t('buttons.ok'),
                        type: 'warning'
            }).then(() => { }).catch(() => { });
      }else if(this.privType==7&&this.tableData.length==0&&this.permission=='Admin'){
            this.$alert(this.$t('messages.memberExist'), '', {
                    confirmButtonText: this.$t('buttons.ok'),
                    type: 'warning'
            }).then(() => { }).catch(() => { });
      }else{
        this.editRemove();
      }
     
    },
    editRemove(){
       this.$refs['ruleForm'].validate((valid) => {
          if (valid) {
            let tempGroupID= Utils.blankValue(this.ruleForm.groupId)
            this.data = {
                  parentId: this.parentId_prop,
                  name: tempGroupID,
                  desc: Utils.blankValue(this.ruleForm.desc),
                  tpye: 1,
                  create: false,
                  managerId: ""
            }
            api.createEditGroup(this.parentId_prop, tempGroupID, Utils.blankValue(this.ruleForm.desc),
              false,"",1)
            .then(data => {
              if(this.MemberUserIds.length > 0 || this.MemberGroupIds.length > 0 ){
                  this.removeMembersFromPrivGroup();
              }else{
                this.$close(this.data)
              } 
            })

          } else {
              console.log('error submit!!');
              return false;
          }
      });
    },
    removeMembersFromPrivGroupClick(idx,name,type){
        this.tableData.splice(idx,1);
        if(type==-1){
          this.MemberUserIds.push(name);
        }else{
          this.MemberGroupIds.push(name);
        }
    },
    removeMembersFromPrivGroup(){
          let tempParentId=this.ruleForm.groupId
          api.removeMembersFromPrivGroup(tempParentId, this.MemberUserIds.join(","), this.MemberGroupIds.join(","))
              .then(data => {
                  this.$close(this.data)
              })
              .catch((error) => {
                    console.log(error);
              })
    },
     async addMembersToPrivGroup() {
      const result = await userGroupDialog({
        type: Constants.VIEW_TYPES.SEL_USERGROUP, title: this.$t('messages.selectUserAndGroup'), width: '80%', containerHeight: '600px',
        gridSelectable: Constants.SELECTABLE.MULTIPLE,
        memoryList: true
      })
      if (result) {
        api.addMembersToPrivGroup(this.ruleForm.groupId, result)
        .then(data => { this.requestCompleted();
        })
        .catch((error) => {
              console.log(error);
        })
      }
    },
    requestCompleted() {
      this.$notify({
        title: this.$t('label.success'),
        message: this.$t('messages.completed'), type: 'success'
      })
      this.loadData()
    },
  }
}
</script>

<style>
#memberDialog input[type='text']{
    margin-bottom: 5px;
    margin-top: 5px;
    width: 97%;
}
#memberDialog .el-form-item{
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

#MebmerTable .el-table td, .el-table th{
  padding : 5px !important;
}
#MebmerTable .el-button+.el-button{
  margin-left: 0px !important;
}
.memberAddBtn{
  float:right; 
  margin-right: 10px; 
  top: -15px;
  position: relative;
}


</style>

