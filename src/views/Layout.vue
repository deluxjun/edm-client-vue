<template>
  <div id ="edrm-body">
    <Layoutscript></Layoutscript>
    <site-header></site-header>
    <router-view></router-view>
    <prompts></prompts>
    <dialogs-wrapper ref="dialogs" wrapper-name="default" />
    <script id="treeview-template" type="text/kendo-ui-template">
          #if(Utils.rootIconCheck(item.spriteCssClass)){#
             <i class='fa fa-folder treeFolderIcon'></i>
          #}#
          #: item.text #
    </script>      
  </div>


</template>

<script>
//import Search from "@/components/Search";
import {mapState} from 'vuex'

import SiteHeader from "@/components/Header";
import Prompts from '@/components/prompts/Prompts'
import Layoutscript from '@/views/LayoutScript'
// import Windows from '@/components/prompts/Windows'

export default {
  name: "layout",
  components: {
//    Search,
    SiteHeader,
    Prompts,
    Layoutscript,
    // Windows
  },
  computed: {
    ...mapState(['user'])
  },
  watch: {
    $route: function() {
      if (this.$store.state.show !== 'success') this.$store.commit('closeHovers')
      // close all popups
      let dialogs = this.$refs.dialogs.dialogs
      for (let dialogKey in dialogs) {
        dialogs[dialogKey].close();
      }
    }
  },
  mounted() {
  },

  beforeDestroy() {
  },
  methods : {
  }
};
</script>

<style>

#edrm-body {
  height: 100%;
}

.k-splitbar {
    background: transparent !important;
}
.k-treeview .k-in.k-state-focused {
    box-shadow: none;
}
</style>
