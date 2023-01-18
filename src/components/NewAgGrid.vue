
<template >
    <div id="main-tableview" style="height:calc(100% - 30px);">
        <ag-grid-vue id="myGrid" style="width: 100%;height:95%;" class="ag-theme-balham"
                     :gridOptions="gridOptions"
                     :rowDoubleClicked="onDoubleClicked"
                     :cellContextMenu="onRightClicked"
                     rowSelection="multiple">
        </ag-grid-vue>
        <div id="tablev_toolbar" style="border: 1px solid gray"> <!-- ag grid 의 툴바는 유료기능이므로 직접만듬(기존 kendo꺼는 호환불가) -->
            <div class="level-right">
                 <h4>{{ toolbarMessage }}</h4>&nbsp;&nbsp;
                 <el-button @click="refreshPage" icon="el-icon-refresh" type="info" size="mini" circle></el-button>&nbsp;&nbsp;
            </div>
        </div>
    </div>
</template>
<script>
import Vue from 'vue'

import * as api from '@/utils/api'
import listMixin from "./ListMixin";
import { mapGetters, mapState, mapMutations } from 'vuex'
import {AgGridVue} from "ag-grid-vue";

export default {
    name: 'new-aggrid',
    props: ['gridOptions','loadData','setGridColumns','shellFactory','onDoubleClicked','onRightClicked','sortFactory','toolbarMessageFactory','showStatusBar'],
}

</script>