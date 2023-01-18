<template>
  <el-dialog id="userDialog" ref="windowRef"
    :title="title" :width='width' :visible.sync="dialogVisible" v-draggable:before-close="close" :fullscreen="true">
      <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="120px" :label-position="labelPosition" class="ruleForm">
        <div class='profile-box' v-if="showProfileImg">
            <div class='profile-center' v-loading="imgloading">
                <span id='setImg'>
                  <img id='profileImg' :src="userImgSrc" v-if="initsetImg"/>
                  <span id='initial' v-else ><b>{{this.ruleForm.userName.substr(0,1)}}</b></span>
                </span>
            </div>
            <div class='profile-center'>
              <el-upload class="upload-demo" ref="upload" :action="userImgSaveApi" :before-upload="maxSizeLimit" :show-file-list="false" :auto-upload="true" accept=".bmp, .png, .jpg, .jpeg" :on-success="loadImg">
                <el-button slot="trigger" type="primary">{{ $t('buttons.change') }}</el-button>
                <el-button style="margin-left: 10px; display:inline-block" type="danger" @click="deleteProfileImage()">{{ $t('buttons.delete') }}</el-button>
              </el-upload>
          </div>
          <span id='sizeNotice'>{{ $t('label.profile_imgSizeLimit') }}</span>
        </div>
        <div :class='changeWidth()'>
            <div class='infoset'>{{ $t('adminMenu.userinfo') }}</div>
            <el-form-item :label="$t('adminMenu.user_id')" prop="userName">
              <el-input autofocus class="" :placeholder="$t('adminMenu.idcheck')" type="text" v-if="type==$Constants.ADMINMENU.CREATE" v-model.trim="ruleForm.userName"></el-input>
              <el-input class="" type="text" v-if="type!=$Constants.ADMINMENU.CREATE" v-model.trim="ruleForm.userName" disabled></el-input>
            </el-form-item>
            <el-form-item :label="$t('adminMenu.user_name')" prop="name">
              <el-input class="" type="text" v-model.trim="ruleForm.name"></el-input>
            </el-form-item>
            <el-button v-show="showBtn" size="small" type="primary" @click="passwordView()">{{ $t('adminMenu.user_pwchange') }}</el-button>
            <el-form-item :label="$t('adminMenu.user_pw')" prop="password" v-show="showPW">
              <el-input class="" type="password" v-model.trim="ruleForm.password"></el-input>
            </el-form-item>
            <el-form-item :label="$t('adminMenu.user_pwconfirm')" prop="checkPass" v-show="showPW">
              <el-input class="" type="password" v-model.trim="ruleForm.checkPass"></el-input>
            </el-form-item>
            <div class='infoset'>{{ $t('adminMenu.user_groupinfo') }}
              <el-button v-show='showAdmin' type="primary" @click="searchGroup()" class='search-btn'>{{ $t('buttons.search') }}</el-button>
            </div>
            <el-form-item :label="$t('adminMenu.user_group')" prop="groupIdArr" required>
              <div class="groupbox" id="grouplist">
                <el-tag type="success" :v-model="ruleForm.groupIdArr" :key="tag.id" v-for="tag in ruleForm.groupIdArr" :closable="showAdmin? true : false" :disable-transitions="false" @close="removeItem(tag)">
                  {{tag.description}}
                </el-tag>
              </div>
            </el-form-item>
        </div>

        <div class='etc-box'>
            <div v-if="showIndividualInfo">
              <div class='infoset'>{{ $t('adminMenu.user_contact') }}</div>
              <el-form-item :label="$t('adminMenu.user_email')" prop="email">
                <el-input class="" type="text" v-model.trim="ruleForm.email"></el-input>
              </el-form-item>
              <el-form-item :label="$t('adminMenu.user_address')" prop="address">
                <el-input class="" type="text" v-model.trim="ruleForm.address"></el-input>
              </el-form-item>

              <div class='infoset'>{{ $t('adminMenu.user_etc') }}</div>
              <el-form-item :label="$t('adminMenu.user_homepage')" prop="homepage">
              <el-select clearable v-model="welcome">
                  <el-option v-for="item in dashBoards" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
              </el-form-item>

              <!-- <el-form-item :label="$t('adminMenu.user_theme')" prop="theme">
              <el-select clearable v-model="theme">
                  <el-option v-for="item in themes" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
              </el-form-item> -->
            </div>

             <el-radio-group v-show='showAdmin' v-model="active" id="radio_group">
                <el-radio :label="true" >{{$t('adminMenu.user_active')}}</el-radio>
                <el-radio :label="false">{{$t('adminMenu.user_inactive')}}</el-radio>
              </el-radio-group>

            <div v-if="type!=$Constants.ADMINMENU.CREATE">
              <el-button type="info" @click="setVolume()" class='vol-btn' plain v-show="showAdmin">{{ $t('adminMenu.setting') }}</el-button>
              <div class='infoset'>{{ $t('adminMenu.user_Volume') }}</div>
              <div v-show="volume_info">
                <el-progress :text-inside="true" :stroke-width="18" :percentage="volume.percentage" :color="volume.color"></el-progress>
                <el-input class="label-custom" :value="volume.text" readonly></el-input>
              </div>
            </div>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button v-if="type==$Constants.ADMINMENU.CREATE" type="primary" @click="createAndClose()">{{ $t('buttons.save') }}</el-button>
        <el-button v-else-if="type!=$Constants.ADMINMENU.CREATE" type="primary" @click="editAndClose()">{{ $t('buttons.save') }}</el-button>
        <el-button @click="close()">{{ $t('buttons.cancel') }}</el-button>
      </div>
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
import setVolumeDialog from '@/admintool/volumeDialog'

const userGroupDialog = create(SelectUserGroupDialog)
const volumeDialog = create(setVolumeDialog)

export default {
  name: 'userDialog',
  props: {
    title: String,
    width: {
      default: '50%',
      type: String
    },
    containerHeight: String,
    type: String,
    userName_prop: String,
  },
  data: function () {
    var validatePass = (rule, value, callback) => {
          if(this.type!=this.$Constants.ADMINMENU.CREATE){
            callback();
          }else{
            if (value === '') {
              callback(new Error(this.$t('adminMenu.rule_pw')));
            } else {
              if (this.ruleForm.checkPass !== '') {
                this.$refs.ruleForm.validateField('checkPass');
              }
              callback();
            }
          }
    };
    var validatePass2 = (rule, value, callback) => {
         if(this.type!=this.$Constants.ADMINMENU.CREATE){
            callback();
         }else{
            if (value === '') {
              callback(new Error(this.$t('adminMenu.rule_pwcheck')));
            } else if (value !== this.ruleForm.password) {
              callback(new Error(this.$t('adminMenu.rule_pwcheck2')));
            } else {
              callback();
            }
         }
    };
    var validateKorea = (rule, value, callback) => {
       let checkkorea = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
       if (value === '') {
          callback(new Error(this.$t('adminMenu.rule_userName')));
        } else if (checkkorea.test(value)) {
          callback(new Error(this.$t('adminMenu.idcheck')));
        } else {
          callback();
        }
    }
    var validategroup = (rule, value, callback) => {
       if (value.length==0) {
          callback(new Error(this.$t('adminMenu.rule_group')));
        } else {
          callback();
        }
    };
    var validateEmail = (rule, value, callback) => {
       let email_regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i;

        if (value.length==0) {
          callback(new Error(this.$t('adminMenu.rule_email')));
        } else if(!email_regex.test(value)){
          callback(new Error(this.$t('adminMenu.rule_email2')));
        } else {
          callback();
        }
    };
    return {
      labelPosition: 'left',
      item: null,
      active: true,
      dialogVisible: true,
      data: null,
      confirm: '',
      volume_info: null,
      progress_view: false,
      imgloading: true,
      ruleForm: {
          userName : '',
          name: '',
          password: '',
          checkPass: '',
          groupIdArr: [],
          address: '',
          email: ''
      },
      userImgSrc : null,
      welcome: '/files//' + this.$t('files.Shared'),
      userImgSaveApi:null,
      showimg: true,
      theme: 'theme0',
      state: false,
      showViewImg: true,
      initsetImg: false,
      pwErrmsg: '',
      rules: {
          userName: [
            { required: true, message: this.$t('adminMenu.rule_userName'), trigger: 'blur' },
            { validator: validateKorea, trigger: 'blur' }
          ],
          name: [
            { required: true, message: this.$t('adminMenu.rule_name'), trigger: 'blur' },
          ],
          password: [
            { validator: validatePass, message: this.pwErrmsg, trigger: 'blur' }
          ],
          checkPass: [
            { validator: validatePass2, trigger: 'blur' }
          ],
          groupIdArr: [
            {validator: validategroup, trigger: 'change'}
          ],
          // email : [
          //   { required: true, validator: validateEmail, trigger: 'blur' }
          // ]
      },
      themes: [
        {
          value: "theme0",
          label: this.$t('label.theme0')
        },
        {
          value: "theme1",
          label: this.$t('label.theme1')
        },
        {
          value: "theme2",
          label: this.$t('label.theme2')
        }
      ],
      dashBoards: [
        {
          value: "/files//" + this.$t('files.Workspace'),
          label: this.$t('files.Workspace')
        },
        {
          value: "/files//" + this.$t('files.department'),
          label: this.$t('files.department')
        },
      ]
    }
  },
  components:{
    SelectUserGroupDialog,
    UserGroup
  },
  computed: {
    ...mapState(['user']),
    volume() {
        return this.$Utils.volumeInfo(this.volume_info)
    },
    showPW(){
        return  this.type==Constants.ADMINMENU.CREATE || this.state
    },
    showBtn(){
        return  this.type!=Constants.ADMINMENU.CREATE
    },
    showAdmin () {
      return this.user.isAdmin
    },
    showIndividualInfo(){
      console.log(this.rules);
      return Utils.featuresDefault('profile.individual.info',true)
    },
    showProfileImg(){
      return Utils.featuresDefault('profile.image.info',false)
    }
  },
  mounted(){
    this.init()
  },
  methods: {
    init(){
      //console.log(this.info.features.security.key);
      this.ruleForm.userName=this.userName_prop
      this.userImgSrc=`${store.state.baseURL}/json/getProfile?userId=`+this.userName_prop+"&date=" +new Date()+Math.random();
      this.userImgSaveApi=`${store.state.baseURL}/json/saveProfile?userId=`+this.userName_prop
      this.userImgGetProfile(this.userName_prop);

      this.HomeUrlListSetting();

      if(this.type!=Constants.ADMINMENU.CREATE){
        api.getUser(this.ruleForm.userName).then(data =>{
            this.ruleForm.name=data.user.name
            this.ruleForm.email=data.user.email
            this.ruleForm.address=data.user.address
            this.active=data.user.enabled
            for(var i=0;i<data.user.groups.length;i++){
              if(data.user.groups[i].type=='0'){
                this.ruleForm.groupIdArr.push({id:data.user.groups[i].id,description:data.user.groups[i].description});
              }
            }
            this.volume_info=data.volume_info
            this.welcome=data.user.welcome
            this.theme=data.user.theme
        })
      }
    },
    HomeUrlListSetting(){
      let dashboardView= Utils.featuresDefault('dashboardview',false)
    },
    isUserImgExist(div){
      if(div){
        this.showViewImg=true;
        this.initsetImg=true;
        this.userImgSrc=`${store.state.baseURL}/json/getProfile?userId=`+this.userName_prop+"&date=" +new Date()+Math.random()+"&cache=";
        //console.log("이미지 있음");
      }else{
         this.showViewImg=false;
         this.initsetImg=false;
        //console.log("이미지 없음");
      }
      this.imgloading=false;
    },
    userImgGetProfile(userId) {
      this.imgloading=true;
      //console.log('이미지 로드?');
      let info=api.getProfile(userId).then(data =>{
           //console.log("이미지 있음 성공");
           this.isUserImgExist(true)
           this.imgloading=false
      }).catch((error => {
          //console.log("이미지 없음 실패");
           this.isUserImgExist(false)
           this.imgloading=false
      }));
    },
    close() {
      this.dialogVisible=false;
      this.$store.commit('closeHovers')
      if(this.type==constants.ADMINMENU.PROFILE){
        Event.fire(EventList.PROFILE_CHANGE,this.showViewImg)
      }
    },
    changeWidth(){
      if(this.type==Constants.ADMINMENU.CREATE){
         return 'userinfo-box width100'
      }else if(!this.showProfileImg){
         return 'userinfo-box width100'
      }else{
         return 'userinfo-box'
      }
    },
    createAndClose: function (event) {

      this.$refs['ruleForm'].validate((valid) => {
          if (valid) {
            this.data = {
              userName : Utils.blankValue(this.ruleForm.userName),
              name: Utils.blankValue(this.ruleForm.name),
              password: this.ruleForm.password,
              desc: 'desc',
              email: Utils.blankValue(this.ruleForm.email),
              address: Utils.blankValue(this.ruleForm.address),
              enabled: this.active,
              welcome: this.welcome,
              theme: this.theme,
              mode:'create',
              groupIds: this.ruleForm.groupIdArr
            }
            this.$close(this.data)
          } else {
            console.log('error submit!!');
            return false;
          }
      });
      if(this.type==constants.ADMINMENU.PROFILE){
        Event.fire(EventList.PROFILE_CHANGE,this.showViewImg)
      }
    },
    editAndClose() {
      if (this.ruleForm.checkPass == '') {
          this.ruleForm.password='';
      }
      this.$refs['ruleForm'].validate((valid) => {
          console.log(valid);
          console.log(this.ruleForm);
          if (valid) {
            this.data = {
              userName : Utils.blankValue(this.ruleForm.userName),
              name: Utils.blankValue(this.ruleForm.name),
              password: this.ruleForm.password,
              desc: 'desc',
              email: Utils.blankValue(this.ruleForm.email),
              address: Utils.blankValue(this.ruleForm.address),
              enabled: this.active,
              welcome: this.welcome,
              theme: this.theme,
              mode:'eidt',
              groupIds : this.ruleForm.groupIdArr
            }
            this.$close(this.data)
          } else {
            console.log('error submit!!');
            return false;
          }
      });
      if(this.type==constants.ADMINMENU.PROFILE){
        Event.fire(EventList.PROFILE_CHANGE,this.showViewImg)
      }
      vue.$store.commit('setNewUserName', this.ruleForm.name)
    },
    passwordView(){
      if(this.state){
        this.state=false;
      }else{
        this.state=true;
      }
    },
    async searchGroup(){
        console.log('search Click');
        let params = {
          type: constants.VIEW_TYPES.SEL_GROUP,
          title: this.$t('adminMenu.user_selgroup'),
          width: '80%',
          containerHeight: '600px',
          gridSelectable: constants.SELECTABLE.MULTIPLE,
          isAdmin: false
        }
        const result = await userGroupDialog(params);
        if(result){
          for(var i=0;i<result.length;i++){
            this.ruleForm.groupIdArr.push({id:result[i].id,description:result[i].description,idx:i});
          }
        }
        this.$refs['ruleForm'].validate((valid) => {
          if (valid) {
          } else {
            console.log('error submit!!');
            return false;
          }
        });
    },
    async setVolume(){
      const result = await volumeDialog({
                        title: this.$t('adminMenu.user_setMaxVolume'), width: '30%', containerHeight: '400px',
                        target_prop: '', targetId_prop: this.volume_info.volumeId, target_vol_prop: this.volume.max
      });
      if(result){
         console.log(result);
         api.settingVolume(result.volumeId,result.maxSize)
         .then(data => { this.requestCompleted(true);})
         .catch((error) => {console.log(error);  })
      }
    },
    removeItem(ev){
      this.ruleForm.groupIdArr.splice(this.ruleForm.groupIdArr.findIndex(e => e.id === ev.id), 1);
    },
    requestCompleted(param) {
      if(param==true){
         api.getUser(this.ruleForm.userName).then(data =>{
           this.volume_info=data.volume_info
           this.$notify({
                title: this.$t('label.success'),
                message: this.$t('messages.completed'), type: 'success'
           })
        })
      }
    },
    deleteProfileImage() {
      api.saveProfile(null,this.ruleForm.userName).then(data => {
        this.userImgGetProfile(this.userName_prop);
      }).catch(error => {
          console.log(error);
      })
    },
    loadImg(e){
      console.log('upload success');
      this.userImgGetProfile(this.userName_prop);
    },
    maxSizeLimit(file){
      //file.size는 Byte단위.
      if(file.size > 307200){
        this.$message.error('Image size can not exceed 300KB!');
        return false;
      }else{
        return true;
      }
    }
  }
}
</script>

<style>
#userDialog .el-input input{
  height: 35px !important;
}
#userDialog .el-form--label-top .el-form-item__label{
  padding: 0 !important;
}
#userDialog .el-form-item{
  margin-bottom: 25px;
}
#userDialog .el-dialog{
  width:100% !important;
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
.userinfo{
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
.groupbox .el-tag{
  margin-bottom: 3px;
}
.search-btn{
  float: right;
  position: relative;
  right: 10px;
  padding: 5px !important;
  top: -3px;
}
.vol-btn{
  float: right;
  position: relative;
  right: 10px;
  padding: 5px !important;
  top: 3px;
}
.idinput{
  margin-left: -5px;
}
#radio_group{
  margin-left: 10px;
  margin-bottom: 5px;
}
.profile-box{
  width: 40%;
  margin: auto;
  float: left;
}
.profile-center{
  width: 200px;
  margin: auto;
  margin-top: 15px;
}
.profile-center .el-upload{
  width: 80px;
}

.userinfo-box{
  width: 60%;
  float: right;
}
.etc-box{
  width: 100%;
  float: left;
}
#userDialog .dialog-footer{
  width: 100%;
  float: left;
}

#profileImg {
  width: 150px;
  height: 150px;
  border-radius: 50%;
}
#initial {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: #8c489f;
  color: rgb(236, 233, 233);
  text-align: center;
  font-weight: 400;
  font-size: 70px;
  display: inline-block;
  line-height: 2;
}
.width100{
  width: 100% !important;
}
span#sizeNotice {
  margin: 2%;
  width: 93%;
  text-align: center;
  float: inherit;
  color: #606266cc;
}
</style>