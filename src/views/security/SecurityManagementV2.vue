<template>
  <div :style="{'max-height': containerHeight, 'min-height': '300px'}" v-loading="isLoading" >
    <div v-if="!hasError" :element-loading-text="workingText">
      <file-card v-if="!isMulti && element" :element="element">
      </file-card>
      <div v-if="isMulti" class="text-block">
        <h3 class="h3">{{ multipleMessage }}</h3>
      </div>

      <div>
        <el-checkbox v-if="createPermissionGroup" :disabled="!permissionControlable" class="margin-top10" v-model="isInheritance" name="type" @change="confirmInheritanceChanged">{{ isInheritance? $t('messages.inherited') : $t('messages.notInherited') }}</el-checkbox>
        <el-card class="box-card" :body-style="cardStyle" v-loading="loadingPermissions" >
          <el-form ref="security" :model="security" label-width="120px">
            <!-- select security type -->
            <el-radio-group v-model="vSecurityType" @change="handleSecurityChanged" v-if="permissionControlable">
                <el-tooltip class="item" effect="dark" :content="$t('messages.security.local')" placement="bottom" :open-delay="1000">
                <el-radio-button :label="'PROFILE|ACL'">{{ $t('label.acl') }}</el-radio-button>
              </el-tooltip>
              <el-tooltip class="item" effect="dark" :content="$t('messages.security.allPrivileges')" placement="bottom" :open-delay="1000" >
                <el-radio-button :label="'NONE'">{{ $t('label.security.allPrivileges') }}</el-radio-button>
              </el-tooltip>
              <el-tooltip class="item" effect="dark" :content="$t('messages.security.super')" placement="bottom" :open-delay="1000" v-if="showSuper">
                <el-radio-button :label="'SUPER'" >{{ $t('label.security.super') }}</el-radio-button>
              </el-tooltip>
              <el-tooltip class="item" effect="dark" :content="$t('messages.security.read')" placement="bottom" :open-delay="1000" v-if="showRead">
                <el-radio-button :label="'READ'" >{{ $t('label.security.read') }}</el-radio-button>
              </el-tooltip>
            </el-radio-group>

            <!-- <el-checkbox v-model="hidden" :label="$t('label.hidden')" border size="medium" id="hiddenBtn" v-if='isHidden' @change="settingHidden"></el-checkbox> -->

            <div class='currentPermission'>
              * {{ $t('permission.current')}} : <b><span id="currentRight"></span></b> 
               <el-button type="success" size="mini" @click="requestGroupWare" v-if="showGroupWare&&!this.AdminPermission&&!this.createPermissionGroup">{{ $t('buttons.permissionAdd') }}</el-button>   
            </div>
            <div class="restoreBtn" v-if="showSuper&&!isInheritance&&showRestore">
              <el-button type="success" size="mini" @click="restorePermission">{{ $t('buttons.previousRestore') }}</el-button>
            </div>  
           
            <!-- <div v-if="isInheritance" class='isInheritanceRoot'>* {{ $t('permission.isInheritanceFolder')}} : <b><span id="isInheritanceFolder" title=""></span></b> </div> -->


            <!-- security profiles -->
            <div v-show="vSecurityType == 'PROFILE|ACL'" class="margin-top10">
              <el-form-item :label="$t('permission.securityclass')" v-if="showSecurity">
                <el-select v-model="sclassId" :placeholder="$t('permission.securityclass')" @change="handleProfileChanged" >
                  <el-option v-for="item in securityProfiles"
                    :key="item.id" :label="item.description" :value="item.id">
                    <span style="float: left">{{ item.id }}</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">{{ item.description }}</span>
                  </el-option>
                </el-select>
              </el-form-item>
              <!-- <Permission v-show="permissionLoaded > 0" :permissionList="profilePermissions" :editable="false"></Permission> -->

              <h3 class="h3 margin-top10"><i class='fa fa-arrow-circle-right'></i>{{ ' ' + $t('label.security.local') }}</h3>
              <Permission ref="permissions" :permissionList="aclPermissions" :editable="permissionEditable" :eid='elementId' :createPermissionGroup="createPermissionGroup" :PermissionGroupAdd="PermissionGroupAdd"></Permission>

            </div>

            <div v-show="vSecurityType == 'NONE'" class="margin-top10">
              <el-tag><I class='fa fa-quote-left'></i> {{ $t('messages.security.allPrivileges') }}</el-tag>
            </div>

            <div v-show="vSecurityType == 'SUPER'" class="margin-top10">
              <el-tag><I class='fa fa-quote-left'></i> {{ $t('messages.security.allPrivilegesSUPER') }}</el-tag>
            </div>


            <div v-show="vSecurityType == 'READ'" class="margin-top10">
              <el-tag><I class='fa fa-quote-left'></i> {{ $t('messages.security.read') }}</el-tag>
            </div>

          </el-form>
        </el-card>
        <div v-if="rewritePrivs && rewritePrivs.length > 0">
          <h3 class="h3 margin-top10"><i class='fa fa-arrow-circle-right'></i> {{ ' ' + $t('label.approvedPrivs') }}</h3>
          <el-table :data="rewritePrivs" border style="width: 100%">
            <el-table-column :label="$t('login.username')" width="180">
              <template slot-scope="scope">
                <i class="fa fa-user" aria-hidden="true"></i>
                {{$Utils.getUserNameForUI(scope.row.roleId, '')}}
              </template>
            </el-table-column>
            <el-table-column :label="$t('permission.permission')" width="180">
              <template slot-scope="scope">
                <span style="margin-left: 10px">{{ $t('permission.'+getPermission(scope.row.priviledge)) }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('permission.permission')" width="250">
              <template slot-scope="scope">
                <span style="margin-left: 10px">{{ scope.row.startDate + ' ~ ' + scope.row.endDate }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div v-if="showButton" style="float:right; height: 50px">
          <el-button type="primary" @click="requestCancel">{{ $t('buttons.cancel') }}</el-button>
          <el-button type="primary" @click="apply">{{ $t('buttons.apply') }}</el-button>
        </div>
      </div>
    </div>
    <!-- error -->
    <div v-else class="text-block">
      <h3 class="h3"> {{ errorMessage }} </h3>
    </div>
  </div>
</template>

<script>

import Permission from './Permissions'
import { mapState,mapActions } from 'vuex'
import FileCard from '@/views/FileCard'
import * as api from '@/utils/api'

import { create } from 'vue-modal-dialogs'

import ResultListDialog from '@/views/commons/ResultListDialog'
import PermissionDialog from '@/views/security/SecurityRestoreDialog'

const resultListDialog = create(ResultListDialog)
const permissionDialog = create(PermissionDialog)

const SYSTEM_PROFILES = ['NONE','SUPER','ACL','READ']
const LOCALSECURITY = 'PROFILE|ACL'
const PERMISSIONS = [
  ['USER_ANY', 'read'],
  ['USER_VIEW', 'view'],
  ['USER_PRINT', 'print'],
  ['USER_DOWNLOAD', 'download'],
  ['USER_CREATE', 'write'],
  ['USER_INSERT', 'add'],
  ['USER_DELETE', 'delete'],
  ['USER_UPDATE','rename'],
  ['USER_REVISE','check'],
  ['USER_GRANT', 'control'],
]
const PERMISSION_MAP = new Map(PERMISSIONS)

function isSystemProfile(profileId) {
  if (SYSTEM_PROFILES.indexOf(profileId) === -1) {
    return false
  }
  return true
}

export default {
  name: 'securityManagement',
  components:{
    Permission,
    'file-card' : FileCard,
  },
  props: {
    showButton: {
      default: true,
      type: Boolean
    },
    containerHeight: String,
    argElementId : String,
    argElementIds : {
      default: [],
      type: Array
    },
    argElements : {
      default: [],
      type: Array
    },
    title : String,
    menus: Object
  },
  watch : {
    isLoading : function(value) {
      // close, apply 사용 가능/불가
      let applyAvailable = !value
      if (!this.permissionControlable)
        applyAvailable = false
        
       if (this.isInheritance)
        applyAvailable = false

      this.$emit('toggleButtons', {apply: applyAvailable, close: !value})
    }
  },
  data() {
    return {
      hidden: false,               // 숨김 처리
      element: null,              // getElement 후 element 객체
      elementId: null,            // parameter 로 전달된 eid
      elementIds: [],
      isLoading: true,            // 전체 로딩
      loadingPermissions: false,  // permission form loading
      hasError: false,            // 에러 여부
      errorMessage: '',           // 에러 메시지
      security: null,             // 서버로 부터 처음 읽어들인 오리지날 정보
      vSecurityType: 'NONE',      // 화면에 표시하기 위한 Type
      BvSecurityType: 'NONE',     // 상속의 경우를 위한 백업
      isInheritance: false,       // 상속인지 아닌지 체크박스용 model
      sclassId: "",               // 보안프로파일 combo model
      BsclassId: "",              // 상속의 경우를 위한 백업
      securityProfileId: "",      // 초기 보안 프로파일 값
      BsecurityProfileId: "",     // 상속의 경우를 위한 백업
      securityProfiles: [],       // 전체 보안 프로파일들
      aclPermissions: [],         // ACL 권한들
      BaclPermissions: [],        // 상속의 경우를 위한 백업
      profilePermissions: [],     // 보안프로파일의 권한들
      permissionLoaded: 0,        // permission array가 바뀔경우 화면 갱신용
      rewritePrivs: [],           // 결재 승인된 권한들
      definedPermissions : [],    // 정의된 권한
      requestReload: false,
      multiSuccess: 0,
      multiFail: 0,
      showLoadingText: false,
      createPermissionGroup: true,
      AdminPermission: false,
    }
  },
  computed: {
    ...mapState(['user']),
    showPermissions() {
      return this.vSecurityType === LOCALSECURITY
    },
    showSecurity(){
      return Utils.featuresDefault('permission.security',false) 
    },
    showSuper(){
      return Utils.featuresDefault('permission.super',false) && this.user.isAdmin
    },
    showRead(){
      return Utils.featuresDefault('permission.read',false) && this.user.isAdmin
    },
    showRestore(){
      return Utils.featuresDefault('permssion.restore',false) && this.user.isAdmin
    },
    showGroupWare(){
      if(this.user.isOutsideSubnet){
        return false
      }else{
        return Utils.featuresDefault('groupware.permission',false)
      }  
    },
    isHidden(){
      let option =Utils.featuresDefault('permission.hidden',false) 
      if (this.elementIds.length==1 && this.user.isAdmin && option){
        return true
      }else{
        return false
      }
    },
    cardStyle() {
      if (this.isInheritance)
        return {padding:'20px', backgroundColor: '#eee'}
      return {padding:'20px'}
    },
    permissionEditable() {
      if (this.vSecurityType !== LOCALSECURITY || this.isInheritance)
        return false
      if (!this.permissionControlable)
        return false
      return true
    },
    permissionControlable() {
      if (this.menus && this.menus.control == 'Y')
        return true
      return false
    },
    isMulti() {
      if (this.elementIds.length > 1)
        return true
      return false
    },
    multipleMessage() {
      if (!this.element)
        return ""
      let message = this.$t('label.selectedWithCount', {name: this.$Utils.truncate(this.element.object_name,20), count: this.elementIds.length})
      return this.$t('messages.selectedMultiple') + ' : ' + message
    },
    workingText() {
      if (this.isMulti && this.showLoadingText)
        return this.$t('messages.workingMultiple', {success: this.multiSuccess, fail: this.multiFail, total: this.elementIds.length})
      return ''
    },
    PermissionGroupAdd(){
      let permission =Utils.featuresDefault('PermissionGroupAdd',true)
      console.log("++++++++++++++++++++++권한");
      console.log(permission);
      return permission
    },
  },
  methods: {
    ...mapActions(['getSecurityProfiles','getPreDefinedPermissions']),
    initParams() {
      this.elementIds = this.argElementIds.slice()
      if (this.elementIds.length > 0) {
        this.elementId = this.elementIds[0]
      } else {
        if (!this.argElementId)
          this.elementId = this.$route.query.elementId
        else
          this.elementId = this.argElementId
      }

      if (!this.isMulti && !this.elementId) {
        this.setError(this.$t('messages.selectFileOrFolder'))
        return false
      }

      return true
    },
    setError(message) {
      this.hasError = true
      this.errorMessage = message
      this.isLoading = false
      this.$emit('toggleButtons', {apply: false, close: true})
    },
    async init() {
      try {
        // get element info
        let elementData = await api.getElement(this.elementId)
        this.element = elementData.list[0]

        //부서문서함 로컬 지정.
        if(this.element.folderId.trim()=='Sites'){
              this.createPermissionGroup=false;
        }
        //숨김처리 값
        console.log(this.element);
        if(this.element.attrList){
          let attrlist=this.element.attrList
          for(var i=0; i<attrlist.length;i++){
            if(attrlist[i].name=="p:hidden"){
              this.hidden=true;
            }
          }
        }
        // get security profiles
        let lSecurityProfiles = await this.getSecurityProfiles()
        this.securityProfiles = lSecurityProfiles.slice();
        this.securityProfiles.splice(0,0, {id:'', description: this.$t('label.notSpecified')})
        this.securityProfiles = this.securityProfiles.filter(e => !isSystemProfile(e.id))
        // get doc security
        if (!this.isMulti) {
          let docSecurity = await api.getDocSecurityRights(this.elementId)
          this.security = docSecurity.security
          this.isInheritance = this.security.inherited;
          this.setSecurityType(this.security.securityProfileId)

          // init profile
          this.getSecurityProfileData()

          // rewrite
          this.rewritePrivs = this.security.rewritePrivs;
          this.aclPermissions = this.security.rightList;

          // 상속일 경우 바로 부모 정보 읽어오기
          if (this.isInheritance) {
            await this.handleInheritanceChanged(true)
          } else{
            this.isLoading = false
          }

          //현재 자신의 권한 표시
          this.currentMyPermission(docSecurity.security)
        } else {
          this.isLoading = false
        }
      } catch (error) {
        console.log(error)
        this.setError(error.errmsg)
      }

    },
    confirmInheritanceChanged(value){
       this.isInheritance=!value
       let tempMsg=this.$t('messages.inheritedConfirm')
       if(value){
         tempMsg=this.$t('messages.notInheritedConfirm')
       }
       this.$confirm(tempMsg, '', {
          confirmButtonText: this.$t('buttons.ok'),
          cancelButtonText: this.$t('buttons.cancel'),
          type: 'warning'
        }).then(() => {
          this.isInheritance=value
          this.handleInheritanceChanged(value,value)
        }).catch(() => {});
    },
    async handleInheritanceChanged(value,click) {
      console.log('inheritance changed : ' + value + ', ' + this.isInheritance)
      this.isLoading = true
      this.permissionLoaded = 0
      console.log("상속 관련 : "+ this.isInheritance);
      if (this.isInheritance) {
        this.loadingPermissions = true
        let parentSecurity = await api.getDocSecurityRights(this.element.folderId)
        parentSecurity = parentSecurity.security
        // backup
        this.BsclassId = this.sclassId
        this.BvSecurityType = this.vSecurityType
        this.BsecurityProfileId = this.securityProfileId
        this.BaclPermissions = this.aclPermissions.slice()
        // now set
        this.aclPermissions.splice(0, this.aclPermissions.length)
        for (let index = 0; index < parentSecurity.rightList.length; index++) {
          this.$set(this.aclPermissions, index, parentSecurity.rightList[index])
        }
        this.setSecurityType(parentSecurity.securityProfileId)
        this.loadingPermissions = false
        if(click){
          console.log(this.aclPermissions);
          this.saveInherite(this.aclPermissions);
          console.log("클릭시 저장");
        }
      }
      else {
        // restore
        this.sclassId = this.BsclassId
        this.vSecurityType = this.BvSecurityType
        this.securityProfileId = this.BsecurityProfileId
        this.aclPermissions=[];
        // this.aclPermissions.splice(0, this.aclPermissions.length)
        // for (let index = 0; index < this.BaclPermissions.length; index++) {
        //   this.$set(this.aclPermissions, index, this.BaclPermissions[index])
        // }
        // 2018-12-05 대림산업 권한 날리기 설정
        console.log(this.BaclPermissions);
        for(var i=0; i< this.BaclPermissions.length;i++){
          if(this.BaclPermissions[i].privType!=6){
            this.aclPermissions.push(this.BaclPermissions[i]);
          }
        }
        console.log(this.aclPermissions);


//        this.aclPermissions.push(...this.BaclPermissions)
      }

      this.isLoading = false
      this.permissionLoaded++

      this.$emit('toggleButtons', {apply: !this.isInheritance, close: !value})
    },
    handleSecurityChanged(label) {
      this.permissionLoaded = 0
      console.log('Security Changed : ' + label)
      this.permissionLoaded ++
    },
    handleProfileChanged() {
      this.getSecurityProfileData()
    },
    restorePermission(){
      this.requestCancel();
      let param="event=event.permission&pageSize=1&docid="+this.elementId;
      api.getHistoriesList(param).then(data => { 
          if(data.list[0]){
            permissionDialog({ argElementId: data.list[0].docId, history: true, oldhistory: true, securitylist: data.list[0].security})
          }else{
            permissionDialog({ argElementId: this.elementId, history: true, oldhistory: true, securitylist: {}, listError: true})
          }
      }).catch((error) => {
          console.log(error); 
      });   
    },
    // security profile 상세 권한 가져오기
    getSecurityProfileData() {
      this.profilePermissions.splice(0,this.profilePermissions.length)
      if (!this.sclassId)
        return
      this.permissionLoaded = 0
      api.getSecurityProfileData(this.sclassId).then(d => {
        this.profilePermissions.push(...d.list)
        this.permissionLoaded ++
      })
    },
    setSecurityType(id) {
      this.securityProfileId = id
      if (!isSystemProfile(this.securityProfileId)){
        this.vSecurityType = LOCALSECURITY
        this.sclassId = this.securityProfileId
      }
      else{
        if (this.securityProfileId === 'ACL')
          this.vSecurityType = LOCALSECURITY
        else
          this.vSecurityType = this.securityProfileId
        this.sclassId = ''
      }
    },
    settingHidden(e){
        let extAttrs=[{
            name : 'p:hidden',
            value : 'T'
        }]
        if(e){
          api.updateExtAttrs(this.elementId, extAttrs).then(data => {
           this.$showSuccess()
          })
        }else{
          console.log(this.elementId);
          api.removeExtAttrs(this.elementId).then(data => {
           this.$showSuccess()
          })
        }
    },
    requestCancel() {
      this.$emit('closeRequested', this.requestReload)
    },
    requestGroupWare(){
      let groupwareURL=Utils.featuresDefault('groupware.permissionLink',"/")
      
      api.getDocInfo(this.elementId).then(data=>{
         console.log(data);
          let param={
              list: {
                elementId : this.elementId,
                fileName : data.list[0].object_name
              }
          }
          Utils.postWindowOepn(groupwareURL,param,this.$t('Groupware.permission'));
      }).catch(error=>{})
      
    },
    getPermission(priv) {
      return PERMISSION_MAP.get(priv)
    },
    async currentMyPermission(right){

      this.definedPermissions = await this.getPreDefinedPermissions()
      let array=[]
      console.log(right);
      if(right.myRights){
         this.definedPermissions.forEach(e => {
           let permissionName=e.permissionGroupName
           let depends=e.depends
           if(right.myRights[permissionName]==1){
             array.push(permissionName);
           }
         })
         if(array.length!=0){
            $("#currentRight").html(this.$t("permission.name."+array[0]));
            if(array[0]=="Admin"){
              this.AdminPermission=true;
            }
            $(".currentPermission").show();
         }else{
            $(".currentPermission").hide();
         }
      }
    },
    validate(sclassId, aclRights) {
      if (this.vSecurityType === LOCALSECURITY) {
        // acl 설정이 있거나 프로파일 설정 되어있어야함
        if (aclRights.length < 1 && !sclassId)
          return false
      }
      return true
    },
    saveInherite(aclPermissions){
      let aclRights = []
      api.saveRight(this.elementId,"ACL",true,aclPermissions, false).then(data => {
          this.multiSuccess ++
          console.log(eid + ' saved')
      }).catch((error) => {
          this.multiFail ++
          errList.push({name: element.object_name, message: error.errmsg})
          console.log(eid + ' error')
          console.log(error);
          return error
      })
    },
    // save rights
    apply: _.throttle( function () {
      let toSclassId = this.vSecurityType
      let aclRights = []
      if (this.vSecurityType === LOCALSECURITY) {
        toSclassId = (this.sclassId)? this.sclassId : 'ACL';
        aclRights = this.$refs.permissions.getChangedPermissionList()
      }
      if (!this.validate(this.sclassId, aclRights)) {
        this.$showError(this.$t('messages.security.checkPermission'))
        return
      }
      let eids = []
      if (this.isMulti) {
        eids = this.elementIds
      } else {
        eids.push(this.elementId)
      }
      this.isLoading = true
      this.showLoadingText = true
      let funcs = []
      let myvue = this
      myvue.multiSuccess = 0
      myvue.multiFail = 0
      let errList = []
      // promise all 을 위해 함수화
      function saveRights(element, eid, sclassId, inheritance, aclRights){
        console.log(aclRights);
        return api.saveRight(eid,sclassId,inheritance,aclRights, false).then(data => {
          myvue.multiSuccess ++
          console.log(eid + ' saved')
        })
        .catch((error) => {
          myvue.multiFail ++
          errList.push({name: element.object_name, message: error.errmsg})
          console.log(eid + ' error')
          console.log(error);
          return error
        })
      }
      eids.forEach((element, index) => {
        funcs.push(saveRights(myvue.argElements[index], element,toSclassId,myvue.isInheritance,aclRights))
      })
      Promise.all(funcs).then(r => {
        if (this.multiFail < 1) {
          this.$showSuccess(this.$t('label.results'), this.workingText)
          this.requestCancel();
        }
        else {
          if (this.isMulti)
            resultListDialog({message: this.workingText, list: errList})
          else
            this.$showError(errList[0].message)
        }
        // this.$showSuccess(this.$t('label.results'), this.workingText)
        this.isLoading = false
        this.showLoadingText = false
        console.log('all completed');

        // refresh
        // this.init()
      }).catch(e => {
        console.log(e);
      })

    }, 2000),
  },
  created() {
    if (!this.initParams())
      return

    this.init()
  },
  mounted() {
     Event.off(EventList.PERMISSION_RIGHT)
     Event.listen(EventList.PERMISSION_RIGHT, this.apply)
  }
}
</script>

<style>
input[data-readonly] {
  pointer-events: none;
}

.el-radio-button__orig-radio:disabled:checked+.el-radio-button__inner {
    background-color: lightslategrey;
}
.currentPermission{
  float:right;
  font: 12pt;
  display: none;
}
.restoreBtn{
  float:right;
  font: 12pt;
}
.isInheritanceRoot{
  float: right;
  font: 12pt;
  margin-right: 10px;
}
#hiddenBtn{
  float: right;
  background-color: #fff;
}
</style>
