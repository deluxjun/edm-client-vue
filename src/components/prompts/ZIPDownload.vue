<template>
  <div></div>
  <!-- 아무것도 없으면 콘솔에 에러표시됨 -->
</template>
<script>
import {mapGetters, mapState} from 'vuex'

export default {
  name: 'zipdownload',
  computed: {
    ...mapState(['selected'])
  },
  data: function () {
    return {
      selectedList:null,
      dialogVisible: true
    }
  },
  methods:{
    downloadSingle:function(object_id){
      let eid=object_id[0].r_object_id;
      let url=`${store.state.baseURL}/json/download?from=${store.state.rootId}&elementId=`+eid
      Utils.fileDownload(url)
    },
    downloadMultiple:function(object_id){
      var elementIds="";
      var count=object_id.length;
      for(var i=0;i<count;i++){
        elementIds+=object_id[i].r_object_id;
        if(i<count-1){
          elementIds+=','
        }
      }
      let url=`${store.state.baseURL}/json/download?from=${store.state.rootId}&elementId=${elementIds}&sid=${Utils.getCookie('auth')}`
      Utils.fileDownload(url)
    },
    close(){
      this.$store.commit('closeHovers')
    }
  },
  mounted() {
    this.selectedList=Utils.getCurrentSelect();
    var count=this.selectedList.length
    this.downloadMultiple(this.selectedList);
    this.close();
  }
}
</script>
