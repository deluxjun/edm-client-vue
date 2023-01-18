<template>

</template>
<script>
import {mapGetters, mapState} from 'vuex'
import * as api from '@/utils/api'
import Utils from '@/utils/utils'
export default {
  name: 'addbookmark',
  computed: {
    ...mapState(['selected'])
  }, 
  data: function () {
    return {
      selectedList:null
    }
  },
  methods:{
    addBookmark:function(object_id,type){
        Utils.changeBookmarkLogo(object_id,true,true);
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
        var type=this.selectedList[0].docTypeName || "FOLDER"; //from treeview
        if(type=="FOLDER"){
            this.addBookmark(this.selectedList[0].r_object_id,0);
        }
        else{
            this.addBookmark(this.selectedList[0].r_object_id,1);
        }
    }
    else this.close();
  }
}
</script>
