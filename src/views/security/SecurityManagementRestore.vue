<template>
  <div :style="{'max-height': containerHeight, 'min-height': '300px', 'padding':'5px'}" v-loading="false" >
    <div v-if="!hasError" :element-loading-text="workingText">
      <!-- <file-card v-if="!isMulti && element" :element="element">
      </file-card> -->
      <div v-if="isMulti" class="text-block">
        <h3 class="h3">{{ multipleMessage }}</h3>
      </div>

      <div>
        <el-checkbox v-if="createPermissionGroup&&!history" :disabled="!permissionControlable" class="margin-top10" v-model="isInheritance" name="type" @change="confirmInheritanceChanged">{{ isInheritance? $t('messages.inherited') : $t('messages.notInherited') }}</el-checkbox>
        <el-card class="box-card" :body-style="cardStyle" v-loading="loadingPermissions" >
          <el-form ref="security" :model="security" label-width="120px">
            <!-- select security type -->
            <el-radio-group v-model="vSecurityType" @change="handleSecurityChanged" v-if="permissionControlable&&!history">
                <el-tooltip class="item" effect="dark" :content="$t('messages.security.local')" placement="bottom" :open-delay="1000">
                <el-radio-button :label="'PROFILE|ACL'">{{ $t('label.acl') }}</el-radio-button>
              </el-tooltip>
              <el-tooltip class="item" effect="dark" :content="$t('messages.security.allPrivileges')" placement="bottom" :open-delay="1000" >
                <el-radio-button :label="'NONE'">{{ $t('label.security.allPrivileges') }}</el-radio-button>
              </el-tooltip>
              <el-tooltip class="item" effect="dark" :content="$t('messages.security.super')" placement="bottom" :open-delay="1000" v-if="showSuper">
                <el-radio-button :label="'SUPER'" >{{ $t('label.security.super') }}</el-radio-button>
              </el-tooltip>
            </el-radio-group>

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
              <h3 class="h3 margin-top10"><i class='fa fa-arrow-circle-right'></i>{{ ' ' + $t('label.security.local') }}</h3>
              <Permission ref="permissions" :oldhistory="oldhistory" :securitylist="securitylist" :permissionList="aclPermissions" :editable="permissionEditable" :eid="elementId" :PermissionGroupAdd="PermissionGroupAdd"></Permission>

            </div>

            <div v-show="vSecurityType == 'NONE'" class="margin-top10">
              <el-tag><I class='fa fa-quote-left'></i> {{ $t('messages.security.allPrivileges') }}</el-tag>
            </div>

            <div v-show="vSecurityType == 'SUPER'" class="margin-top10">
              <el-tag><I class='fa fa-quote-left'></i> {{ $t('messages.security.allPrivilegesSUPER') }}</el-tag>
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
        <div v-if="showButton" style="float:right; margin-top: 10px;">
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
//import FileCard from '@/views/FileCard'
import * as api from '@/utils/api'

import { create } from 'vue-modal-dialogs'

//import ResultListDialog from '@/views/commons/ResultListDialog'

//const resultListDialog = create(ResultListDialog)

const SYSTEM_PROFILES = ['NONE','SUPER','ACL']
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
    //'file-card' : FileCard,
  },
  props: {
    showButton: {
      default: true,
      type: Boolean
    },
    containerHeight: String,
    argElementId : String,
    title : String,
    menus: Object,
    history: {
      default: false,
      type: Boolean
    },
    oldhistory: {
      default: false,
      type: Boolean
    },
    securitylist: Object,
    listError:{
      default: false,
      type: Boolean
    }
  },
  watch : {
    isLoading : function(value) {
      // close, apply 사용 가능/불가
      let applyAvailable = !value
      if (!this.permissionControlable)
        applyAvailable = false
      console.log(applyAvailable);
      this.$emit('toggleButtons', {apply: applyAvailable, close: !value})
    }
  },
  data() {
    return {
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
      requestReload: false,
      multiSuccess: 0,
      multiFail: 0,
      showLoadingText: false,
      createPermissionGroup: true,
    }
  },
  computed: {
    showPermissions() {
      return this.vSecurityType === LOCALSECURITY
    },
    showSecurity(){
      return Utils.featuresDefault('permission.security',false)
    },
    showSuper(){
      return Utils.featuresDefault('permission.super',false)
    },
    cardStyle() {
      if (this.isInheritance)
        return {padding:'20px', backgroundColor: '#eee'}
      return {padding:'20px'}
    },
    permissionEditable() {
      console.log(this.history);
      if(this.history){ //이력
        return false
      }else{
        if (this.vSecurityType !== LOCALSECURITY || this.isInheritance)
          return false
        if (!this.permissionControlable)
          return false
        return true
      }
    },
    permissionControlable() {
      // if (this.menus && this.menus.control == 'Y')
      //   return true
      return true
    },
    PermissionGroupAdd(){
      let permission =Utils.features('PermissionGroupAdd') || false
      return permission
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
    }
  },
  methods: {
    ...mapActions(['getSecurityProfiles']),
    initParams() {
      this.elementIds = this.argElementId
      if (!this.isMulti && !this.elementId) {
        this.setError(this.$t('messages.selectFileOrFolder'))
        return false
      }
      return true
    },
    getData(e){
      console.log(e);
    },
    setError(message) {
      this.hasError = true
      this.errorMessage = message
      this.isLoading = false
      this.$emit('toggleButtons', {apply: false, close: true})
    },
    async init(getEid) {
      this.elementId=getEid
      try {
        // get element info
        let elementData = await api.getElement(getEid)
        this.element = elementData.list[0]

        //부서문서함 로컬 지정.
        if(this.element.folderId.trim()=='Sites'){
              this.createPermissionGroup=false;
        }
        
        // get security profiles
        let lSecurityProfiles = await this.getSecurityProfiles()
        this.securityProfiles = lSecurityProfiles.slice();
        this.securityProfiles.splice(0,0, {id:'', description: this.$t('label.notSpecified')})
        this.securityProfiles = this.securityProfiles.filter(e => !isSystemProfile(e.id))

        if(this.listError){
          this.setError(this.$t('messages.permissionHistoryError'))
          this.$emit('toggleButtons', {apply: false, close: true})
          return false
        }else{
                // get doc security
                if (!this.isMulti) {
                  console.log("테스트 진행+++++++++++++++++++++++++++");
                  console.log(this.securitylist);
                  let docSecurity = await api.getDocSecurityRights(getEid).then(data => {
              
                  }).catch((error) => {
                      this.setError(this.$t('messages.permissionHistoryError'))
                      this.$emit('toggleButtons', {apply: false, close: true})
                  })
                  if(this.oldhistory){
                    this.security = this.securitylist
                  }else{
                    this.security = docSecurity.security
                  }
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
                } else {
                  this.isLoading = false
                }
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
          this.handleInheritanceChanged(value)
        }).catch(() => {});
    },
    async handleInheritanceChanged(value) {
      console.log('inheritance changed : ' + value + ', ' + this.isInheritance)
      this.isLoading = true
      this.permissionLoaded = 0

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
      }
      else {
        // restore
        this.sclassId = this.BsclassId
        this.vSecurityType = this.BvSecurityType
        this.securityProfileId = this.BsecurityProfileId
        this.aclPermissions.splice(0, this.aclPermissions.length)
        for (let index = 0; index < this.BaclPermissions.length; index++) {
          this.$set(this.aclPermissions, index, this.BaclPermissions[index])
        }
//        this.aclPermissions.push(...this.BaclPermissions)
      }

      this.isLoading = false
      this.permissionLoaded++
    },
    handleSecurityChanged(label) {
      this.permissionLoaded = 0
      console.log('Security Changed : ' + label)
      this.permissionLoaded ++
    },
    handleProfileChanged() {
      this.getSecurityProfileData()
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
    requestCancel() {
      this.$emit('closeRequested', this.requestReload)
    },
    getPermission(priv) {
      return PERMISSION_MAP.get(priv)
    },
    validate(sclassId, aclRights) {
      if (this.vSecurityType === LOCALSECURITY) {
        // acl 설정이 있거나 프로파일 설정 되어있어야함
        if (aclRights.length < 1 && !sclassId)
          return false
      }
      return true
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
        return api.saveRight(eid,sclassId,inheritance,aclRights, false).then(data => {
          myvue.multiSuccess ++
          console.log(eid + ' saved')
          this.requestCancel();
        })
        .catch((error) => {
          myvue.multiFail ++
          console.log(eid + ' error')
          console.log(error);
          return error
        })
      }
      eids.forEach((element, index) => {
         funcs.push(saveRights(element, this.element.r_object_id,toSclassId,myvue.isInheritance,aclRights))
      })
      Promise.all(funcs).then(r => {
        if (this.multiFail < 1)
          this.$showSuccess(this.$t('label.results'), this.workingText)
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
      
  },
  mounted() {
     Event.off(EventList.PERMISSION_PASS)
     Event.listen(EventList.PERMISSION_PASS, this.init)
     Event.off(EventList.PERMISSION_RIGHT)
     Event.listen(EventList.PERMISSION_RIGHT, this.apply)
     this.init(this.argElementId);
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
</style>
