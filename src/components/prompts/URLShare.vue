<template>
  <div>
    <el-input style="width:80%" id="url_text" :readonly="true"></el-input>
  </div>
</template>

<script>
import Vue from 'vue'
import url from '@/utils/url'
import * as api from '@/utils/api'
import { mapState } from 'vuex'
import Utils from '@/utils/utils'
export default {
  name: 'urlshare',
   data: function () {
    return {
      selectedList:null,
      name:'',
      dialogVisible: true,
      object_id: null,
      version: null,
    }
  },
  components:{
  },
  mounted() {
    this.selectedList=Utils.getCurrentSelect();
    this.object_id=this.selectedList[0].r_object_id;
    this.version=this.selectedList[0]["doc:Version"] || "";
    this.getURLShareInfo();
    this.close();
  },
  methods: {
    getURLShareInfo:function(){
      api.getURLShareInfo(this.object_id, true).then(data=>{
          if(data.linkURL){
            console.log(data.linkURL);
            this.copy_to_clipboard(data.linkURL);
            Utils.showResultMessage(true);
          }else{
            this.createURLShare();
          }
      }).catch(error=>{

      });
    },
    is_ie(){
      if(navigator.userAgent.toLowerCase().indexOf("chrome") != -1) return false;
      if(navigator.userAgent.toLowerCase().indexOf("msie") != -1) return true;
      if(navigator.userAgent.toLowerCase().indexOf("windows nt") != -1) return true;
      return false;
    },
    copy_to_clipboard(str){
       if( this.is_ie() ) {
          window.clipboardData.setData("Text", str);
          return;
      }
      prompt('Ctrl+C를 눌러 복사하세요.', str);
    },
    createURLShare:function(){
      var sendData={privs:[]};
      let expired=new Date().setFullYear(new Date().getFullYear() + 1);
      api.createURLShare(this.object_id,this.version,true,JSON.stringify(sendData),10,expired).then(data=>{
        data=JSON.parse(data);
        if(data.linkURL){
          this.copy_to_clipboard(data.linkURL);
          Utils.showResultMessage(true);
          Utils.updateIndicator(this.object_id,'urlshare',true)
        }
      }).catch(error=>{
        console.log(error)
      });
    },
    close(){
      this.$store.commit('closeHovers')
    }
  },
}
</script>
<style>
.label-custom > input{
  border : 0px;
}
.label-custom > textarea{
  border : 0px;
  color: darkgray;
  resize: none;
}
</style>
