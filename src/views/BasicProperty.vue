<template>
  <div v-if="model && permissions.read" class="basicProperty" >

    <el-form :model="model" ref="form" :label-position="labelPosition" label-width="150px">
      <el-form-item v-if="$Utils.featuresDefault('rating',false) && !model.isFolder" :label="$t('viewer.rate')" prop="rate">
        <el-rate v-model="rateAvg" disabled show-score text-color="#ff9900"></el-rate>
        <el-rate v-if="permissions.edit" style="margin-left: 20px;" v-model="rateValue" :colors="['#99A9BF']" @change="doRate"></el-rate>
      </el-form-item>

      <el-form-item :label="$t('label.name')" prop="object_name">
        <el-input :value="model.object_name" class="label-custom" readonly></el-input>
      </el-form-item>


      <el-form-item :label="$t('label.description')" >
        <el-input :class="descCssClass" type="textarea" v-model="model.description"
          @click.native="requestEditDesc"
          @blur="saveDesc" :readonly="!permissions.edit"
          :placeholder="$t('messages.inputDesc')" ></el-input>
      </el-form-item>

      <el-form-item v-if="!model.isFolder&& showDocType" :label="$t('label.docType')"> <!-- doc type -->
        <el-select v-model="model.docTypeName" placeholder="Select" @change="saveDocType">
          <el-option v-for="item in docTypes"
            :disabled="!permissions.edit"
            :key="item.id" :label="item.description" :value="item.id">
            <span style="float: left">{{ item.id }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">{{ item.description }}</span>
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item v-show="model.isFolder && model.volume_info && !multiple" :label="$t('label.volume')" prop="size"> <!-- volume size -->
        <el-input class="label-custom" :value="volume.text" readonly>
        </el-input>
        <el-progress :text-inside="true" :stroke-width="18" :percentage="volume.percentage" :color="volume.color"></el-progress>
      </el-form-item>


      <el-form-item v-show="!model.isFolder" :label="$t('files.size')"> <!-- file size -->
        <el-input class="label-custom" :value="fileSize" readonly></el-input>
      </el-form-item>
      <el-form-item v-if="model.isFolder" :label="$t('files.size')"> <!-- folder file size -->
        <el-button type="info" icon="el-icon-circle-check-outline" @click="calcSize" size="small" round>{{ $t('buttons.analyze') }}</el-button>
        <el-input v-if="folderSizeText" class="label-custom" :value="folderSizeText" v-loading="calculatingSize" element-loading-spinner="el-icon-loading" readonly>
        </el-input>
      </el-form-item> <!-- Version-->
       <el-form-item v-if="!model.isFolder" :label="$t('prompts.version')" prop="version">
        <el-input :value="model['doc:Version']" class="label-custom" readonly></el-input>
      </el-form-item>

      <el-form-item :label="$t('label.created')" v-if="!multiple">
        <el-input :value="created" class="label-custom" readonly>
          <template slot="prepend">{{ creator }}</template>
        </el-input>
      </el-form-item>
      <!-- <el-form-item :label="$t('label.create_userid')" >
        <el-input :value="model.producer_name" class="label-custom" readonly></el-input>
      </el-form-item> -->
      <el-form-item :label="$t('label.modified')" v-if="!multiple">
        <el-input :value="modified" class="label-custom" readonly>
          <template slot="prepend">{{ modifier }}</template>
        </el-input>
      </el-form-item>
      <!-- <el-form-item :label="$t('files.modifier')" >
        <el-input :value="model.modifier_name" class="label-custom" readonly></el-input>
      </el-form-item> -->
      <el-form-item :label="$t('label.owner')" v-if="!multiple && showOwner">
        <el-input :value="owner" class="label-custom" @click.native="requestChangeOwner" readonly>
          <i v-if="permissions.owner" class="el-icon-edit el-input__icon" slot="prefix"></i>
          <i v-else-if="this.user.isAdmin" class="el-icon-edit el-input__icon" slot="prefix"></i>
        </el-input>
      </el-form-item>

      <el-form-item :label="$t('label.location')" v-if="!multiple">
          {{path}}
      </el-form-item>

      <el-form-item v-if="!model.isFolder && showExpired" :label="$t('label.expiryDate')" > <!-- expired -->
        <!-- <el-input :value="expired" class="label-custom" readonly></el-input> -->
        <span v-if="model.permanence">{{$t('label.permanence')}}</span>
        <span v-else>
        <el-date-picker v-if="(permissions.edit && permissions.delete)" v-model="model.expired" type="date"
          :clearable="false" :editable="false"
          :disabled="true"
          :default-value="model.expired" @change="changeRetention" format="yyyy-MM-dd" value-format="yyyy-MM-dd">
        </el-date-picker>
        </span>
      </el-form-item>
      <el-form-item v-if="model.isFolder && showExpired && !multiple" :label="$t('label.expiryDate')" > <!-- expired -->
        <span>{{ folderRetention}}</span>
      </el-form-item>
      <el-form-item :label="$t('prompts.urlshare')" v-if="showURLShare">
         <el-button size="mini" @click="URLshareCopy">{{ $t('prompts.urlshare') }}</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import * as api from '@/utils/api'
import { mapState, mapActions } from 'vuex'
import Constants from '../Constants'
import SelectUserGroupDialog from '@/views/SelectUserGroupDialog'
import ShareDialog from '@/views/security/URLShareDialog'
import { create } from 'vue-modal-dialogs'
const userDialog = create(SelectUserGroupDialog)
const shareDialog = create(ShareDialog)

export default {
  name: 'basic-property',
  props: {
    model : {
      required : true,
      type: Object
    },
    permissions : {
      required : true,
      type: Object
    },
    labelPosition : {
      default: 'left'
    },
    multiple :{
      default: false,
      type : Boolean
    },
    elementIds:{
      type: Array
    },
    argElements:{
      type: Array
    },
  },
  data () {
    return {
      descCssClass : 'label-custom',
      elementId: null,
      rateAvg:0,
      rateValue:0,
      folderSizeText: '',
      idPath:'',
      filetype:'',
      filename:'',
      folderRetention:'',
    }
  },
  computed: {
    ...mapState(['info', 'selected', 'user', 'docTypes']),
    fileSize() {
      return Utils.filesize(this.model['p:size'])
    },
    volume() {
      return this.$Utils.volumeInfo(this.model.volume_info)
    },
    created() {
      return `${this.model.r_creation_date}`
    },
    creator() {
      return Utils.getIdName(this.model.producer, this.model.producer_name)
    },
    modified() {
      return `${this.model.r_modify_date}`
    },
    modifier() {
      return Utils.getIdName(this.model.modifier, this.model.modifier_name)
    },
    path(){
      return this.model.path || ""
    },
    owner() {
      return Utils.getIdName(this.model.owner_id, this.model.owner_name)
    },
    expired() {
      return Utils.moment(this.model.expired).fromNow()
    },
    showOwner(){
      return Utils.featuresDefault('showOwner', true)
    },
    showExpired(){
      return Utils.featuresDefault('showExpiredProperty',false)
    },
    showURLShare(){
      return Utils.featuresDefault('property.urlshare',false)
    },
    showDocType(){
      return Utils.featuresDefault('showDocType',false)
    },
    inputClass() {
      if (!this.permissions.edit)
        return "label-custom"
      return ""
    },
  },
  created() {
    // load doctype
    this.loadDocTypes()
    this.elementId = this.model.r_object_id
    this.rateAvg=parseFloat(this.model.rating || 0);
    console.log(this.model);
    if(this.model.isFolder){
      this.idPath=this.model.path;
    }else{
      this.idPath=this.model.path+this.model.object_name;
    }
  },
  mounted() {
    if(this.model.isFolder && this.showExpired && !this.multiple){
      let setElementIds=this.elementId;
      if(this.multiple){
        setElementIds=this.elementIds.join(",")
      }
      api.getRuleSet(setElementIds).then(data => {
        console.log(data);
        let setData=data.ruleset[0].rules
        console.log(setData);
        if(setData){
          for(var i=0; i<setData.length; i++){
            if(setData[i].title.indexOf('##Retention##')!=-1){
              if(setData[i].actions){
                let year=setData[i].actions[0].parameterValues['retention-year'];
                let month=setData[i].actions[0].parameterValues['retention-month'];
               
                this.folderRetention= this.$t("prompts.folderRetention",{year:year,month:month});
              }
            }
          }
        }
      }).catch(e => {
        console.log(e);
      })
    }
  },
  methods: {
    ...mapActions(['loadDocTypes']),
    doRate:function(){
          let successMessage=this.$t('success.complete')
          api.addRate(this.elementId,this.rateValue).then(data=>{
            this.rateAvg = data.rating[0]
          })
    },

    //calc folder size
    calcSize() {
      this.calculatingSize = true
      let setElementIds=this.elementId;
      if(this.multiple){
        setElementIds=this.elementIds.join(",")
      }
      let folder=0;
      let doc=0;
      console.log(this.argElements.length);
      if(this.argElements.length>1){
        for(var i=0;i<this.argElements.length;i++){
          if(this.argElements[i].r_object_type=="dm_folder"){
            folder++;
          }
        }
      }
      api.analyzeFolder(setElementIds).then(data => {
        this.folderSizeText = `${this.$t('files.size')} ${Utils.filesize(data.totalSize)},  ${this.$t('files.folders')} ${parseInt(data.folders)+parseInt(folder)},  ${this.$t('files.files')} ${parseInt(data.files)}`
        this.calculatingSize = false
      })
      .catch(e => {
        this.calculatingSize = false
      })
    },
    requestEditDesc(e) {
      if (!this.permissions.edit)
        return
      this.descCssClass = ''
    },
    saveDesc() {
      this.descCssClass = 'label-custom'
      // save to server
      if (!this.model.description || this.model.description.length < 1 || this.model.description == this.model.oldDesc)
        return
      if (!this.permissions.edit)
        return

      api.saveProperties({docId: this.elementId, description: this.model.description}).then(data => {
        this.model.oldDesc = this.model.description
      })
      .catch(e => {
        this.model.description = this.model.oldDesc;   // 다시 롤백
      })
    },
    saveDocType() {
      if (!this.permissions.edit)
        return

      api.saveProperties({docId: this.elementId, docType: this.model.docTypeName}).then(data => {
        this.model.oldDocType = this.model.docTypeName
      })
      .catch(e => {
        this.model.docTypeName = this.model.oldDocType;   // 다시 롤백
      })
    },
    async requestChangeOwner() {
      if (!this.permissions.owner&&this.user.isAdmin==false){
        return
      }
      console.log('change owner dialog')

      const params = {
          type: Constants.VIEW_TYPES.SEL_USER,
          title: this.$t('messages.selectUser'),
          width: '80%',
          containerHeight: '600px',
          gridSelectable: Constants.SELECTABLE.ROW
      }
      const result = await userDialog(params)
      if (result) {
        api.saveProperties({docId: this.elementId, owner: result[0].id}).then(data => {
          this.model.owner_id = result[0].id
          this.model.owner_name = result[0].name
        })
      }
    },
    changeRetention() {
      console.log('change retention')
      if (!this.permissions.edit || !this.permissions.delete)
        return
      api.saveProperties({docId: this.elementId, retention: this.model.expired}).then(data => {
        this.model.oldExpired = this.model.expired
      })
      .catch(e => {
        this.model.expired = this.model.oldExpired;   // 다시 롤백
      })
    },
    URLshareCopy(){
      let url= `http://newecmap.daelim.co.kr:8001/xedrm/preview_daelim_download.jsp?path=`
      let str=url+this.idPath
      shareDialog({ linkURL: str });
    },
  }
}

</script>
<style>
.basicProperty .el-rate {
  display: inline-block;
}
</style>
