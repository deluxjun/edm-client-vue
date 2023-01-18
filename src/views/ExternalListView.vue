<template id="main">
    <div id="edrm-right-sub">
          <div id="main-listView" >
            <kendo-listview id="main-kendoList" class="k-scrollable" ref="listView"
                :data-source='sharedDataSource()'
                :template="getTemplateData()"
                :selectable="'multiple'"
                :navigatable='false'
                :auto-bind='false'>
            </kendo-listview>
        </div>
    </div>
</template>

<script>
import Vue from 'vue'
import store from '@/store'

import * as api from '@/utils/api'
import { mapGetters, mapState, mapMutations } from 'vuex'
import { Pager,
        ListView,
        ListViewInstaller } from '@progress/kendo-listview-vue-wrapper'

import listMixin from "./ListGridCommonMixin";
import constants from '../Constants';

Vue.use(ListViewInstaller)

export default {
    name: 'edrm-list2',
    mixins: [listMixin],
    components: {
        ListView
    },
    computed: {
        scrollDataSource() {
            if (!this.staticScrollDataSource)
                this.staticScrollDataSource = this.getNewDataSource()
            return this.staticScrollDataSource
        },
    },
    data: function () {
        return {
            listView: null,
            staticScrollDataSource : null,
            listViewInitialized : false,
            requestData : {
                    url : null,
                    data : null
            },
        }
    },
    created () {
            Event.off(EventList.SEARCH)
            Event.off(EventList.RELOAD_LIST)
            Event.listen(EventList.SEARCH, this.search)
            Event.listen(EventList.RELOAD_LIST, this.loadData)
    },
    mounted() {
        //this.initPagerToolbar()
    },
    methods: {
        getTemplateData() {
            return $(`#detailsearch-itemTemplate`).html()
        },
        loadData() {
            //this.loadDataDefault()
            let dataSource = this.sharedDataSource()
            dataSource.query({ page: 1, pageSize: this.viewOption.pageSize});
        },
        search (data) {
            let content = null
            console.log(data.content);
            if (data.content)
                content = JSON.stringify(data.content)
            console.log("searching data :: " + content)
            let dataSource = this.sharedDataSource(false)
            dataSource.transport.options.read.url = `${store.state.baseURL}/json/searchFullDoc`;
            if(data.content){
                dataSource.query({ page: 1, pageSize: this.viewOption.pageSize, param : content});
            }else{
                dataSource.query({ page: 1, pageSize: this.viewOption.pageSize});
            }
        },
        onDataBound: function (ev) {
            this.onDefaultDataBound()
            if(ev.responseJSON.list.length==0){
                    $("#main-kendoList").html("<br><center>"+i18n.t('label.empty_search_result')+"</center><br>");
            }
        },
        getNewDataSource() {
            let vue = this
            return new kendo.data.DataSource({
                transport: {
                    read: {
                        url: `${store.state.baseURL}/json/searchFullDoc`,
                        dataType: 'json',
                        contentType: 'application/json; charset=utf-8',
                        beforeSend: function(req) {
                           
                        },
                        complete : this.onDataBound
                    }
                },
                schema: {
                    model: {id:"id"},
                    total : function(response) {
                    return vue.calcTotal(response)
                    }, data: 'list'
                },
                serverPaging : true, serverFiltering : false, serverSorting : false, page : 1, pageSize : vue.viewOption.pageSize,
            })
        },
        calcTotal(response) {            
            if (response.moreData === undefined){
                this.moreData = false
                this.totalCount = response.totalCount
            } else {
                this.moreData = response.moreData
                this.totalCount = response.totalCount - 1
            }
            return this.totalCount
        },
        init() {
            this.pageNum = 1
            let vue = this
        }
    }
}
</script>
<style>
    #edrm-right-sub {
        height: 100%;
    }

.grayfont, .grayfont-10 {
    color: #888;
    font-size: 9pt;
    letter-spacing: -0.1px;
}
.class-con {
    display: inline-block;
    vertical-align: bottom;
}
.class-con span.k-icon {
    vertical-align: baseline;
}
#edrm-right-sub .box {
    box-shadow: none;
    border-bottom: 1px solid #ebebeb;
    border-radius: 0;
    padding: 2px 0px;
}
#edrm-right-sub .box:not(:last-child) {
    margin-bottom: 0;
}

.list-item-detail {
  display: flex;
  padding: 0;
  flex-wrap: wrap;
  justify-content: flex-start;
  position: relative;
}

.list-item-detail .size,
.list-item-detail .modified {
  font-size: 0.9em;
}

.media-content .content p:not(:last-child) {
  margin-bottom: 0.3em !important;
  margin-top: 0.3em !important;
}

.list-item-detail .name {
  font-weight: bold;
}

.margin-r-15 {
    margin-right: 15px;
}
.list-indicator {
    white-space: nowrap;
}
.hold-line {
    white-space: nowrap;
}

/* tags */
/* .tags:not(:last-child) {
    margin-bottom: 0.2rem;
}

.tags:last-child {
   margin-bottom: -0.5rem;
} */

.x-tags .tag {
    margin-bottom: 0;
}

.list-item-path {
    color: #888;
    font-size: 9pt;
    padding: 0px 0px 5px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.list-item-path:hover {
    text-decoration: underline;
    cursor: pointer;
}

.set-media-left {
    font-size: 3em;
    width: 100px !important;
}
.set-media-left i{
    margin-left: 35px;
}

</style>
