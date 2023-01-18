<template>
<div v-if="!isLoading" class="margin-top10" id="PermissionBox">
  <el-button v-if="editable" type="primary" icon="el-icon-plus" size="small" @click='handleAdd'>{{ $t('label.deptGroup-add') }}</el-button>
  <el-button v-if="editable&&PermissionGroupAdd&&this.reUseRight()" type="primary" icon="el-icon-plus" size="small" @click='privGroup' class='permissionAdd'>{{ $t('label.permissionGroup-add') }}</el-button>
  <el-button v-if="editable&&PermissionGroupAdd&&this.createPermission()" type="info" icon="el-icon-plus" size="small" @click='createGroup' class='permissionAdd'>{{ $t('label.permissionGroup-create') }}</el-button>
  <!-- <el-input v-if="editable" type="text" :placeholder="this.$t('buttons.search')" v-model="autoCompleteValue" @keydown.native="handleSearchChange" class='permissionSearch'>
            <i class="el-icon-circle-close-outline el-input__icon" slot="suffix" @click='resetSearch'></i>
  </el-input> -->
  <el-card v-if="vPermissionList.length > 0" class="box-card" :body-style="cardStyle">
   <el-table
    :data="vPermissionList"
    border
    height="300"
    style="width: 100%">
    <el-table-column prop="groupId" :label="$t('permission.usergroup')" width="300">
       <template slot-scope="scope">
        <div class='inline permission-user'>
        {{$Utils.getUserNameForUI(vPermissionList[scope.$index].groupId, vPermissionList[scope.$index].groupName,vPermissionList[scope.$index].groupType)}}
        </div>
      </template>
    </el-table-column>
    <el-table-column prop="groupId" :label="$t('permission.div')" width="120"> 
      <template slot-scope="scope">
        {{$Utils.divGroupType(vPermissionList[scope.$index].groupType,vPermissionList[scope.$index].privType)}}
      </template>
    </el-table-column>
    <el-table-column prop="groupId" :label="$t('permission.advancedpermission')">
      <template slot-scope="scope">
        <el-select v-model="vPermissionList[scope.$index].checkedList[0]" placeholder="Select" :disabled="disableValue(vPermissionList[scope.$index].privType) || !editable">
          <el-option v-for="(field,index) in allFields" :key="index" :label=" $t('permission.name.' + field)" :value="field" v-if="disableOption(vPermissionList[scope.$index].privType,field)">
            <span style="float: left"> {{ $t('permission.name.' + field) }}</span>
          </el-option>
        </el-select>
      </template>
    </el-table-column>
    <el-table-column prop="groupId" label="" width="150">
      <template slot-scope="scope">
        <el-button size='mini' v-if="!editable&&vPermissionList[scope.$index].groupType!=-1" @click="memberSetting(vPermissionList[scope.$index].groupId,vPermissionList[scope.$index].groupName,false,scope.$index,null,vPermissionList[scope.$index].groupType)">{{$t('label.view')}}</el-button>
        <el-button size='mini' v-if="editable&&vPermissionList[scope.$index].groupType==0" @click="memberSetting(vPermissionList[scope.$index].groupId,vPermissionList[scope.$index].groupName,false,scope.$index,null,0)">{{$t('label.view')}}</el-button>
        <el-button size='mini' v-if="editable&&vPermissionList[scope.$index].groupType==1&&!permissionCheck(vPermissionList[scope.$index].privType)" @click="memberSetting(vPermissionList[scope.$index].groupId,vPermissionList[scope.$index].groupName,false,scope.$index,1)">{{$t('label.view')}}</el-button>
        <el-button size='mini' v-if="editable&&vPermissionList[scope.$index].groupType==1&&permissionCheck(vPermissionList[scope.$index].privType)" @click="memberSetting(vPermissionList[scope.$index].groupId,vPermissionList[scope.$index].groupName,true,scope.$index,vPermissionList[scope.$index].parentId,1)">{{$t('buttons.edit')}}</el-button>
        <el-button size='mini' v-if="editable&&!deleteDisABLE(vPermissionList[scope.$index].privType)" @click="deleteTempPermission(scope.$index)">{{$t('buttons.release')}}</el-button>
        <el-button size='mini' v-if="editable&&vPermissionList[scope.$index].privType==7" @click="confirmDeletePermission(scope.$index,vPermissionList[scope.$index].groupType,vPermissionList[scope.$index].groupId,vPermissionList[scope.$index].createPermissionGroup)">
          <span v-if="vPermissionList[scope.$index].createPermissionGroup">{{$t('buttons.delete')}}</span>
          <span v-else>{{$t('buttons.release')}}</span>
        </el-button>
      </template>
    </el-table-column>
  </el-table>
  </el-card>
</div>
</template>

<script>
import _ from 'lodash'
import * as api from '@/utils/api'
import { mapState,mapActions } from 'vuex'
import Utils from '@/utils/utils'
import SelectUserGroupDialog from '@/views/SelectUserGroupDialog'
import GroupDialog from '@/admintool/groupDialog'
import MemberDialog from '@/views/security/memberDialog'
import PrivGroupDialog from '@/views/security/listPrivGroupDialog'

import { create } from 'vue-modal-dialogs'
import Constants from '@/Constants'

const userGroupDialog = create(SelectUserGroupDialog)
const groupDialog = create(GroupDialog)
const memberDialog = create(MemberDialog)
const privGroupDialog = create(PrivGroupDialog)

const PERMISSIONS = ['add', 'check', 'control', 'delete', 'download', 'extend', 'print', 'read', 'rename','manager'];

export default {
  name: 'permissions',
  components:{
  },
  props: {
    permissionList : {
      required : true,
      type: Array
    },
    editable : {
      default : true,
      type: Boolean
    },
    eid : {
      type: String
    },
    createPermissionGroup :{
      type: Boolean
    },
    PermissionGroupAdd : {
      type: Boolean
    }
  },
  watch: {
    permissionList : function() {
      this.init()
    }
  },
  computed: {
    ...mapState(['user']),
    allFields() {
      if(this.predefined) {

        return this.definedPermissions.map(e => e.permissionGroupName)
      }
      return PERMISSIONS
    },
    allEditable() {
      if(this.predefined) {
        return this.definedPermissions.map(e => {
          return (e.editable != undefined)? e.editable : true;
        })
      }
      return PERMISSIONS.map(e => true)
    },    
    predefined() {
      if(this.definedPermissions && this.definedPermissions.length > 0) {
        return true
      }
      return false
    },
    cardStyle() {
      return {'max-height':'350px', 'overflow':'auto'}
    },
    
    isAdmin () {
        return this.user.isAdmin
    },
  },
  data: function () {
    return {
      vPermissionList: [],
      definedPermissions : [],
      isLoading: true,
      autoCompleteValue: ''
    }
  },
  created() {
  },
  mounted() {
    console.log("수정여부:"+this.editable);
    this.init()
  },
  methods: {
    ...mapActions(['getPreDefinedPermissions']),
    async init() {
      this.definedPermissions = await this.getPreDefinedPermissions()
      // set virtual PermissionList
      let myvue = this
      this.vPermissionList.splice(0,this.vPermissionList.length)
      this.permissionList.forEach(item => {
        let nitem = {}
        if (myvue.predefined) {
          nitem.checkedList = this.getEmptyList()
          if(myvue.definedPermissions.length>0){
            nitem.checkedList=[];
          }
          myvue.definedPermissions.forEach(e => {
            let every = e.permissions.every(p => {
              let pname = p.toLowerCase()
              return (item[pname] && item[pname] === 1)
            })
            if (every){
              nitem.checkedList.push(e.permissionGroupName)
            }
          }) 
        } else {
          nitem.checkedList = PERMISSIONS.filter(e => {
            return (item[e] && item[e] === 1)
          })
        }
        if (item.groupType != undefined)
          nitem.groupType = item.groupType
        else
          nitem.groupType = -1
        nitem.groupId = item.groupId
        nitem.groupName = item.groupName
        nitem.isIndeterminate = true
        nitem.checkAll = false
        nitem.privType =item.privType
        myvue.vPermissionList.push(nitem)
        //console.log(myvue.vPermissionList);
      });
      this.sortPermissions();
      this.isLoading = false
    },
    resetSearch(){
      this.autoCompleteValue='';
    },
    remoteDataSource(){
        return [{ name : 'text '}]
    },
    permissionCheck(privType){
      if(privType==6){
        return true
      }else if(privType==7){
        return true
      }else{
        return false
      }
    },
    getEmptyList(){
      let empty = [];
      for (let index = 0; index < this.allFields.length; index++) {
        if (!this.allEditable[index])
          empty.push(this.allFields[index]);
      }
      return empty
    },
    
    fireCheckedChange(item, on) {
      // depends 처리
      if (this.predefined) {
        if (on) {
          let copy = item.checkedList.slice();
          this.getPermissionGroupsByNames(copy).forEach(element => {
            element.depends.forEach(d => {
                item.checkedList.pushIfNotExist(d);
            });
          });
        }
        // off
        else {
          let notChecked = []
          this.allFields.forEach(name => {
            if (item.checkedList.indexOf(name) === -1) {
              notChecked.push(name);
            }
          });
          notChecked.reverse();
          let checkedGroups = this.getPermissionGroupsByNames(item.checkedList);
          // 체크 안된 권한에 의존하고 있는 권할을 제거
          notChecked.forEach(name => {
            checkedGroups.forEach(group => {
              if (group.depends.indexOf(name) !== -1) {
                item.checkedList.remove(group.permissionGroupName)
              }
            });      
          });
        }
      }

      this.handleCheckedChange(item)
    },
    // private function
    getPermissionGroupsByNames(array) {
      let myvue = this
      let groups = []
      array.forEach(name => {
        let permissionGroup = myvue.definedPermissions.find(p => {
          return p.permissionGroupName === name
        })
        if (permissionGroup) {
          groups.push(permissionGroup)
        }
      });
      return groups;
    },
    handleCheckedChange(item) {
      let checkedCount = item.checkedList.length;
      item.checkAll = checkedCount === this.allFields.length;
      item.isIndeterminate = checkedCount > 0 && checkedCount < this.allFields.length;
    },

    // delete Temp
    deleteTempPermission(idx){
      this.vPermissionList.splice(idx, 1);
    },
    confirmDeletePermission(idx,grouptype,groupId,create){
      console.log(create);
      if(create){
        this.$confirm(this.$t('prompts.deleteMessage'), '', {
          confirmButtonText: this.$t('buttons.ok'),
          cancelButtonText: this.$t('buttons.cancel'),
          type: 'error'
        }).then(() => {
         
            api.deleteGroup(groupId).then(() => {
              this.vPermissionList.splice(idx, 1);
            }).catch(() => {});
        }).catch(() => {});
      }else{
         this.vPermissionList.splice(idx, 1);
      } 
    },
    getChangedPermissionList() {
      // if (!this.validate()) {
      //   return []
      // }
      let allRights = []
      let myvue = this
      this.vPermissionList.forEach(item => {
        let rights = []
        if (myvue.predefined) {
          // 미리 정의된 권한의 경우.
          // item.checkedList.forEach(name => {
          //   let permissionGroup = myvue.definedPermissions.find(p => {
          //     return p.permissionGroupName === name
          //   })
          //   if (permissionGroup)
          //     console.log(...permissionGroup.permissions);
          //     rights.push(...permissionGroup.permissions)
          // });
          
          let permissionGroup = myvue.definedPermissions.find(p => {
              return p.permissionGroupName === item.checkedList[0]
          })
          if (permissionGroup)
              rights.push(...permissionGroup.permissions)
        }
        else {
          // 기본 권한들의 경우..
          rights.push(...item.checkedList)
        }
        let rightsObj = {}
        rights.forEach ((v,k) => { rightsObj[v.toLowerCase()] = 1 });
        rightsObj.groupId = item.groupId
        rightsObj.groupType = item.groupType
        rightsObj.privType = item.privType
        allRights.push(rightsObj)
      })

      
      let warning=true;
      for(var i=0;i<this.vPermissionList.length;i++){
        if(this.vPermissionList[i].checkedList[0]=='Admin'){
          warning=false;
        }
      }
      if(warning){
         this.$alert(this.$t('messages.adminPermissionExist'), '', {
          confirmButtonText: this.$t('buttons.ok'),
          type: 'warning'
			  }).then(() => {
			
			  }).catch(() => { });   
      }else{
        return allRights
      }
    },
    async handleAdd() {
      let params = {
        type: constants.VIEW_TYPES.SEL_USERGROUP,
        title: this.$t('messages.selectUserAndGroup'),
        width: '80%',
        containerHeight: '600px',
        gridSelectable: constants.SELECTABLE.MULTIPLE,
        memoryList: true
      }
      var results = await userGroupDialog(params)
      if (results && results.length > 0) {
        results.forEach(result => {
          let nitem = {}
          nitem.checkedList = this.getEmptyList()
          nitem.groupType = (result.type !== undefined)? result.type : 0
          nitem.groupId = result.id

         
          if (nitem.groupType == -1)
            nitem.groupName = result.name
          else
            nitem.groupName = result.description
          nitem.isIndeterminate = true
          nitem.checkAll = false
          // 이미 존재하는지 체크
          if (this.vPermissionList.findIndex(e => e.groupId == nitem.groupId) == -1) {
            this.vPermissionList.push(nitem)
            //this.handleCheckedChange(nitem)
          }else{
             this.$notify({
                title: this.$t('label.warning'),
                message: this.$t('messages.same'), type: 'warning'
              })
          }
        })
        this.sortPermissions();
      }
    },
    async createGroup(){
      let params = {
        type: constants.VIEW_TYPES.PERMISSION,
        title: this.$t('label.permissionGroup-create'),
        width: '40%',
        elementid: this.eid
      }
      var results = await groupDialog(params)
      if (results) {
        console.log(results);
        let nitem = {}
        nitem.checkedList = this.getEmptyList()
        nitem.groupType = 1
        nitem.privType = 7
        nitem.groupId = results.name
        nitem.groupName = results.desc
        nitem.createPermissionGroup= true
        this.vPermissionList.push(nitem)
        //Event.fire(EventList.PERMISSION_RIGHT)
        this.sortPermissions();
      }
    },
    changeGroupClass(groupId){
      let right=groupId.split('_')[0];
      let className=''
      if(right=='right'){
        className='siteGroup'
      }
      return className
    },
    permissionGroupShow(groupId){
      let right=groupId.split('_')[0];
      let status=false;
      if(right=='right'){
        status=true
      }
      return status
    },
    reUseRight(){
      return this.$Utils.featuresDefault('permission.reuse.enabled',false)
    },
    createPermission(){
        return true
    },
    async memberSetting(id,name,view,idx,parentId,type){
      let items={
         groupId: id,
         desc: name,
      }
      let temptitle= this.$t('label.permissionGroup-view')
      if(view){
        temptitle=this.$t('label.permissionGroup-edit')
      }
      let params = {
        editable: view,
        title: temptitle,
        width: '50%',
        ruleForm: items,
        parentId_prop: parentId,
        type_prop : type,
        permission : this.vPermissionList[idx].checkedList[0],
        privType : this.vPermissionList[idx].privType
      }
      var results = await memberDialog(params)
      if (results) {
        this.vPermissionList[idx].groupName=results.desc;
      }
    },
    async privGroup(){
      let params = {
        elementId : this.eid,
        title: this.$t('label.permissionGroup-add'),
        width: '400px',
        elementid: this.eid
      }
      var results = await privGroupDialog(params)
      if (results) {
        console.log(results);
        //id setting
        let array=[];
        console.log(this.vPermissionList);
        for(var i=0; i < this.vPermissionList.length;i++){
          array.push(this.vPermissionList[i].groupId);
        }
        //배열 추가
        for(var i=0; i < results.length;i++){
           let nitem = {}
            nitem.checkedList = this.getEmptyList()
            nitem.groupType = 1
            nitem.privType = 7
            nitem.groupId = results[i].id
            nitem.groupName = results[i].groupName
            if(array.indexOf(results[i].id)==-1){
              this.vPermissionList.push(nitem)
            }
        }
        //Event.fire(EventList.PERMISSION_RIGHT)
        this.sortPermissions();
      }
    },
    sortPermissions(){
      this.vPermissionList.sort(function(a,b){
        if(a.groupType > b.groupType) return -1; 
        if(a.groupType < b.groupType) return 1;
        if(a.privType < b.privType) return -1; 
        if(a.privType > b.privType) return 1;
        if(a.groupName > b.groupName) return 1;
        if(a.groupName < b.groupName) return -1;
      })
    },
    deleteDisABLE(privType){
       if(privType==6 || privType==5 || privType==7){
        return true
      }else{
        return false
      }
    },
    disableValue(privType){
      //5: 승인된 그룹 6: 기본그룹 
      if(privType==6 || privType==5){
        return true
      }else{
        return false
      }
    },
    disableOption(privType,field){
      // if(field=='Admin'&&privType!=6){
      //   return false
      // }else{
      //   return true
      // }
      return true
    }
  }
}
</script>


<style lang="scss">

.inline {
  display: inline-block;
  margin-right: 20px;
}

.permission-user {
    width: 300px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
}

.siteGroup{
  background-color: #f0f9eb;
}

.redicon{
  color: red;
}
.cursor{
  cursor: pointer;
}
.none{
  display: none;
}
.permissionSearch{
  width: 30% !important;
  float: right;
}
.permissionAdd{
  
}
#PermissionBox .el-table td, .el-table th{
  padding : 5px !important;
}
#PermissionBox .el-button+.el-button{
  margin-left: 0px !important;
}
</style>
