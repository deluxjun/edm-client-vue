<template>

</template>
<script>
import {mapGetters, mapState} from 'vuex'
import * as api from '@/utils/api'
import Utils from '@/utils/utils'
export default {
  name: 'removebookmark',
  computed: {
    ...mapState(['selected'])
  }, 
  data: function () {
    return {
      selectedList:null
    }
  },
  methods:{
    removeBookmark:function(object_id){
        Utils.changeBookmarkLogo(object_id,true,false);
        this.close();
    },
    close(){
        this.$store.commit('closeHovers')
    }
  },
  created() {
    this.selectedList=Utils.getCurrentSelect();
    var count=this.selectedList.length
    if(count==1){
        this.removeBookmark(this.selectedList[0].r_object_id,0);
    }
    else this.close();
  }
}
</script>
