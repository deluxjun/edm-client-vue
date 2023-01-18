<template>
<div v-if="!isLoading" :style="{'max-height': containerHeight}" class="property" >
<el-collapse id="property_dialog" v-model="activePanels">
  <el-collapse-item :title="$t('label.general')" name="1">

    <basic-property :model="model" :permissions="permissions" :multiple="multiple" :elementIds="elementIds" :argElements="argElements"></basic-property>

    <el-form :model="model" ref="form" label-width="150px" v-if='PropertiesMenuEnable()'>
      <div class="el-collapse-item-div">
        <span class="el-collapse-item-title">{{ $t('label.extensions') }} </span>
      </div>
      <!-- categories -->
      <el-form-item v-if="setVisible('category')" :label="$t('label.categories')" > <!-- category -->
        <div v-if="multiple">
          <div v-if="multiple&&tempCategories.length==0" class="text-block">
               {{ $t("label.multi_category")}}
          </div>
          <el-tag v-for="cate in tempCategories" :key="cate.eclassId" :closable="true" :disable-transitions="false" @close="requestRemoveCategory(cate)">
             {{cate.eclassId}}({{cate.description}})
          </el-tag>
          <el-button v-if="permissions.edit" class="button-new-tag" size="small" @click="showCategory()">{{ $t('buttons.edit') }} </el-button>
        </div>
        <div v-if="!multiple">
          <el-tag v-for="cate in model.categories" :key="cate.eclassId" :closable="permissions.edit" :disable-transitions="false" @close="requestRemoveCategory(cate)" :v-if="!multiple">
          {{cate.eclassId}}({{cate.description}})
          </el-tag>
          <el-button v-if="!multiple&&permissions.edit" class="button-new-tag" size="small" @click="showCategory()">{{ $t('buttons.edit') }} </el-button>
        </div>
        <!--  -->
      </el-form-item>

      <!-- tags -->
      <el-form-item v-if="!multiple&&setVisible('tag')" :label="$t('label.tags')" @submit.native.prevent> <!-- tag -->
        <el-tag :key="tag.eclassId" v-for="tag in model.tags" :closable="permissions.edit" :disable-transitions="false" @close="handleTagClose(tag)">
          {{tag.description}}
        </el-tag>
        <el-input class="input-new-tag" v-if="tagInputVisible" v-model="model.newTagValue" ref="saveTagInput" size="mini"
          @keyup.native.enter="addTag" @blur="addTag" @submit.native.prevent>
        </el-input>
        <el-button v-else-if="!tagInputVisible && permissions.edit" class="button-new-tag" size="small" @click="showTagInput">{{ $t('buttons.new') }} </el-button>
      </el-form-item>

      <!-- links -->
      <el-form-item v-if="!multiple&&setVisible('link')" :label="$t('label.links')" > <!-- links -->
        <el-tag type="info" :key="link.namePath" v-for="link in links" :closable="permissions.edit" :disable-transitions="false" @close="requestRemoveLink(link)">
          <i :class="['grid-icon', contentIcon(link.data)]"></i>
          <span class="link-path" @click="gotoLink(link.namePath)">{{link.namePath}}</span>
        </el-tag>
        <el-button v-if="permissions.edit" class="button-new-tag" size="small" @click="showExplorer">{{ $t('buttons.new') }} </el-button>
      </el-form-item>
    </el-form>
  </el-collapse-item>
  <el-collapse-item v-if="!model.isFolder&&!multiple&&extendedPropertiesMenuEnable()" :title="$t('label.extendedProperties')" name="2">
    <el-form :model="extModel" ref="extForm" label-width="150px" style="padding-top: 10px">
      <!-- 확장속성 -->
      <el-form-item :key="attr.name" v-for="(attr, index) in extModel.extAttrs"
        :label="attr.label" :prop="'extAttrs.' + index + '.value'" :rules="getRule(attr)">
        <el-input v-if="isString(attr)" v-model="attr.value" :class="inputClass" :readonly="!permissions.edit"></el-input>
        <el-input v-if="isNumber(attr)" v-model.number="attr.value" :class="inputClass" :readonly="!permissions.edit"></el-input>
        <el-input v-else-if="attr.editor == 2" type="textarea" v-model="attr.value" :class="inputClass" :readonly="!permissions.edit"></el-input>
        <el-date-picker v-else-if="isDate(attr)" v-model="attr.value" type="date"
          :clearable="false" :editable="false" :class="inputClass" :readonly="!permissions.edit">
        </el-date-picker>
        <el-checkbox v-else-if="isBoolean(attr)" v-model="attr.value" :class="inputClass" :disabled="!permissions.edit">&nbsp;</el-checkbox>
        <el-select v-else-if="attr.editor == 1" v-model="attr.value">
          <el-option v-for="item in attr.list"
            :disabled="!permissions.edit"
            :key="item.value" :label="item.description" :value="item.value">
            <span style="float: left">{{ item.description }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">{{ item.value }}</span>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item v-if="permissions.edit">
        <el-button style="float: right;" type="primary" @click="submitExt">{{ $t('buttons.save') }}</el-button>
      </el-form-item>
    </el-form>
  </el-collapse-item>
</el-collapse>
</div>
</template>

<script>
import _ from 'lodash'
import Vue from 'vue'
import url from '@/utils/url'
import * as api from '@/utils/api'
import { mapState, mapActions, mapMutations } from 'vuex'
import Utils from '@/utils/utils'

import SelectCategoryDialog from './SelectCategoryDialog'
import FileFoldersDialog from './FileFoldersDialog'
import { create } from 'vue-modal-dialogs'

import BasicProperty from './BasicProperty'

const categoryDialog = create(SelectCategoryDialog)
const fileFoldersDialog = create(FileFoldersDialog)

import {
  Form,
  FormItem,
  Input,
  Radio,
  Checkbox,
  Select,
  Option,
  Button
} from 'element-ui'

export default {
  name: 'property',
  props: {
    // elementId : {
    //   // default : '2017121310265600',   // test folder
    //   // default : '2017112215385300',   // test file
    //   required : true, // test
    //   type: String
    // },
    elementIds: {
      required: true,
      type: Array
    },
    argElements:{
      type: Array
    },
    containerHeight: String
  },
  data: () => ({
    activePanels: ['1','2'],
    model: null,
    extModel: {},
    extAttrs : [],
    links : [],
    descCssClass : 'label-custom',
    permissions : {
      read : false,
      edit : false,
      owner : false,
      delete : false,
    },
    tagInputVisible: false,
    folderSizeText: '',
    calculatingSize: false,
    isLoading: true,
    elementId:"",
    multiple: false,
    tempCategories: []
  }),
  components: {
    'basic-property': BasicProperty
  },
  computed: {
    ...mapState(['info', 'selected', 'user']),
    inputClass() {
      if (!this.permissions.edit)
        return "label-custom"
      return ""
    },
  },
  methods: {
    ...mapMutations(["setSelected"]),
    gotoLink(path){
      this.$emit('close');
      Utils.jumpToPath(path);
    },
    setVisible(type){
      if(this.info.features[type] == 'false'){
        return false;
      }
      return this.propertyExceptionMenu(type);
    },
    isBoolean(attr) {
      return attr.editor == 0 && attr.type == 6
    },
    isDate(attr){
      return attr.editor == 0 && attr.type == 3
    },
    isString(attr){
      return attr.editor == 0 && attr.type == 0
    },
    isNumber(attr) {
      return attr.editor == 0 && (attr.type == 1 || attr.type == 2)
    },
    contentIcon(data) {
      return Utils.getContentTypeClass(data.r_object_type, data.dos_ext)
    },
    getRule(attr) {
      let rule = []
      let data = {
        required: false
      }
      if (attr.mandatory == 1) {
        data.required = true
        data.message = this.$t('messgaes.required')
        data.trigger = 'blur'
      }
      rule.push(data)

      data = {type: null}

      // type
      // if (attr.type == 3) {
      //   data.type = 'date'
      // }
      if (attr.type == 1 || attr.type == 2) {
        data.type = 'number'
        data.message = this.$t('messages.mustBeNumber')
        data.trigger = 'blur,change'
      }

      if (data.type != null)
        rule.push(data)

      return rule
    },
    submitExt: _.throttle( function () {
      this.$refs.extForm.validate((valid) => {
        if (valid) {
          api.updateExtAttrs(this.elementId, this.extModel.extAttrs).then(data => {
            this.$showSuccess()
          })
        } else {
          this.$showError(this.$t('messages.checkValidation'))
          return false;
        }
      })
    }, 2000),

    //categories

    // tags
    handleTagClose(tag) {
      api.removeTag(this.elementId, tag.eclassId).then(data => {
        this.model.tags.splice(this.model.tags.findIndex(e => e.eclassId === tag.eclassId), 1);
        this.$emit('reload')
      })
    },
    showTagInput() {
      this.tagInputVisible = true;
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    // show categories
    async showCategory() {
      const params = {
          title: this.$t('messages.selectCategory'),
          containerHeight: '500px',
      }
      const result = await categoryDialog(params)
      if (result) {
        let categoryListArr=[];
        let category=this.model.categories
        if(!this.multiple){
          for(var i=0;i<category.length;i++){
            categoryListArr.push(category[i].eclassId.trim());
          }
        }
        if(categoryListArr.indexOf(result.eclassId)== -1){
           if(this.multiple){
              api.addCategoryToElement(this.elementIds.join(","), result.eclassId,this.multiple).then(data => {
                  this.tempCategories.push({eclassId: data.id, description: result.desc});
              })
           }else{
              api.addCategoryToElement(this.elementId, result.eclassId).then(data => {
                  this.model.categories.push({eclassId: data.id, description: result.desc});
              })
           }
        }else{
          this.$notify({
                title: this.$t('label.warning'),
                message: this.$t('messages.overwriteCategory'), type: 'warning'
          })
        }
      }
    },
    // 속성 메뉴 예외 처리
    propertyExceptionMenu(type){
       let defaultAction=",";
       let action = Utils.featuresDefault('propertyExceptionMenu',"")
       let list=action.split(',');
       let returnValue=true
       for(var i=0;i < list.length;i++){
         if(list[i]==type){
            returnValue=false
         }
       }
       return returnValue
    },
    PropertiesMenuEnable(){
      return Utils.featuresDefault('PropertiesEnable',false)
    },
    extendedPropertiesMenuEnable(){
      let enabled= true;
      if(!Utils.featuresDefault('extendedPropertiesEnable',true)){
        enabled=Utils.featuresDefault('extendedPropertiesEnable',false)
      }
      return enabled
    },
    // show 탐색
    async showExplorer() {
      const params = {
          title: this.$t('messages.selectFiles'),
          width: '70%',
          containerHeight: '600px',
      }
      let selectedElement = this.selected;
      let result = await fileFoldersDialog(params)
      console.log("---->LINK");
      result = this.selected;
      if (result && result.length > 0) {
        var ids="";
        for(var i=0; i<result.length; i++){
            ids+=result[i].r_object_id;
            ids+=',';
        }

        api.addLink(this.elementId, ids).then(data => {
          let relations = data.list
          relations.forEach(element => {
            let found = this.links.find(l => {
              return element.namePath == l.namePath
            })
            if (found == undefined)
              this.links.push(element)
          })
        })
        store.commit('setSelected', selectedElement);
      }
    },
    requestRemoveLink(link) {
      api.removeLink(this.elementId, link.data.r_object_id, link.linkFrom).then(data => {
        this.links.splice(this.links.findIndex(e=>e.namePath ===link.namePath), 1);
      })
    },
    requestRemoveCategory(category) {
      if(this.multiple){
         api.removeCategoryFromElement(this.elementIds.join(","), category.eclassId,this.multiple).then(data => {
            this.tempCategories.splice(this.tempCategories.findIndex(e=>e === category.eclassId), 1);
        });
      }else{
         api.removeCategoryFromElement(this.elementId, category.eclassId).then(data => {
            this.model.categories.splice(this.model.categories.findIndex(e=>e.eclassId === category.eclassId), 1);
        });
      }
    },
    addTag() {
        let inputValue = this.model.newTagValue;
        if (inputValue) {
          console.log(this.model.tags)
          for(let i=0; i < this.model.tags.length; i++){
            if(this.model.tags[i].description == inputValue){
              this.$notify({
                title: this.$t('label.warning'),
                message: this.$t('messages.overwriteTag'), type: 'warning'
              })
              this.tagInputVisible = false;
              this.model.newTagValue = '';
              return;
            }
          }
          api.addTag(this.elementId, inputValue).then(data => {
            this.model.tags.push({eclassId: data.id, description: inputValue});
            this.$emit('reload')
          }).catch(err=>{
            console.log(err)
          });
        }
        this.tagInputVisible = false;
        this.model.newTagValue = '';
    },

    getElement(event){
      return api.getElement(event).then(data => {
        
        this.model = data.list[0]
        console.log(this.model);
        this.model.isFolder = false
        let removeEl = [];
        this.permissions.owner = this.model.owner_id === this.user.userId
        this.model.oldDesc = this.model.description
        this.model.oldDocType = this.model.docTypeName
        this.model.oldExpired = this.model.expired
        this.extModel.extAttrs = this.model.attrList.filter(e => e.name.startsWith('ext:'))
        this.extModel.extAttrs.forEach(element => {
          // set list values
          if (element.editor == 1) {
            let list = []
            for (let index = 0; index < element.values.length; index++) {
              list.push({value: element.values[index], description: element.description[index]})
            }
            element.list = list
          }
        });
        if(this.model.r_object_type == "dm_folder"){
          this.model.isFolder = true
        } else {
          this.model.isFolder = false
        }
        this.$emit('loaded')
        this.isLoading = false
      })
      .catch(err=>{
        this.$showError(err)
        this.$emit('loaded')
        console.log(err)
      });
    },
    multipleElement(){
      this.model={
        object_name : this.$t('prompts.multipleProperty'),
        description : this.$t('prompts.multipleDescription', {title: this.argElements[0].object_name,count: this.argElements.length}),
        isFolder: true
      }
      this.$emit('loaded')
      this.isLoading = false
    },
    setPermissions() {
      api.getMenu(this.elementId).then(all => {
        console.log(all);
        this.permissions.read = all.propertyDoc === 'Y'
        this.permissions.edit = all.propertyDocEdit === 'Y'
        this.permissions.delete = all.deleteDoc === 'Y'
      })
      .catch(err => {
        this.$showError(err)
        console.log(err)
      })
    }
  },

  created() {
    if(this.elementIds.length==1){
        this.elementId=this.elementIds[0];
        this.getElement(this.elementId);
        this.setPermissions();

        // loadLink
        api.getLinks(this.elementId).then(data => {
          this.links = data.list
          if (process.env.NODE_ENV === 'development') {
            this.links.forEach(element => {
              console.log(element.namePath)
            })
          }
        })
    }else{
      this.multiple=true;
      //일반 세팅
      //this.model.isFolder = false
      this.multipleElement();
      //권한은 읽기로 강제 세팅
      this.permissions.read="Y"
      this.permissions.edit="Y"
    }
  }
}
</script>
<style>
.property {
  /* overflow-y: auto;
  overflow-x: hidden; */
  padding: 0px 20px;
}

.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px !important;
  margin-left: 10px;
  vertical-align: bottom;
}
.link-path:hover{
  text-decoration: underline;
}
#property_dialog{
  overflow: auto;
  max-height: 600px;
}
</style>
