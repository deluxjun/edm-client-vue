<template>
  <div></div>
  <!-- 아무것도 없으면 콘솔에 에러표시됨 -->
</template>
<script>
import {mapGetters, mapState} from 'vuex'

export default {
  name: 'download',
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
      console.log(object_id);
      let eid=object_id[0].r_object_id;
      let isFolder=object_id[0].isFolder;
      let url=`${store.state.baseURL}/json/download?from=${store.state.rootId}&elementId=`+encodeURI(eid)
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
      let url=`${store.state.baseURL}/json/download?elementId=${encodeURI(elementIds)}&sid=${Utils.getCookie('auth')}&from=${store.state.rootId}`
      Utils.fileDownload(url)
    },
    downloadMultipleDivision:function(object_id){
      var elementIds="";
      for(var i=0;i<object_id.length;i++){
        this.fileopenDownload(object_id[i].r_object_id);
      }
    },
    fileopenDownload(object_id){
	    var elemIF = document.createElement("iframe");
    	elemIF.src = `${store.state.baseURL}/json/download?from=${store.state.rootId}&elementId=${encodeURI(object_id)}`
	    elemIF.style.display = "none";
	    document.body.appendChild(elemIF);
    },
    close(){
      this.$store.commit('closeHovers')
    }
  },
  mounted() {
    this.selectedList=Utils.getCurrentSelect();
    var count=this.selectedList.length
    if(count==1){
      //this.downloadSingle(this.selectedList[0].r_object_id);
      this.downloadSingle(this.selectedList);
    }
    else if(count>1){
      this.downloadMultiple(this.selectedList);
      //this.downloadMultipleDivision(this.selectedList);
    }
    this.close();
  }
}
</script>
