<template>
<div></div>
</template>

<script>
import {mapGetters, mapState} from 'vuex'
import * as api from '@/utils/api'
import mgCheck from '@/utils/MGCheckLogin'
import Utils from '@/utils/utils'

export default {
  name: 'checkout',
  computed: {
    ...mapState(['selected'])
  },
  data: function () {
    return {
      selectedList:null
    }
  },
  methods:{
    downloadWithCheckout:function(object_id){
      var obj=this;
      api.checkout(object_id)
      .then(data=>{
        let url=`${store.state.baseURL}/json/download?from=${store.state.rootId}&elementId=${object_id}&sid=${Utils.getCookie('auth')}`
        Utils.fileDownload(url)
        Utils.updateIndicator(object_id,'lock',obj.selectedList[0])
      }).catch(error=>{

      });
      this.close();
    },
    close() {
      this.$store.commit('closeHovers')
    }
  },
  mounted() {
    let checkPreview= Utils.featuresDefault('PreviewEdit',false)
    this.selectedList=Utils.getCurrentSelect();
    var count=this.selectedList.length
    if(checkPreview){
       //마이가드 설치 되었을 경우, 편집 누르면 파일 보이도록 하기.
      if(count==1){
        let mgConnect = Utils.featuresDefault('mgConnect.websocket.open',false);
        if(mgConnect){
          api.getDocInfo(this.selectedList[0].r_object_id)
          .then(data=>{
            let list=data.list
            let localPath=list[0].path.slice(1)+list[0].object_name
            let successCallback = function(){}
            let failCallCheckout = function(){
               var object_id=Utils.getCurrentSelect()[0].r_object_id;
               let url=`${store.state.baseURL}/json/download?from=${store.state.rootId}&elementId=${object_id}&sid=${Utils.getCookie('auth')}`
               Utils.fileDownload(url)
            }
            mgCheck.openDoc(successCallback,failCallCheckout,this.selectedList[0].r_object_id, localPath,"R")
          }).catch(error=>{})
          
        }else{
          var object_id=Utils.getCurrentSelect()[0].r_object_id;
          let url=`${store.state.baseURL}/json/download?from=${store.state.rootId}&elementId=${object_id}&sid=${Utils.getCookie('auth')}`
          Utils.fileDownload(url)
        }
      }  
    }
    this.close();
  }
}
</script>
