<template>
    <kendo-grid :id="gridIds" ref="grid"
      :data-source='sharedDataSource()'
      :pageable-numeric='false'
      :pageable-previous-next='false'
      :pageable-messages-display='initMessage'
      :pageable-refresh='true'
      :selectable="gridSelectable"
      :navigatable='false'
      :columnResize='columnResizeSave'
      :key='true'
      :sortable='true'
      :sort="sortOption"
      :resizable='true'
      :columns='gridColumns'
      :scrollable-endless='true'
      :auto-bind='false'
      :noRecords='emptyMessage'
      @change='handleChange'>
    </kendo-grid>
</template>

<script>
import Vue from "vue";

import * as api from "@/utils/api";
import Utils from '@/utils/utils';
import { mapState, mapMutations } from "vuex";
import { Grid, GridInstaller } from "@progress/kendo-grid-vue-wrapper";
import { Upload, UploadInstaller } from '@progress/kendo-upload-vue-wrapper'


import listMixin from "./ListMixin";
import constants from '../Constants';

Vue.use(GridInstaller);


export default {
  name: "grid-view",
  mixins: [listMixin],
  components: {
    Grid
  },
  props: {
      gridIds: {
            default: 'main-kendoGrid',
            type: String
      },
      gridSelectable :{
             default: constants.SELECTABLE.MULTIPLE,
             type: String
      },
      isFolder: {
                default : null,
                type : Boolean
      },
      dialogHeight:{
          default: '450px',
          type: String
      }
  },
  computed: {
    ...mapState(['loading'])
  },
  watch:{
    rootId:function(){
      this.emptyMessage.template=constants.LISTGRID_EMPTY_MESSAGE_FACTORY(this.rootId,this.currentDir);
    }
  },
  data: function() {
    return {
      grid: null,
      gridInitialized: false,
      gridColumns : [],
      emptyMessage:{template:constants.LISTGRID_EMPTY_MESSAGE_FACTORY(this.rootId,this.currentDir)},
      oldRootId : null
    };
  },
  created() {
    console.log('grid created')
    this.initColumns()
  },
  mounted() {
    this.initPagerToolbar()
    Event.off(EventList.GRID_AUTOFIT);
    Event.listen(EventList.GRID_AUTOFIT,this.autoFit);
    //main-grid 아닐경우 높이지정
    this.gridHeight()
  },
  beforeDestroy() {},
  methods: {
     ...mapMutations(['setColumnOption']),
    initColumns() {
      this.setColumns();

      // if (this.gridSelectable)
      //   this.gridColumns.splice(0,0, {selectable: true, width: "50px"})

      if(this.type === 'main') {
        // add context menu column
        let currentVue = this
        let commands = [{name:'actions', text:'', iconClass: "k-icon k-i-more-vertical", click: (e) => {this.openContextExt(e, currentVue.grid)}}]
        //this.gridColumns.push({ title: '&nbsp;', command: commands, width: 50 })
      }
    },
    setColumns(){
      if (this.oldRootId == this.rootId)
        return

      var obj=this;
      let type="COMMON";
      if (this.rootId=="approval" || this.rootId=="request" || this.rootId=="complete"){
        type="APPROVAL";
      }
      if (this.rootId=="trash"){
        type="TRASH"
      }
      /*else if (this.rootId=="receivedShare") {
        type="RECVSHARE"
      }*/
      this.gridColumns = this.$Constants.PREDEFINED_COLUMNS_FIX(type)
      let enablePath = this.$Constants.FEATURES_PATH(this.rootId)
      let found = this.gridColumns.find(e => {return e.field === 'r_folder_path'})
      if ( enablePath && !found ){
        this.gridColumns.splice(3,0, this.$Constants.GRID_COLUMN.PATH)
      } else if (!enablePath && found) {
        this.gridColumns.splice(2,1)
      }
    },
    loadData() {
        this.loadDataDefault()
        if (this.grid._endlessPageSize)
            this.grid._endlessPageSize = this.viewOption.pageSize
    },
    onDataBound: function(e) {
      this.onDefaultDataBound();
      // set grid status message
      if (this.$refs.pager)
        this.$refs.pager.kendoWidget().options.messages.display= this.getPageMessage()
      // kendo오류가 있어서 바로 갱신이 안되어 jquery로 바로 갱신함
      if ($("#"+this.gridIds+" .k-pager-info")[0])
        $("#"+this.gridIds+" .k-pager-info")[0].textContent = this.getPageMessage()
      this.grid.autoFitColumn(0); // indicator auto fit

       //checkbox 구분
       if(this.$Utils.features('listselectbox')){
          //Utils.allcheckbox();
          Utils.selectedboxClick('grid');
       }
       //$('.k-scrollbar').scrollTop(0);
    },
    open: function(ev) {
      this.openDefault(ev, this.grid)
    },
    clearSelection() {
      this.grid.clearSelection();
      this.setSelected([])
    },
    openContextExt(e, source){
      source.clearSelection();
      source.select($(e.currentTarget).closest('tr')[0])
      this.openContext(e, source)
    },
    sortOption(e){
      console.log(e);
    },
    handleChange(arg) {
      let vue = this
      let selectedItems = $.map(vue.grid.select(), function(item) {
          return vue.grid.dataItem(item);
      });

      // call filefolders dialog's event
       this.$emit('changed', selectedItems)

       this.handleChangeDefault(arg, selectedItems)

      //checkbox 구분
      if(this.$Utils.features('listselectbox')){
        Utils.selectedCheckbox();
      }
    },
    columnResizeSave(e){
      if(e.column){
        if(e.column.field){
            //e.column.field+":"+e.newWidth
            //this.setColumnOption(column);
        }
      }
    },
    onMouseDownExtended(ev, target, source) {
      if (ev.button == 2) {
        //mouse right-click
        if ($(target).hasClass("k-state-selected")) {
          // 이미 선택되어 있으면 해당 건에 대해서 context open해야하므로, 아무것도 하지 않음
        } else {
          this.clearSelection();
        }
      } else if (ev.button == 0) {
        //mouse left-click
        if ($(target).hasClass("k-state-selected")) {
          return;
        }
      }
      this.onMouseDown(ev, target, source);
    },
    init() {
      this.pageNum = 1;
      let vue = this;
      if (!this.gridInitialized) {
        this.grid = $("#"+this.gridIds).data("kendoGrid");
        // set source. used contextmenu
        this.source = this.grid

        if (this.type == 'main') {
          $("#"+this.gridIds).dblclick(this.open);

          // 그리드의 빈 공간 우클릭하면 부모 폴더의 액션이 나와야 함
          $("#"+this.gridIds).on("mouseup", ".k-grid-content", function(ev) {
            if (ev.button == 2) {
              ev.preventDefault();
              // clear selection
              vue.clearSelection();
              // open context
              vue.openContext(ev, null, constants.ATTRIBUTE.CURRENT_DIR)
              // Event.fire(EventList.OPEN_CONTEXT, {event: ev,from:constants.ATTRIBUTE.CURRENT_DIR})
            }
          });
          // mouse event
          $("#"+this.gridIds).on("mouseup", "tr[role='row']", function(ev) {
            vue.onMouseDownExtended(ev, this, vue.grid);
          });
        }
        this.gridInitialized = true;
        console.log("grid init");
      }
    },
    autoFit(idx){
      this.grid.autoFitColumn(idx || 0);
    },
    gridHeight(){
      if(this.gridIds!='main-kendoGrid'){
         var gridElement = $("#"+ this.gridIds);
         var dataArea = gridElement.find(".k-grid-content");
         var newHeight = this.dialogHeight
         var diff = gridElement.innerHeight() - dataArea.innerHeight();
         gridElement.height(newHeight);
         dataArea.css('height',newHeight - diff);
      }
    },
  }
};
</script>
<style>
#main-gridView {
        height: calc(100% - 45px);
}
#main-grid-pager {
        height: 45px;
}

.ui-grid-cell-contents-auto {
     /* Old Solution */
    /*min-width: max-content !important;*/

    /* New Solution */
    display: grid;
    grid-auto-columns: max-content;

    /* IE Solution */
    display: -ms-grid;
    -ms-grid-columns: max-content;
}
.grid-icon {
  margin-right: 5px;
}


.k-button-icontext .k-icon, .k-button-icontext .k-image, .k-button-icontext .k-sprite {
  margin: 0px;
}


</style>
