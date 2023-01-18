<template>
<div>
  <div class="form" style="width:100%;">
    <div id="iframeEditor">
    </div>
  </div>
  <!--<button @click="test"></button>-->
  </div>
</template>
<script>
import {mapGetters, mapState} from 'vuex'
import * as editor from '@/utils/editor.js'
import * as api from '@/utils/api'
export default {
  name: 'onlineedit',
  computed: {
    ...mapState(['selected'])
  },
  data: function () {
    return {
      object_id:"",
      selectedList:null,
      dialogVisible: true
    }
  },
  methods:{
    getDocumentInfo:function(){
      api.getOnlineEditInfo(this.object_id).then(data=>{
        data.docInfo.document.url="http://192.168.20.45:7080/xedrm"+data.docInfo.document.url+'&sid='+store.state.ticket
        data.docInfo.embedded.saveUrl="http://192.168.20.45:7080/xedrm"+data.docInfo.embedded.saveUrl+'&sid='+store.state.ticket
        editor.connectEditor(data.docInfo);
      }).catch(error=>{

      })
      
    }
  },
  mounted() {
    var editorServeraddr=store.state.info.onlineEditorServeraddr || "";
    let ckeditor = document.createElement('script');
    ckeditor.setAttribute('src',editorServeraddr+"/web-apps/apps/api/documents/api.js?lang=ko");
    document.head.appendChild(ckeditor);
    var path=this.$route.path.split('/');
    if(path.length==0) return;
    this.object_id=path[path.length-1];
    this.getDocumentInfo();
  }
}
</script>
