<template>
    <kendo-splitter :orientation="'horizontal'" :panes="[{size: getTreePanePercent()},{ }]" :style="{height: containerHeight}">
        <div id="explorer-left">
            <kendo-treeview id="treeview" ref="ref_treeview" :data-source="remoteDataSource"
                :data-text-field="'text'"
                @databound='onDataBound'
                @select='onTreeSelect'>
            </kendo-treeview>
        </div>
        <div v-if="!disableList" id="explorer-right">
            <grid-view :dialogHeight="containerHeight" ref="grid" type='explorer' :requestData='requestData' :gridSelectable="gridSelectable"
                :isDialog="isDialog" @changed='handleChanged'></grid-view>
        </div>
    </kendo-splitter>

</template>
<script>
    import * as api from '@/utils/api'
    import { mapState} from "vuex";

    import { Splitter } from '@progress/kendo-layout-vue-wrapper'
    import { DataSourceInstaller } from '@progress/kendo-datasource-vue-wrapper'
    import { TreeView,
            TreeViewItem,
            TreeViewInstaller } from '@progress/kendo-treeview-vue-wrapper'
    import EdrmGrid from './EdrmGrid'
    import EdrmTable from './EdrmTable'
    import Constants from '@/Constants'

    export default {
        name: 'filefolders',
        components: {
            "grid-view": EdrmTable,
            Splitter,
        },
        props : {
            containerHeight: {
                default: '450px',
                type: String
            },
            disableList : {
                default: false,
                type: Boolean
            },
            type : {
                default: 'explorer',
                type: String
            },
            gridSelectable: {
                default: Constants.SELECTABLE.MULTIPLE,
                type: String
            },
            isFolder: {
                default : null,
                type : Boolean
            },
            isRoad:{
                dafalut : false,
                type : Boolean
            }
        },
        computed: {
            ...mapState([
                "user"
            ]),
            remoteDataSource() {
                let attr = true
                return api.getTreeDataSource(`${store.state.baseURL}/json/getTreeList2?targetType=filefolder&attr=${attr}`, 'rid', 'hasChildren', 'list');
            }
        },
        data() {
            return {
                // remoteDataSource: api.getTreeDataSource(`${store.state.baseURL}/json/getTreeList2?targetType=filefolder`, 'rid', 'hasChildren', 'list'),
                requestData : {
                    url : null,
                    data : null
                },
                isDialog: true
            }
        },
        mounted() {
            this.remoteDataSource.bind("error", this.handleError);
            this.$emit('position');            
            this.road=this.isRoad
        },
        methods: {
            getTreePanePercent() {
                if (!this.user.treePanePercent) return "25%";
                return this.user.treePanePercent;
            },
            onDataBound: function (ev) {
               this.selectFirstNode();
            },
            selectFirstNode: function(ev){
                if(this.road){
                    var el = $('#explorer-left').find('#treeview');
                    var tree = el.data('kendoTreeView');
                    var firstNode = el.find('.k-first');
                    var dataItem = tree.dataItem(firstNode);
                    
                    tree.select(firstNode);
                    tree.expand(firstNode);
                    this.$refs.grid.queryDir(dataItem.rid)
                    this.road=false
                }
            },
            onTreeSelect: function (ev) {                
                let dataItem = ev.sender.dataItem(ev.node)
                
                let el = $('#explorer-left').find('#treeview');
                let tree = el.data('kendoTreeView');

                tree.select(ev.node);
                tree.expand(ev.node);

                console.log(tree)
                
                if (!this.disableList){                    
                    this.$emit('notifySelected', dataItem)                          
                    Event.fire(EventList.NOTIFY_SELECTED, dataItem.rid);
                }else {
                    if (this.type === 'rules') {
                        let found = Object.keys(dataItem).findIndex(e => {return e.startsWith("fld:ruleId_")})
                        if (found !== -1){                            
                            this.$emit('notifySelected', dataItem)                            
                        }
                        else{                            
                            this.$emit('notifySelected', null)                            
                        }
                    } else {                        
                        this.$emit('notifySelected', dataItem)                        
                    }
                }
            },            
            handleChanged(selected) {                
                this.$emit('notifySelected', selected)
            },
            handleError(e) {
                if (e.xhr.readyState == 0 || e.xhr.status == 401) {
                    api.toLogin()
                }
            },
        }
    }
</script>
<style>
/* #explorer-right{
    height: initial !important;
} */
</style>
