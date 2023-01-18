<template>
    <kendo-treeview id="folderTreeView" :data-source="remoteDataSource"
        :data-text-field="'text'"
        @databound='onDataBound'
        @select='onSelect'>
    </kendo-treeview>
</template>
<script>
    import * as api from '@/utils/api'
    import { Splitter } from '@progress/kendo-layout-vue-wrapper'
    import { DataSourceInstaller } from '@progress/kendo-datasource-vue-wrapper'
    import { TreeView,
            TreeViewItem,
            TreeViewInstaller } from '@progress/kendo-treeview-vue-wrapper'

    export default{
        name: 'foldertree-view',        
        data() {
            return {
                rootBounded: false,
                remoteDataSource: api.getTreeDataSource(`${store.state.baseURL}/json/getTreeList2`, 'rid', 'hasChildren', 'list'),
                error: null,
                urlParts : [],
                url: this.$route.path,
                actions : [],
            }
        },
        methods: {
            onDataBound: function (ev) {
                if (!this.rootBounded) {
                // just root
                    //this.searchPath()
                    this.rootBounded = true
                }
            },

            onSelect: function (ev) {
                let dataItem = ev.sender.dataItem(ev.node)
            }
        }
    }
</script>