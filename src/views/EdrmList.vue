
<template >
    <div id="main-listView" >

        <kendo-listview id="main-kendoList" class="k-scrollable" ref="listView"
                :data-source='sharedDataSource()'
                :template="getTemplateData()"
                :selectable="'multiple'"
                :navigatable='false'
                @change="handleChange"
                :auto-bind='false'>
        </kendo-listview>
        <kendo-pager id="main-list-pager" ref="pager"
            :data-source='sharedDataSource()'
            :numeric='false'
            :previous-next='false'
            :messages-display='initMessage'
            :refresh='false'
            :page-sizes="false">
        </kendo-pager>

    </div>
</template>
<script>
import Vue from 'vue'

import * as api from '@/utils/api'
import { mapGetters, mapState, mapMutations } from 'vuex'
import { Pager,
        ListView,
        ListViewInstaller } from '@progress/kendo-listview-vue-wrapper'

import listMixin from './ListMixin'
import constants from '../Constants';
import mgCheck from '@/utils/MGCheckLogin'

Vue.use(ListViewInstaller)

export default {
    name: 'list-view',
    mixins: [listMixin],
    components: {
        Pager,
        ListView
    },
    computed: {
        ...mapState(['user']),
        scrollDataSource() {
            if (!this.staticScrollDataSource)
                this.staticScrollDataSource = this.getNewDataSource()
            return this.staticScrollDataSource
        },
    },
    watch : {
        'requestData.url' () {
            console.log('url: ' + this.requestData.url)
        }
    },
    data: function () {
        return {
            done: true,
            listView: null,
            staticScrollDataSource : null,
            listViewInitialized : false,
            emptyMessage:constants.EMPTY_FILE_MESSAGE,
            copyList: [],
            moveList: [],
        }
    },
    created () {        
    },
    mounted() {
        this.initPagerToolbar()
    },
    methods: {        
        getTemplateData() {
            let view = this.viewOption.view
            return $(`#${view}-itemTemplate`).html()
        },
        loadData() {
            //TURN OFF DRAG
            $("#main-kendoList").getKendoListView().selectable.userEvents.unbind("move");
            this.loadDataDefault()
        },
        onDataBound: function (ev) {      
            ev.then(res => {
                if(this.$store.state.currentDir === 'carryout' && this.$store.state.rootId === 'carryout' && this.$store.state.isCarryout) {
                    let list = res.list;
                    let carryoutList = [];                    
                    for(let i = 0; i < list.length; i++) {
                        carryoutList.push(list[i].r_object_id);                        
                    }
                    this.$store.commit('setCarryoutList', carryoutList);
                }
            })
            this.onDefaultDataBound()
            if (this.$refs.pager)
                this.$refs.pager.kendoWidget().options.messages.display= this.getPageMessage()
            if ($("#main-list-pager .k-pager-info")[0])
              $("#main-list-pager .k-pager-info")[0].textContent = this.getPageMessage()
            if(ev.responseJSON.list.length==0){
                $("#main-kendoList").html(constants.LISTGRID_EMPTY_MESSAGE_FACTORY(this.rootId,this.currentDir));
            }

             //checkbox 구분
            if(this.$Utils.featuresDefault('listselectbox',false)){
                //Utils.allcheckbox();
                Utils.selectedboxClick('list');
            }
        },
        open: function(ev) {          
          let mgConnect = Utils.featuresDefault('mgConnect.websocket.open',false);
          let selectedRow = this.listView.dataItem(this.listView.select());
          console.log("파일 오픈");
          console.log(selectedRow.docTypeName);
          console.log(selectedRow)

          if(mgConnect){ //웹소켓 연결한 경우
            
            let selectedRow = this.listView.dataItem(this.listView.select());
            if(selectedRow.docTypeName=='FOLDER'){
                this.openDefault(ev, this.listView)
            }else{
                let dalimeRequest = Utils.featuresDefault('mgConnect.dbClick.dalimeRequest',false);
                if(this.user.isOutsideSubnet&&dalimeRequest){ //외부망 
                    api.getDocInfo(selectedRow.r_object_id).then(data=>{    
                            let evData = {r_object_id:selectedRow.r_object_id,object_name:selectedRow.object_name,r_folder_path:selectedRow.r_folder_path};                       
                            let list=data.list
                            let localPath=list[0].path+list[0].object_name
                            let successCallback = function(){}
                            let failCallCheckout = function(){
                                     let NotInstall = Utils.featuresDefault('mgConnect.dbClick.syn',false);
                                     if(NotInstall){
                                            Event.fire(EventList.FILE_OPEN, evData);
                                     }else{
                                            Event.fire(EventList.FILE_DOWNLOAD, selectedRow);
                                     }
                            }
                            mgCheck.openDoc(successCallback,failCallCheckout,selectedRow.r_object_id, localPath,'R')
                    }).catch(error=>{})

                }else{ //내부망
                        api.getDocInfo(selectedRow.r_object_id).then(data=>{
                                        let list=data.list
                                        let localPath=list[0].path+list[0].object_name
                                        api.getMenu(selectedRow.r_object_id).then(data=>{
                                            if(data.editLockDoc=="Y"){
                                                let successCallback = function(){}
                                                let failCallCheckout = function(){
                                                        let NotInstall = Utils.featuresDefault('mgConnect.dbClick.syn',false);
                                                        if(NotInstall){
                                                                Event.fire(EventList.FILE_OPEN, evData);
                                                        }else{
                                                                Event.fire(EventList.FILE_DOWNLOAD, selectedRow);
                                                        }
                                                }
                                                mgCheck.openDoc(successCallback,failCallCheckout,selectedRow.r_object_id, localPath,'W')
                                                console.log("편집모드");
                                            }else{
                                                let successCallback = function(){}
                                                let failCallCheckout = function(){
                                                        let NotInstall = Utils.featuresDefault('mgConnect.dbClick.syn',false);
                                                        if(NotInstall){
                                                                Event.fire(EventList.FILE_OPEN, evData);
                                                        }else{
                                                                Event.fire(EventList.FILE_DOWNLOAD, selectedRow);
                                                        }
                                                }
                                                mgCheck.openDoc(successCallback,failCallCheckout,selectedRow.r_object_id, localPath,'R')
                                                console.log("읽기모드");
                                            }
                                        }).catch(error=>{})
                                    
                        }).catch(error=>{})
                }
            }
          }else{
              if(this.user.isOutsideSubnet){ //외부망 
                    if(selectedRow.docTypeName=='FOLDER'){
                         this.openDefault(ev, this.listView)
                    }else{ 
                         Event.fire(EventList.FILE_DOWNLOAD, selectedRow);
                    }
              }else{ //내부망
                   if(selectedRow.docTypeName=='FOLDER'){
                         this.openDefault(ev, this.listView)
                    }else{ 
                         Event.fire(EventList.FILE_DOWNLOAD, selectedRow);
                    }
              }
          }
        },
        clearSelection() {
            this.listView.clearSelection();
            this.setSelected([])
        },
        onMouseDownExtended(ev, target, source) {
            if(ev.button==2){ //mouse right-click
                if($(target).hasClass('k-state-selected')){
                    this.onMouseDown(ev, target, source)
                    return
                }
                else{
                    this.clearSelection();
                }
            }
            else if(ev.button==0){//mouse left-click
                if($(target).hasClass('k-state-selected')){
                    return
                }
            }
            this.onMouseDown(ev, target, source)
        },
        handleChange(arg) {
          let vue = this
          let selectedItems = $.map(vue.listView.select(), function(item) {
              return vue.listView.dataItem(item);
          });

          this.handleChangeDefault(arg, selectedItems)

          //checkbox 구분
          if(this.$Utils.features('listselectbox')){
                Utils.selectedCheckbox('list');
          }

          //복사/이동 setting
          var selectList = [];
          for(var i=0; i<selectedItems.length;i++){
              selectList.push(selectedItems[i].r_object_id);
          }
          store.commit('setCopySelectedList', selectList);
          store.commit('setmoveSelectedList', selectList);
        },
        init() {
            this.pageNum = 1
            let vue = this
            // listview scroll
            if (!this.listViewInitialized) {
                let list = $("#main-kendoList");
                let listView = list.data("kendoListView")
                this.listView = listView
                // set source. used contextmenu
                this.source = this.listView
                list.on('scroll', function () {
                    if (!vue.moreData) {
                        return
                    }
                    if ($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight-1) {                        
                        if(!vue.done) return false;                        
                        vue.done = false;
                        console.log('scrolling fetch')
                        vue.pageNum ++;
                        var lastItem = $('#main-kendoList .list-item').last();
                        console.log('scroll url: ' + vue.requestData.url)
                        vue.scrollDataSource.transport.options.read.url = vue.requestData.url
                        vue.scrollDataSource.transport.options.read.data = vue.requestData.data

                        // loading
                        // <div class="k-loading-mask" style="width: 100%; height: 100%; top: 0px; left: 0px;"><div class="k-loading-image"></div><div class="k-loading-color"></div></div>
                        kendo.ui.progress($("#main-listView"), true)
                        $(".k-loading-mask")[0].css

                        var container = listView.wrapper.children(".k-grid-content"); // or ".k-virtual-scrollable-wrap"
                        let scrollOffset = {left: 0,top: 0}

                        scrollOffset.left = list.scrollLeft();
                        scrollOffset.top = list.scrollTop(); // use only if virtual scrolling is disabled

                        let options = {
                            page: vue.pageNum, pageSize: 100,
                            orderBy:vue.viewOption.orderBy, dir:vue.viewOption.dir,
                            sort: {field: vue.viewOption.orderBy, dir: vue.viewOption.dir }
                        }
                        vue.scrollDataSource.query(options).then(function () {
                            vue.done = true;
                            let newData = listView.dataSource.data().slice()
                            vue.scrollDataSource.data().forEach(x => {
                                newData.push(x);
                            })
                            listView.dataSource.data(newData)
                            list.scrollLeft(scrollOffset.left);
                            list.scrollTop(scrollOffset.top); // use only if virtual scrolling is disabled
                            //list.scrollTo(lastItem);
                            // loading
                            kendo.ui.progress($("#main-listView"), false)
                        });
                    }
                })
                // 빈 공간 우클릭하면 부모 폴더의 액션이 나와야 함
                $("#main-listView").on("mouseup", ".k-listview", function(ev) {
                if (ev.button == 2) {
                    ev.preventDefault();
                    // clear selection
                    vue.clearSelection();
                    // open context
                    vue.openContext(ev, null, constants.ATTRIBUTE.CURRENT_DIR)
                    // Event.fire(EventList.OPEN_CONTEXT, {event: ev,from:constants.ATTRIBUTE.CURRENT_DIR})
                }
                });
                // right click event
                let dbclick=true;
                $("#main-kendoList").on('mouseup', ".list-item", function(ev){
                    console.log('listview mousedown')
                    vue.onMouseDownExtended(ev, this, vue.listView)
                })

                $("#main-kendoList").dblclick(this.open);
                jQuery.fn.scrollTo = function(elem) {
                    $(this).scrollTop($(this).scrollTop() - $(this).offset().top + elem.offset().top);
                    return this;
                }

                this.listViewInitialized = true
                console.log('listView init')
            }
        }
    }
}
</script>
<style>
    #main-listView {
        height: calc(100% - 36px);
    }

    #main-list-pager {
        height: 32px;
    }

    #main-kendoList {
        /* padding: 10px 5px; */
        margin-bottom: -1px;
        min-height: 100px;
        /* Avoid cutout if font or line is bigger */
        font: inherit;
        height: inherit;
        border: 0;
    }

.list-item-detail .media {
    align-items: center;
}

.media-content {
    overflow: hidden !important;
}
    .versionLabel{
        margin-left: 3px;
    }
    .margin-minus{
        margin-left: 0px !important;
    }
    .category-list{
        margin-top: 3px;
    }
    .list-item-indic1 span{
      font-size:7pt;
      float: right;
      margin: 1px;
    }
    .list-item-indic2 span{
      font-size: 10pt;
      float: right;
      margin: 1px;
    }
    .list-item-list2 {
        float: left;
        position: relative;
        width: 160px;
        height: 193px;
        margin: 4px;
        padding: 0;
        border: 1px solid #E2E2E2;
        border-radius: 2px;
        box-shadow: 0 1px 5px rgba(50,50,50,.1);
        display: block;
    }
    .list-item-icon-list2 {
        font-size: 2em;
        font-family: FontAwesome;
        height: 120px;
        margin: 5px 5px;
    }
    .list-item-icon-list2 img {
        margin: auto;
        display: block;
        width: 140px;
        height: 120px;
    }
    .list-item-icon-list2 i {
        text-align: left;
        margin-top: 15px;
        margin-left: 30px;
        top: 15px;
        font-size: 70pt;
    }
    .list-item-icon-list1 i {
        margin-left: 40px;
    }
    .list-item-name {
        padding: 2px 0px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-left: 5px;
    }
    /* list2 */
    .list-item-list1 {
        float: left;
        position: relative;
        width: 130px;
        height: 100px;
        margin: 4px;
        padding: 0;
        border: 1px solid #E2E2E2;
        border-radius: 2px;
        box-shadow: 0 1px 5px rgba(50,50,50,.1);
        display: block;
    }
    .list-item-icon-list1 {
        font-size: 2em;
        font-family: FontAwesome;
        margin: 0px 5px;
    }
    .list-item-icon-detail {
        font-size: 50px;
        font-family: FontAwesome;
        text-align: center;
    }
    .list-item-bottom {
        align-items: center;
        display: contents;
        padding: 8px 10px;
    }
    .list-item-filesize {
        text-align: left;
        margin: 0;
        padding: 0px 5px;
        overflow: hidden;
    }
    .k-listview:after {
        content: ".";
        display: block;
        height: 0;
        clear: both;
        visibility: hidden;
    }
    .summary {
        border: 1px solid #ccc !important;
        padding: 2px;
    }
    /* .dm_folder:before {
        font-family: FontAwesome;
        content: "\f07b";
    } */
.x-tags .tag:hover {
    text-decoration: underline;
}
</style>
