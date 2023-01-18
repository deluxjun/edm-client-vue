<template>
    <div id="edrm-search">
           <Layoutscript></Layoutscript>
           <site-header></site-header>
           <kendo-splitter id="files-splitter" :orientation="'horizontal'" :panes="[{},{ }]">
            <div id="edrm-result">
              <edrm-list></edrm-list>
            </div>
           </kendo-splitter>
    </div>
</template>

<script>
import Vue from "vue";
import { Splitter } from "@progress/kendo-layout-vue-wrapper";
import { mapGetters, mapState, mapMutations } from "vuex";
import { DataSourceInstaller } from "@progress/kendo-datasource-vue-wrapper";
// import Toolbar from "./Toolbar";
import EdrmListGrid from "./ExternalList";
//import * as actions from "@/utils/actions";
import ContextMenu from "vue-context-menu";
import * as api from "@/utils/api";
import Utils from '@/utils/utils'
import Layoutscript from '@/views/LayoutScript'
import Prompts from '@/components/prompts/Prompts'
import SiteHeader from "@/views/ExternalSearchHeader";

Vue.use(DataSourceInstaller);

export default {
  name: 'search',
  components:{
    "edrm-list": EdrmListGrid,
    Layoutscript,
    SiteHeader
  },
  data: function () {
    return {
      searchView : 'search',
      data: {}
    }
  },
  computed: {
    ...mapState(['user'])
  },
  mounted() {
    // let search={"name":"","range":"title","r_creation_date":"","r_modify_date":""}
    // let data = {url: api.URLS.FULL_SEARCH, content: search}
    // Event.fire(EventList.SEARCH, data)
  },
  methods: {
    ...mapMutations(["setSelected", "setCurrentDir", "setCurrentDirName","setCurrentDirInfo", "addRoot","setReloadList","setRootId"]),
  }
}
</script>



<style lang="scss">
#edrm-search{
  width: 100%;
  height: 100%;
}
#files-splitter{
  height: calc(100% - #{$header-height});
  height: -o-calc(100% - #{$header-height}); /* opera */
  height: -webkit-calc(100% - #{$header-height}); /* google, safari */
  height: -moz-calc(100% - #{$header-height}); /* firefox */
}
#edrm-result{
  overflow: hidden;
}
#edrm-result .media-content{
  overflow: hidden !important;
}

</style>

