<template>
<nav id="toolbar-item" class="level k-toolbar k-widget k-toolbar-resizable">
  <div class="level-left">

      <el-button id="portal" size="small"  @click="ecmPortal" v-if="showECMportal">
        <span id="actionMenu"><i class="k-icon k-i-globe-outline"></i>  ECM portal </span>
      </el-button>

      <el-button size="small" class="level-item" v-bind:disabled="!$store.state.isMovableToParent" @click='gotoParentFolder' id='folderUp'>
        <img src='../assets/img/folderUp.png' width="24px" height="24px"/>
      </el-button>
    
      <el-dropdown @command="changeSelectBox" trigger="click" class="level-item" >
          <el-button size="small">
            <span id="changeText"><i class="el-icon-success"></i>  {{$t('label.select')}} <i class="el-icon-arrow-down el-icon--right"></i></span>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <template v-for="item in selectList">
              <el-dropdown-item :command="item"><i :class="item.icon" aria-hidden="true"></i> {{$t(item.text)}}</el-dropdown-item>
            </template>
          </el-dropdown-menu>
      </el-dropdown>

      <el-dropdown @command="showPrompts" trigger="click" class="level-item" >
        <el-button size="small" type="primary" :disabled="!isShowUploadMenu">
        <i class="fa fa-upload" aria-hidden="true"></i> {{$t('buttons.upload')}} <i class="el-icon-arrow-down el-icon--right"></i>
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <template v-for="item in newFileList">
            <el-dropdown-item :command="item.id" ><i :class="item.icon" aria-hidden="true"></i> {{$t(item.text)}}</el-dropdown-item>
          </template>
        </el-dropdown-menu>
      </el-dropdown>

      <el-button id="toolbar-menu" size="small"  @click="actionMenu">
        <span id="actionMenu"><i class="el-icon-menu"></i>  {{$t('label.actionMenu')}} <i class="el-icon-arrow-down el-icon--right"></i></span>
      </el-button>


      <el-button id="portal" size="small"  @click="ecmWebDAV" v-if="showECMportal">
        <span id="actionMenu"><i class="k-icon k-i-folder"></i>  {{$t('label.windowOpen')}} </span>
      </el-button>

      <form name="frmPopup">
        <input type="hidden" name='arg1'>
      </form>

     

  </div>



  <div class="level-right">
    <el-dropdown @command="changeView" trigger="click" v-if="showMenu" class="level-item">
      <el-button size="small">
        <i :class="viewSelection.icon" aria-hidden="true"></i> {{$t(viewSelection.text)}} <i class="el-icon-arrow-down el-icon--right"></i>
      </el-button>
      <el-dropdown-menu slot="dropdown">
        <template v-for="item in viewList">
          <el-dropdown-item :command="item.id"><i :class="item.icon" aria-hidden="true"></i> {{$t(item.text)}}</el-dropdown-item>
        </template>
      </el-dropdown-menu>
    </el-dropdown>
    <el-dropdown @command="changeSortTarget" trigger="click"  v-if="showListMenu" class="level-item">
      <el-button size="small">
      <i class="fa fa-sort" aria-hidden="true"></i> {{$t(sortSelection.text)}} <i class="el-icon-arrow-down el-icon--right"></i>
      </el-button>
      <el-dropdown-menu slot="dropdown">
        <template v-for="item in sortTargetList">
          <el-dropdown-item :command="item.id">{{$t(item.text)}}</el-dropdown-item>
        </template>
      </el-dropdown-menu>
    </el-dropdown>
    <el-dropdown @command="changeSort" trigger="click"  v-if="showListMenu" class="level-item">
      <el-button size="small">
      <i :class="orderbySelection.icon" aria-hidden="true"></i> {{$t(orderbySelection.text)}} <i class="el-icon-arrow-down el-icon--right"></i>
      </el-button>
      <el-dropdown-menu slot="dropdown">
        <template v-for="item in sortList">
          <el-dropdown-item :command="item.id"><i :class="item.icon" aria-hidden="true"></i> {{$t(item.text)}}</el-dropdown-item>
        </template>
      </el-dropdown-menu>
    </el-dropdown>
    <el-button size="small" class="level-item" @click="refreshPage">
         <i class="el-icon-refresh"></i>
    </el-button>
  </div>
</nav>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import constants from '../Constants';
import * as api from "@/utils/api";
import * as actions from "@/utils/actions";

export default {
  name: 'listtoolbar',
  props: ['dataSource'],

  data: function() {
    return {
      viewSelection:{icon:"",text:""},
      sortSelection:{icon:"",text:""},
      orderbySelection:{icon:"",text:""},
      viewList: constants.FILES_VIEW_LIST,
      newFileList: [
        {id: constants.ACTIONS.NEWFILE, text: 'prompts.newfile', icon: 'fa fa-upload',disabled:false},
        {id: constants.ACTIONS.NEWDIR, text: 'prompts.newDir', icon: 'edm icon_new_newfolder',disabled:false},
        {id: constants.ACTIONS.MAKEFILE, text: 'prompts.makenewfile', icon: 'edm icon_new_addfile',disabled:false},
      ],
      selectList: [
        {id: 'none', text: 'label.sel_none',icon:'fa fa-square-o'},
        {id: 'all', text: 'label.sel_all',icon:'fa fa-check-square-o'}
      ],
      actionMenuList: [
         {id: 'none', text: 'label.sel_none',icon:'fa fa-square-o'},
         {id: 'all', text: 'label.sel_all',icon:'fa fa-check-square-o'},
         {id: 'folder', text: 'label.sel_folder',icon:'fa fa-folder'},
         {id: 'file', text: 'label.sel_file',icon:'fa fa-file-text'}
      ],
      sortList: [
        {id: 'asc', text: '',icon:'fa fa-sort-amount-asc'},
        {id: 'desc', text: '',icon:'fa fa-sort-amount-desc'}
      ],
      sortTargetList: [
        {id: 'name', text: 'label.name'},
        {id: 'size', text: 'files.size' },
        {id: 'modifier', text: 'files.modifier' },
        {id: 'createUserId', text: 'label.owner' },
        {id: 'creationDate', text: 'label.creation_date' },
        {id: 'lastModified', text: 'label.lastmodified' }
      ],
      isShowUploadMenu:false,
      showMenu: true,
    }
  },
  components : {

  },
  computed: {
    ...mapState(['viewOption','currentDir','currentDirInfo','rootId','user']),
    viewIconString() {
      // let viewOption = this.$store.state.viewOption
      var obj = this.viewList.find((obj) => { return obj.id === this.viewOption.view; });
      return obj.icon
    },
    showSELECTBOX(){
      return this.$Utils.featuresDefault('listselectboxHeader',false)
    },
    showListMenu(){
      return this.viewSelection.id!="table"
    },
    showECMportal(){
      let dealimECMportal=this.$Utils.featuresDefault('dealim.ecmportal',false)
      if(dealimECMportal!=false){
        if(this.user.isOutsideSubnet){
          return false
        }else{
          return true
        }    
      }else{
        return false
      }
      
    }
  },
  watch:{
    currentDirInfo:function(){
      if(!this.$Constants.FEATURES_TOOLBAR_ACTIONS(this.rootId)){
        this.isShowUploadMenu=false;
        return;
      }
      this.checkPermission();
    },
    'viewOption.view'(val, oldValue) {
      console.log('viewOption.view watching: ' +val)
      if (oldValue != val) {
        this.viewSelection=this.viewList[this.getIdx(this.viewList,val)];
      }
    },
    'viewOption.orderBy'(val, oldValue) {
      console.log('viewOption.orderBy watching: ' +val)
      if (oldValue != val) {
        this.sortSelection=this.sortTargetList[this.getIdx(this.sortTargetList,val)];
      }
    },
    'viewOption.dir'(val, oldValue) {
      console.log('viewOption.dir watching: ' +val)
      if (oldValue != val) {
        this.orderbySelection=this.sortList[this.getIdx(this.sortList,val)];
      }
    }
  },
  methods: {
    ...mapMutations(['setSearchViewOption','setViewOption','setViewOrderBy','setViewTarget']),
    getIdx(arr,id){
      for(var i=0;i<arr.length;i++){
        if(arr[i].id==id) return i;
      }
      return 0;
    },
    showPrompts(id){
      this.$store.commit('showHover',id);
    },
    changeSort(method){
      var idx=this.getIdx(this.sortList,method);
      this.orderbySelection=this.sortList[idx];
      this.setViewOrderBy(method)
      Event.fire(EventList.RELOAD_LIST)
    },
    changeSortTarget(target){
      var idx=this.getIdx(this.sortTargetList,target);
      this.sortSelection=this.sortTargetList[idx];
      this.setViewTarget(target)
      Event.fire(EventList.RELOAD_LIST)
    },
    changeView(option) {
      var idx=this.getIdx(this.viewList,option);
      this.viewSelection=this.viewList[idx];
      this.setViewOption(option)
      this.$Utils.unselectedbox();
    },
    setChangeView(){
      this.viewSelection={
        icon: "fa fa-info-circle",
        id: "detailsearch",
        text: "buttons.detailView"
      }
      this.setSearchViewOption('detailsearch')
      Event.fire(EventList.RELOAD_LIST)
    },
    changeSelectBox(e){
      console.log(this.viewOption.view);
      if(this.viewOption.view == 'table' ||this.viewOption.view == 'grid'){
        if(e.id=='all'){
          Event.fire(EventList.GRID_SELECT_ALL);
        }
        else if(e.id=='none'){
          Event.fire(EventList.GRID_DESELECT_ALL);
        }
      }
      else{
        if(e.id=='all'){
          this.$Utils.allcheckbox(true,this.viewSelection);
        }
        else if(e.id=='none'){
          this.$Utils.allcheckbox(false,this.viewSelection);
        }
      }
    },
    checkPermission(){
      if (!this.currentDirInfo){
        this.isShowUploadMenu=false;
        return;
      }
      var permissionList=this.currentDirInfo.permissions || [];
      if(permissionList.includes("ADD")){ //IE에서 작동확인 필요
        /*var cnt=this.newFileList.length;
        for(var i=0;i<cnt;i++){
          this.newFileList[i].disabled=false;
        }*/
        this.isShowUploadMenu=true;
      }
      else{
        this.isShowUploadMenu=false;
        /*var cnt=this.newFileList.length;
        for(var i=0;i<cnt;i++){
          this.newFileList[i].disabled=true;
        }*/
      }
    },
    externalToolbar(e){
      this.showMenu=false;
      this.setChangeView();
    },
    changeViewOptions() {
        var idx=this.getIdx(this.viewList,this.viewOption.view);
        this.viewSelection=this.viewList[idx];
        idx=this.getIdx(this.sortTargetList,this.viewOption.dir);
        this.sortSelection=this.sortTargetList[idx];
        idx=this.getIdx(this.sortList,this.viewOption.orderby);
        this.orderbySelection=this.sortList[idx];
        if(this.$Utils.featuresDefault('scanning',false)){
          this.newFileList.push({id: constants.ACTIONS.SCAN, text: 'prompts.scan', icon: 'fa fa-clipboard',disabled:false})
        }
         if(this.$Utils.featuresDefault('multiple.file.upload',false)){
          this.newFileList.push({id: constants.ACTIONS.MULTIUPLOAD, text: 'prompts.multipleUpload', icon: 'fa fa-clipboard',disabled:false})
        }
    },
    actionMenu(ev){
      ev.preventDefault();
      console.log(ev);
      this.$emit('openActions', {event: ev, from:constants.ATTRIBUTE.NONE})
      // Event.fire(EventList.OPEN_CONTEXT, {event: ev,from:constants.ATTRIBUTE.NONE,menu: true})
    },
    gotoParentFolder() {
      Event.fire(EventList.GOTO_PARENT)
    },
    refreshPage(){
      if(this.$store.state.viewOption.view == "table") {
        Event.fire(EventList.TABLE_REFRESH)
      }else {
        Event.fire(EventList.RELOAD_DIR)
      }      
    },
    ecmPortal(){
      let dealimECMportal=this.$Utils.featuresDefault('dealim.ecmportal',false)
      window.open(dealimECMportal);
    },
    ecmWebDAV(){
      var frmPop = document.frmPopup;
      let locationURL="https://"+location.host+"/xedrm";
      let webDAV_URL=`${locationURL}/webclient/webDAV.jsp`;
      window.open('','popupView');

      frmPop.action = webDAV_URL;
      frmPop.target = 'popupView';
      frmPop.arg1.value = this.$route.fullPath;
      frmPop.submit();
    }
  },
  mounted(){
      this.changeViewOptions();
      Event.off(EventList.CUSTOM_TOOLBAR);
      Event.listen(EventList.CUSTOM_TOOLBAR, this.externalToolbar);
  }
}
</script>
<style scoped>
#toolbar-item {
  background-color: #f5f5f5;
}

.level:not(:last-child) {
    margin-bottom: 0rem;
}
#folderUp{
  padding : 3px 9px !important;
}
</style>
