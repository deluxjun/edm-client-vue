<template>
    <div id="edrm-search">
           <Layoutscript></Layoutscript>
           <site-header></site-header>
           <kendo-splitter id="search-splitter" :orientation="'horizontal'" :panes="[{}]">
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
import EdrmListGrid from "./ExternalListView";
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
    Event.fire(EventList.CUSTOM_TOOLBAR, 'hidden')
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
#search-splitter{
  height: 100%;
}
#edrm-result .media-content{
  overflow: hidden !important;
}

</style>

