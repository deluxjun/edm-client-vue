<template>
<div id="searchDiv">
 <kendo-dropdownlist id="searchType" v-model.trim="searchType" :data-source="searchDataSource"
  data-text-field='name' :data-value-field="'id'" :template="itemTemplate" :change="typeChange"></kendo-dropdownlist>
 <el-input placeholder="USER ID" :disabled="false" class="searchInput" v-model.trim="userSearch" v-show="showUser"  @focus="assignMember(false)">
    <i class="el-icon-circle-close-outline el-input__icon xicon" slot="suffix" @click="resetSearch('userSearch')"> </i>
 </el-input>
 <el-input placeholder="GROUP ID" :disabled="false" class="searchInput" v-model.trim="groupSearch" v-show="showGroup" @focus="assignMember(true)">
   <i class="el-icon-circle-close-outline el-input__icon xicon" slot="suffix" @click="resetSearch('groupSearch')"> </i>
 </el-input>
 <span v-show="showDoc">
  <kendo-dropdownlist id="docSearch" v-model.trim="docSearch" :data-source="docSearchSource" data-text-field='name' :data-value-field="'id'"></kendo-dropdownlist>
 </span>
 <!-- <el-input placeholder="TYPE" :disabled="false" class="searchInput" v-model.trim="docSearch" v-show="showDoc" @focus="assignDoc"></el-input> -->
 <span v-show="showDateFormat">
  <kendo-dropdownlist id="dateformat" v-model.trim="dateformat" :data-source="dataFormatSource" data-text-field='name' :data-value-field="'id'"></kendo-dropdownlist>
 </span>
 <span v-show="showBox">
  <kendo-dropdownlist id="parentId" v-model.trim="parentId" :data-source="dataBoxSource" data-text-field='name' :data-value-field="'id'"></kendo-dropdownlist>
 </span>
 <el-date-picker
      v-model="datetime"
      type="daterange"
      align="left"
      unlink-panels
      size="small"
      range-separator="||"
      :start-placeholder="$t('adminMenu.history_start')"
      :end-placeholder="$t('adminMenu.hisoty_end')"
      :picker-options="pickerOptions2" v-show="showDate">
  </el-date-picker>

  <el-button type="primary" size="small" @click="searchEvent">
              <i class="el-icon-search"></i> {{$t('buttons.search')}}
  </el-button>
  <div v-show="showUser">
    <el-table v-loading="loading" :data="searchLists" style="width: 100%" class="search-table" :height="containerHeight">
          <el-table-column  :label="$t('Statistic.ID')" prop="userId"  width="150px">
          </el-table-column>
          <el-table-column  :label="$t('Statistic.userName')" prop="userName" width="150px">
          </el-table-column>
          <el-table-column  :label="$t('Statistic.groupName')" prop="groupName">
          </el-table-column>
          <el-table-column  :label="$t('Statistic.add')" prop="createCount" width="80px">
          </el-table-column>
          <el-table-column  :label="$t('Statistic.click')" prop="downloadCount" width="80px">
          </el-table-column>
            <el-table-column  :label="$t('Statistic.modify')" prop="checkinCount" width="80px">
          </el-table-column>
            <el-table-column  :label="$t('Statistic.delete')" prop="deleteCount" width="80px">
          </el-table-column>
      </el-table>
    </div>
    <div v-show="showonlyGroup">
      <el-table v-loading="loading" :data="searchLists" style="width: 100%" class="security-table" :height="containerHeight" >
          <el-table-column  :label="$t('Statistic.ID')" prop="groupId"  width="150px">
          </el-table-column>
          <el-table-column  :label="$t('Statistic.groupName')" prop="groupName">
          </el-table-column>
          <el-table-column  :label="$t('Statistic.add')" prop="createCount" width="80px">
          </el-table-column>
          <el-table-column  :label="$t('Statistic.click')" prop="downloadCount" width="80px">
          </el-table-column>
            <el-table-column  :label="$t('Statistic.modify')" prop="checkinCount" width="80px">
          </el-table-column>
            <el-table-column  :label="$t('Statistic.delete')" prop="deleteCount" width="80px">
          </el-table-column>
      </el-table>
    </div>
    <div v-show="showDoc">
      <el-table v-loading="loading" :data="searchLists" style="width: 100%" class="security-table" :height="containerHeight" >
          <el-table-column  :label="$t('Statistic.ID')" prop="eclassId" >
          </el-table-column>
          <el-table-column  :label="$t('Statistic.add')" prop="createCount" width="80px">
          </el-table-column>
          <el-table-column  :label="$t('Statistic.click')" prop="downloadCount" width="80px">
          </el-table-column>
            <el-table-column  :label="$t('Statistic.modify')" prop="checkinCount" width="80px">
          </el-table-column>
            <el-table-column  :label="$t('Statistic.delete')" prop="deleteCount" width="80px">
          </el-table-column>
      </el-table>
    </div>
    <div v-show="showDateFormat">
      <el-table v-loading="loading" :data="searchLists" style="width: 100%" class="security-table" :height="containerHeight" >
          <el-table-column  :label="$t('Statistic.dateview')" prop="date">
          </el-table-column>
          <el-table-column  :label="$t('Statistic.add')" prop="createCount" width="80px">
          </el-table-column>
          <el-table-column  :label="$t('Statistic.click')" prop="downloadCount" width="80px">
          </el-table-column>
            <el-table-column  :label="$t('Statistic.modify')" prop="checkinCount" width="80px">
          </el-table-column>
            <el-table-column  :label="$t('Statistic.delete')" prop="deleteCount" width="80px">
          </el-table-column>
      </el-table>
    </div>
    <div v-if="this.viewType=='volume'">
      <el-table v-loading="loading" :data="searchLists" style="width: 100%" class="security-table" :height="containerHeight" >
          <el-table-column  :label="$t('Statistic.boxName')" prop="description" width="200px">
          </el-table-column>
          <el-table-column  :label="$t('Statistic.useVolume')" prop="volumeId">
            <template slot-scope="scope">
            <span>
             <el-progress :text-inside="true" :stroke-width="18" :percentage="progressVolume('percentage',searchLists[scope.$index])" :color="progressVolume('color',searchLists[scope.$index])"></el-progress>
             <el-input class="label-custom" :value="progressVolume('text',searchLists[scope.$index])" readonly></el-input>
            </span>
            </template>
          </el-table-column>
          <el-table-column  :label="$t('Statistic.setting')" prop="volumeId" width="200px">
            <template slot-scope="scope">
              <el-button type="" size="small" @click="setVolume(searchLists[scope.$index].volumeId,searchLists[scope.$index].maxSpace)">
                <i class="el-edit"></i> {{$t('adminMenu.user_setMaxVolume')}}
              </el-button>
            </template>
          </el-table-column>
      </el-table>
    </div>

</div>
</template>



<script>
import Vue from 'vue'
import url from '@/utils/url'
import * as api from '@/utils/api'
import { mapState,mapActions } from 'vuex'
import Utils from '@/utils/utils'
import SelectUserGroupDialog from '@/views/SelectUserGroupDialog'
import UserGroup from '@/views/UserGroup'
import { create } from 'vue-modal-dialogs'
import Constants from '@/Constants'
import SelectDocDialog from '@/admintool/doctypeTreeDialog'
import setVolumeDialog from '@/admintool/volumeDialog'

const userGroupDialog = create(SelectUserGroupDialog)
const docTreeDialog = create(SelectDocDialog)
const volumeDialog = create(setVolumeDialog)


export default {
  name: 'search-page',
  components:{
    SelectUserGroupDialog,
    UserGroup,
  },
  props: {
        containerHeight: {
            default: '700px',
            type: String
        },
  },
  data: function () {
    return {
       searchLists:[],
       datetime : this.value && new Date(this.value),
       fromDate : Utils.todayDate(true),
       toDate : Utils.todayDate(true),
       item: 0,
       loading: true,
       status : "0",
       dateformat: 2,
       searchDataSource: [
            { name: this.$t("Statistic.user") ,id: "users", icon:'fa fa-user'},
            { name: this.$t("Statistic.group") ,id: "groups", icon:'fa fa-users'},
            { name: this.$t("Statistic.doc") ,id: "eclass", icon:'fa fa-file'},
            { name: this.$t("Statistic.date") ,id: "date", icon:'fa fa-clock-o'},
            { name: this.$t("Statistic.box") ,id: "volume", icon:'fa fa-archive'}
      ],
      dataFormatSource:[
            { name: this.$t("Statistic.day") ,id: "2"},
            { name: this.$t("Statistic.month") ,id: "1"},
            { name: this.$t("Statistic.year") ,id: "0"},
      ],
      dataBoxSource : [
          { name: this.$t("Statistic.shared") ,id: "Shared"},
      ],
      docSearchSource: [{name: this.$t("adminMenu.none"), id: ''}],
      itemTemplate : "<span><i class='#=icon#'></i> &nbsp;#=name#</span>",
      viewType : "users",
      userSearch : '',
      groupSearch : '',
      docSearch : '',
      searchType: 0,
      searchinput : "",
      parentId : 'Shared',
      defaultValue : new Date(),
      volume_info: null,
      pickerOptions2: {
          shortcuts: [{
            text: this.$t("adminMenu.last_week"),
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: this.$t("adminMenu.last_month"),
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: this.$t("adminMenu.last_3month"),
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit('pick', [start, end]);
            }
          }]
        },
    }
  },
  mounted() {
    this.defaultDate();
    this.init();
  },
  computed: {
    showUser() {
      return this.viewType == "users"
    },
    showGroup : function() {
      return this.viewType == "users" || this.viewType == "groups"
    },
    showonlyGroup  : function() {
      return this.viewType == "groups"
    },
    showDoc : function() {
      return this.viewType == "eclass"
    },
    showDateFormat :function() {
      return this.viewType == "date"
    },
    showBox : function() {
      return this.viewType == "volume"
    },
    showDate(){
      return this.viewType == "users" || this.viewType == "groups" || this.viewType == "eclass" || this.viewType == "date"
    },
  },
  methods: {
      init(param){
          let setparam="fromDate="+this.fromDate+"&toDate="+this.toDate+"&userId="+this.userSearch+"&groupId="+this.groupSearch+"&eclassId="+this.docSearch+"&dateFormat="+ this.dateFormat+"&parentId="+this.parentId
          let all = api.getStatistic('users',setparam)
          .then(data => {
              this.searchLists=data.list;
              this.loading=false;
              console.log();
          })
          .catch((error) => {
                console.log(error);
          });

         let all2 = api.getContentClasslist()
          .then(data => {
              this.actionlist=data.list
              for(var i=0;i<this.actionlist.length;i++){
                this.docSearchSource.push({ name : this.actionlist[i].name , id : this.actionlist[i].id})
              }
          })
          .catch((error) => {
                console.log(error);
          });

      },
      typeChange(ev){
         let dataItem = ev.sender.dataItem();
         this.viewType= dataItem.id
         this.searchEvent();
      },
      async assignMember(divtype) {
          let settype="";
          if(divtype){
            this.settype=Constants.VIEW_TYPES.SEL_GROUP
          }else{
            this.settype=Constants.VIEW_TYPES.SEL_USER
          }
          const result = await userGroupDialog({
            type: this.settype, title: this.$t('messages.selectUserAndGroup'), width: '80%', containerHeight: '600px',
            gridSelectable: Constants.SELECTABLE.ROW
          })
          if (result) {
            if(divtype){
              this.groupSearch=result[0].id;
            }else{
              this.userSearch=result[0].id;
            }
          }
      },
      async assignDoc() {
        const result = await docTreeDialog({
            type: this.settype, title: this.$t("adminMenu.docType"), width: '40%', containerHeight: '500px',
          })
          if (result) {
              this.docSearch=result;
          }
      },
      searchEvent(){
          if(this.datetime){
            this.fromDate=Utils.replaceDate(this.datetime[0]);
            this.toDate=Utils.replaceDate(this.datetime[1]);
          }
          let param="fromDate="+this.fromDate
          +"&toDate="+this.toDate
          +"&userId="+this.userSearch
          +"&groupId="+this.groupSearch
          +"&eclassId="+this.docSearch
          +"&dateFormat="+ this.dateformat
          +"&parentId="+this.parentId
          this.loading=true;
          let call = api.getStatistic(this.viewType,param)
          .then(data => {
              this.searchLists=data.list;
              if(this.viewType == "volume" ){
                //this.volume_info=data.list;
              }
              this.loading=false;
          })
          .catch((error) => {
                console.log(error);
          });
      },
      async setVolume(volumeId,max){
        const result = await volumeDialog({
                        title: this.$t('adminMenu.user_setMaxVolume'), width: '30%', containerHeight: '400px',
                        target_prop: '', targetId_prop: volumeId, target_vol_prop: Utils.volumeFormat(max)+"GB"
        });
        if(result){
          console.log(result);
          api.settingVolume(result.volumeId,result.maxSize)
          .then(data => { this.requestCompleted(true);})
          .catch((error) => {console.log(error);  })
        }
      } ,
      requestCompleted(){
        this.$notify({
          title: this.$t('label.success'),
          message: this.$t('messages.completed'), type: 'success'
        })
        this.searchEvent();
      },
      progressVolume(type,volumeinfo){
        if(type=="percentage"){
           return this.$Utils.volumeInfo(volumeinfo).percentage
        }else if(type=="color"){
           return this.$Utils.volumeInfo(volumeinfo).color
        }else if(type=="text"){
           return this.$Utils.volumeInfo(volumeinfo).text
        }
      },
      defaultDate(){
              $(".el-range-input").val(Utils.todayDate());
      },
      resetSearch(div){
        if(div=="userSearch"){
          this.userSearch=""
        }
        if(div=="groupSearch"){
          this.groupSearch=""
        }
      }

  }
}
</script>

<style lang="scss">
.searchInput{
  width : 180px !important;
  top: 2px;
}
.search-table{
  margin-top: 5px;
}
.xicon{
  margin-top: -5px;
  cursor: pointer;
}
</style>
