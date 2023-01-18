import { mapState, mapMutations } from 'vuex'
import {getFullUrl} from '@/utils/api'

import ListGridCommonMixin from './ListGridCommonMixin'

import Vue from 'vue'
import store from '@/store'
import PagerToolbar from './PagerToolbar'
import mgCheck from '@/utils/MGCheckLogin'
import Utils from '@/utils/utils'

export default {
    mixins: [ListGridCommonMixin],
    props : {
        requestData : Object,
        type : {
            default: 'main',
            type: String
        },
        gridSelectable : {
            default: false,
            type: Boolean
        },
        isFolder: {
            default : null,
            type : Boolean
        },
        withToolbar : {
            default: true,
            type: Boolean
        }
    },
    components : {
        PagerToolbar
    },
    data () {
        return {
          source: null,
            listFeatures: [],
            toolbarClass: null,
            toolbar: null,
            // loaded: false,
        }
    },
    computed: {
        ...mapState([
            'info',
            'user',
            'selected',
            'currentDir',
            'rootId',
            'pageSize', 'viewOption', 'loading'
        ]),
        initMessage() {
            return ' '
        },
    },
    created () {
        if (this.type == 'main') {
            Event.off(EventList.SEARCH)
            Event.off(EventList.SEARCH_TAG)
            Event.off(EventList.RELOAD_LIST)
            Event.off(EventList.RELOAD_DIR)
            Event.listen(EventList.SEARCH, this.search)
            Event.listen(EventList.SEARCH_TAG, this.searchTag)
            Event.listen(EventList.RELOAD_DIR, this.queryDir)
            Event.listen(EventList.RELOAD_LIST, this.loadData)
        }
    },
    watch: {
    //   '$route': 'fetchData',
        'currentDir': function (value) {
          if (value === constants.NOPE)
            return

          console.log('currentDir watching.. type: ' + this.type)
            if (this.type == 'main') {
                this.queryDir()
            }
            Event.fire(EventList.CLOSE_SPLITTER)
        },
        'viewOption.view': function () {
            if (this.type == 'main') {
                this.loadData()
            }
        },
        'rootId' : function() {
          // kendo columns 갱신이 늦어, 오류 발생하므로 setRootId 할 때 setColumns 호출해야함!
            // this.setColumns()
        }
    },
    methods: {
        ...mapMutations([ 'setLoading', 'setSelected',"setRootId",'setCurrentDir','setCurrentDirInfo' ]),
        getNewDataSource() {
          console.log('pageSize =========== ' + store.state.viewOption.pageSize)
            let vue = this
            return new kendo.data.DataSource({
                transport: {
                    read: {
                        url: `${store.state.baseURL}/json/getFileFolderList`,
                        dataType: 'json',
                        contentType: 'application/json; charset=utf-8',
                        beforeSend: function(req) {
                            req.setRequestHeader('Authorization', `Bearer ${Utils.getCookie('auth')}`);
                        },
                        complete : function(e) {
                            vue.onDataBound(e)
                        }
                    },
                    parameterMap: function(data, type) {
                        let result = {}
                        if (type == "read") {
                            if (data) {
                                result = data
                                if(data.sort){
                                    if(data.sort.length>0){
                                        result.orderBy = `${Utils.changeSortName(data.sort[0].field)}`;
                                        result.dir = data.sort[0].dir;
                                        delete result.sort;
                                    }else{
                                        delete result.sort; //TODO 필요없는 값 근본적으로 안생기게 조치해야함
                                        result.orderBy = store.state.viewOption.orderBy;
                                        result.dir = store.state.viewOption.dir;
                                    }
                                }else{
                                    delete result.sort; //TODO 필요없는 값 근본적으로 안생기게 조치해야함
                                    result.orderBy = store.state.viewOption.orderBy;
                                    result.dir = store.state.viewOption.dir;
                                }
                            }
                        }
                        return result
                    }
                },
                schema: {
                    model: {
                    },
                    // data : 'list',
                    total : function(response) {
                        return vue.calcTotal(response)
                    },
                    data: 'list',
                    //total : () => 100000000,
                },
                serverPaging : true,
                serverFiltering : true,
                serverSorting : true,
                page : 1,
                pageSize : 100,
                // columns가 변경되면 loading도 오동작하므로 아래코드로 로딩바 조절
                requestStart: function(e) {
                  // setTimeout(function(e) {
                      let loading = $(".k-loading-image")
                      if (!loading || loading.length < 1) {
                        kendo.ui.progress($("#edrm-right-sub"), true)
                        console.log('manual loading bar')
                      } else {
                        console.log('auto loading bar')
                      }
                  // }, 500)
                },
            })
        },
        setColumns() {
            // dummy
        },
        serverSorting(){
            console.log(this.viewOption.view);
            if(this.viewOption.view=='detail' || this.viewOption.view=="list1" || this.viewOption.view=="list2"){
                return true
            }else{
                return false
            }
        },
        calcTotal(response) {
            if (this.type == 'main') {
                if (response && response.current)
                    this.setCurrentDirInfo(response.current)
                else
                    this.setCurrentDirInfo(null)
            }
            return this.calcTotalCommon(response)
        },
        queryDir (dir) {            
            if (!dir)
                dir = this.currentDir
            if(this.rootId=='search') {
                dir = 'search';
            }
            console.log("fetch data :: " + dir)
            // this.setLoading(true)
            let selectedId = dir
            let id = this.$Utils.getRootType(this.$route.path)
            if (id){
              this.setRootId(id)
              this.setColumns()
            }

            var type=(((this.rootId == "Categories") || (this.rootId=="tag")) && "elementEclass") || this.rootId;
            if(this.rootId=="receivedShare" && this.currentDir!=this.rootId) type="";
            if (selectedId) {
                this.requestData.url = `${store.state.baseURL}/json/getFileFolderList?type=${type}&folderId=${selectedId}&moreData=true&ver4=true`;
                if(this.isFolder){
                    this.requestData.url+= `&isFolder=`+this.isFolder
                }
                this.loadData()
            }
        },
        searchTag(id) {
            this.search({url: `/json/getElementsUnderEclass?eclassId=${id}`})
        },
        search (data) {
            let content = null
            if (data.content)
                content = JSON.stringify(data.content)
            console.log("searching data :: " + content)
            // this.setLoading(true)
            // this.dataSource = this.getNewDataSource()
            let dataSource = this.sharedDataSource(false)
            let query = new Object(); query.param = content
            query.ver4=true;
            this.requestData.url = getFullUrl(data.url)
            this.requestData.data = query
            // set root
            if(data.mode){
                //this.setRootId(data.mode) //중복검색 특수기능 추가시 필요
                this.setRootId('search')
            }else{
                this.setRootId('search')
            }

            this.setColumns()
            this.loadData()
            // clear tree selection. 20180605, tree 계속 선택되어 있도록 수정
            // Event.fire(EventList.TREE_CLEAR_SELECTION)
        },
        loadDataDefault() {
            this.init();
            console.log('route path : ' + this.$route.path + ", url : " + this.requestData.url)
            if (!this.requestData.url) {
                return
            }
            this.$store.commit('clearSelected')
            // clear status
            if (this.toolbar)
            this.toolbar.listChanged([])

            let ldataSource = this.sharedDataSource(false)
            // reset pageSize, orderby
            ldataSource.options.pageSize = 100
            ldataSource.transport.options.read.url = this.requestData.url
            // ldataSource.read()
            ldataSource.transport.options.read.data = this.requestData.data
            let options = {
                page: 1, pageSize: 100,
                orderBy:this.viewOption.orderBy, dir:this.viewOption.dir,
            }
            // Sort 변경으로 인해, URL 요청 변경.
            if(this.viewOption.view=='grid'){
                //ldataSource.transport.options.read.url = this.requestData.url+"&orderBy=name&dir=asc&page="+1+"&pageSize="+this.viewOption.pageSize
                options['sort']={field: 'object_name', dir: 'asc', 
                    compare: function (a, b) {
                        let compareNameA = (a.docTypeName == 'FOLDER')? '0'+ a.object_name : '1' + a.object_name
                        let compareNameB = (b.docTypeName == 'FOLDER')? '0'+ b.object_name : '1' + b.object_name
                        return compareNameA.localeCompare(compareNameB)
                    } 
                };
            }else{
                //let changeOptions="&orderBy="+this.viewOption.orderBy+"&dir="+this.viewOption.dir+"&page="+1+"&pageSize="+this.viewOption.pageSize
                //ldataSource.transport.options.read.url = this.requestData.url+changeOptions
            }
            console.log(ldataSource)
            ldataSource.query(options)
        },
        onMouseDown: function (event, target, source) {
            if (event.which === 3 && this.type == 'main') {
                event.preventDefault();
                event.stopPropagation()
                // select
                source.select(target);
                // currentDir 은 현재 위치해 있는 폴더를 의미하므로 주석처리함
                // this.setCurrentDir(source.dataItem(target).folderId)

                this.openContext(event, source)
            }
        },
        openContext(e, source, from = constants.ATTRIBUTE.COMMON_FILE) {

          if (source){
            source = this.source
            let selected = []
            var cnt=source.select().length;
            this.$store.commit('clearSelected')
            if(cnt>0){
                for (let i = 0; i < cnt ; i++) {
                    let dataItem = source.dataItem(source.select()[i]);
                    this.$store.commit('addSelectedByItem', dataItem)
                }
                // this.setSelected(selected)
            }
          }
          console.log(e);
          Event.fire(EventList.OPEN_CONTEXT, {event: e, from: from})
        },
        openDefault(ev, widget) {
            ev.preventDefault();
            let selectedRow = widget.dataItem(widget.select());
            if (!selectedRow) return;

            // set selection
            this.$store.commit('clearSelected')
            this.$store.commit('addSelectedByItem', selectedRow)
            console.log(store.state.rootId);
            if(store.state.rootId!='trash'){ //휴지통이 아닐경우만 동작
                if(selectedRow.r_object_type === "dm_folder"){
                    Event.fire(EventList.FOLDER_SELECTED, selectedRow);
                }
                else{
                //open or download
                    if(ev.target.className!='k-resize-handle'){ // kendo grid resize open prevent
                            let checkPreview= Utils.featuresDefault('PreviewEdit',false)
                            if(checkPreview){
                                this.mgLoginCheck(selectedRow);
                            }else{
                                if(this.$store.state.info.fileClickEvent=="VIEWER"){
                                    Event.fire(EventList.FILE_OPEN, selectedRow);
                                }
                                else{
                                    this.$store.commit('showHover','download');
                                }
                            }
                    }
                }
            }
        },
        mgLoginCheck(selectedRow){
            let mgConnect = Utils.featuresDefault('mgConnect.websocket.open',false);
            if(mgConnect){
                api.getDocInfo(selectedRow.r_object_id)
                .then(data=>{
                    let list=data.list
                    let localPath=list[0].path+list[0].object_name
                    let successCallback = function(){}
                    let failCallCheckout = function(){
                            Event.fire(EventList.FILE_OPEN, selectedRow);
                    }
                    mgCheck.openDoc(successCallback,failCallCheckout,selectedRow.r_object_id, localPath,'W')
                }).catch(error=>{})
            }else{
                if(this.$store.state.info.fileClickEvent=="VIEWER"){
                    Event.fire(EventList.FILE_OPEN, selectedRow);
                }
                else{
                    this.$store.commit('showHover','download');
                }
            }
        },
        handleChangeDefault(arg, items) {
          if (this.toolbar)
            this.toolbar.listChanged(items)

          //console.log(this.$Utils.features('listselectcount'));
           if(items.length > this.$Utils.features('listselectcount')){
             //Utils.allcheckbox(false,{ id: 'grid'});
             this.$notify({
               title: this.$t('label.warning'),
               message: this.$t('label.selectRestrictions',{count: this.$Utils.features('listselectcount')}), type: 'warning'
             })
           }

          // reset store selection
          this.$store.commit('clearSelected')
          items.forEach(element => {
            this.$store.commit('addSelectedByItem', element)
          });

        },
        handleError(e) {
            console.log('error : ' + e.xhr.status)
            if (e.xhr.readyState == 0 || e.xhr.status == 401) {
                api.toLogin()
            }
        },
        onDefaultDataBound() {
          // vue.loaded = true
          kendo.ui.progress($("#edrm-right-sub"), false)
          console.log('ListMixin onDefaultDataBound')
            // init pager toolbar. kendo는 column이 바뀌면 사라짐
            this.initPagerToolbar()
        },
        initPagerToolbar(renew = false) {
            if (!this.withToolbar)
                return
            if (renew) {
                delete this.toolbar
                this.toolbar = null
            }
            if (!this.toolbarClass)
                this.toolbarClass = Vue.extend(PagerToolbar)

            if (!this.toolbar) {
                let ToolbarClass = this.toolbarClass
                let vue = this
                this.toolbar = new ToolbarClass({
                    store,
                    i18n,
                    propsData: {}
                })
                this.toolbar.$mount() // pass nothing
            }
            // this.$refs.container.appendChild(instance.$el)
            $(".k-pager-refresh").before(this.toolbar.$el);
        }
    }
}
