<template>
<div>
   <el-tag type="warning" style="width:100%; padding:5px;height:45px; margin-top:5px;">
     {{ $t('label.overlapdesc') }}
     <i class="el-icon-error closeBtn" @click="splitterclose()"></i>
     <!-- <el-button type="danger" size="small" @click="alldelete()" class="delBtn">{{ $t('buttons.alldelete') }}</el-button> -->
   </el-tag>

  <el-container class="tatoal-container">
      <el-main id="scrollList" class="left-aside" style="overflow: hidden !important;">
        <el-menu :default-openeds="['1']" v-loading="loading">
          <!-- <el-submenu index="1"> -->
            <!-- <template slot="title"><i class="el-icon-menu"></i>{{$t('label.overlapmain')}}</template> -->
            <el-menu-item-group>
              <el-menu-item v-for="(item,idx) in mainlist" :label="$Utils.truncate(item.elementName,20)" :key="item.elementId" :index="'1-'+idx" @click="documentClick(item)">
                <template slot="title" >
                  <span class="icon-type"><i :class="$Utils.getContentTypeClass('di_doc', $Utils.getFileExtension(item.elementName))"></i></span>
                  <el-tooltip :content="item.elementName" placement="right" effect="light">
                  <span class="nameview" v-show="!sizeview">{{ item.elementName }}</span>
                  </el-tooltip>
                  <el-tooltip :content="item.elementName" placement="right" effect="light">
                  <span class="nameview2" v-show="sizeview" :alt="item.elementName">{{ item.elementName }}</span>
                  </el-tooltip>
                  <el-tag v-show="sizeview" type="success" class="setcount">{{$Utils.convertByteSizeToString(item.size)}}</el-tag>
                  <el-tag type="info" class="setcount">{{item.count}}</el-tag>
                </template>
              </el-menu-item>
              <el-menu-item v-if="mainlist.length==0" index="1" class="empty">
                <template slot="title" >
                  <span>* {{$t('label.empty_search_result')}}</span>
                </template>
              </el-menu-item>
            </el-menu-item-group>
          <!-- </el-submenu> -->
        </el-menu>
      </el-main>
    </el-container>
</div>
</template>
<script>
import { mapGetters, mapState, mapMutations } from "vuex";
import * as api from "@/utils/api";
import Utils from '@/utils/utils'
export default {
  name: 'duplicate-document',
  computed: {
    ...mapState(['selected'])
  },
  props: {
    mode: {
      default: 'duplistname',
      type: String
    },
    elementName: {
      default: '',
      type: String
    }
  },
  data: function () {
    return {
      selectedList:null,
      dialogVisible: true,
      title: '',
      width: '100%',
      elemetnId: '',
      param:{},
      mainlist: [],
      data:{ url : '', content:''},
      setMode: '',
      pageCount: 50,
      loading: true,
      sizeview: false,
    }
  },
  mounted() {
    this.init();
  },
  methods:{
    ...mapMutations(["setSearchOption"]),
    splitterclose(){
      Event.fire(EventList.CLOSE_SPLITTER)   
    },
    alldelete(){
      
    },
    documentClick(item){
      if(this.setMode=="duplistname"){
        this.param={
              elementName : item.elementName
        }
        this.data.url = "/json/searchDuplicateDocNameList"
        this.data.content = this.param;
        Event.fire(EventList.SEARCH, this.data)
        Event.fire(EventList.CLOSE_POPUPS) 
      }else{
        this.param={
              elementId : item.elementId
        }
        this.data.url = "/json/searchDuplicateDoc"
        this.data.content = this.param;
        Event.fire(EventList.SEARCH, this.data)
        Event.fire(EventList.CLOSE_POPUPS)         
      }
      this.setSearchOption(this.data);
    },
    init(){

       Event.off(EventList.LOAD_SPLITTER);
       Event.listen(EventList.LOAD_SPLITTER, this.dataLoad);
      
    },
    dataLoad(ev){
      if(ev){
        this.setMode=ev.mode
        if(this.setMode=="duplistname"){
            this.sizeview=false;
            this.param={
                elementName : ev.elementName
            }
            this.data.url = api.URLS.OVERLAP_SEARCH;
            this.data.content = this.param;
            this.data.mode=this.setMode;
            this.mainlist=[]
            api.searchDuplicate('/json/searchDuplicateDocGroupByName',this.param,1,this.pageCount)
            .then(data => { 
              this.mainlist=data.list
              this.loading=false
            })
            .catch((error) => {console.log(error);  })
        }else{
            this.sizeview=true;
            this.mainlist=[]
            this.param={}
            api.searchDuplicate('/json/searchDuplicateDoc',this.param,1,this.pageCount)
            .then(data => { 
              this.mainlist=data.list
              this.loading=false
            })
            .catch((error) => {console.log(error);  })
        }

      }
    }
  },
 
}
</script>

<style lang="scss">
.nameview{
    width: 180px;
    display: inline-block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.nameview2{
    width: 130px;
    display: inline-block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.delBtn{
  float: right;
  right: 5px;
}
.font20{
  font-size: 20px;
}
.tatoal-container{
  margin-top: 6px;
}
.left-aside{
  height: calc(100% - 45px);
  width: "100%";
  background-color: "#fff";
}
.setcount{
  float:right;
  margin-top: 10px;
  margin-right: 2px;
}
.closeBtn{
  float: right;
  right: 5px;
  font-size: 20pt;
  margin-top: 5px;
  cursor: pointer;
}
#scrollList .el-submenu .el-menu-item{
  padding : 1px !important;
}
#scrollList .el-menu-item-group__title{
  padding : 0px !important;
}
.icon-type i{
    margin-left: 5px;
    font-size: 13pt;
    margin-top: -7px;
    margin-right: 5px;
}
.empty{
  text-align: center !important;
}

</style>
