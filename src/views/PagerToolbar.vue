<template>
<div id="toolbar-item" :title="longStatusMessage">
  <span>{{ statusMessage }} </span>
</div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import constants from '../Constants';
import * as api from "@/utils/api";
import * as actions from "@/utils/actions";

export default {
  name: 'pagertoolbar',

  data: function() {
    return {
      statusMessage: '',
      longStatusMessage: ''
    }
  },
  computed: {
  },
  methods: {
    listChanged(items) {
      console.log('pagerToolbar listChanged ' + items.length)
      if (!items || items.length < 1){
        this.statusMessage = ''
        return null
      }
      let header = ''
      let longheader=''
      let totalSize = 0
      if (items.length == 1) {
        header = this.$t('label.selected', {name: this.$Utils.truncate(items[0].object_name,200)})
        longheader = this.$t('label.selected', {name: items[0].object_name})
        if (items[0].r_content_size)
          totalSize = items[0].r_content_size
      }
      else {
        header = this.$t('label.selectedWithCount', {name: this.$Utils.truncate(items[0].object_name,200), count: items.length})
        longheader = this.$t('label.selectedWithCount', {name: items[0].object_name, count: items.length})
        items.forEach(element => {
          if (element.r_content_size)
            totalSize += Number(element.r_content_size)
        });
      }
      if (totalSize > 0)
        header += ' ' + this.$Utils.filesize(totalSize)
      this.statusMessage = header
      this.longStatusMessage= longheader
    }
  },
  mounted(){
  }
}
</script>
<style>
</style>
