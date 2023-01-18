<template>
  <el-dialog id="groupwareDialog" ref="windowRef"
    :title="title" :width='width' :visible.sync="dialogVisible" v-draggable:before-close="close" @close="close" :fullscreen="false">
    <div id='groupwareFrame'></div>
  </el-dialog>
</template>

<script>
import Vue from 'vue'
import url from '@/utils/url'
import Utils from '@/utils/utils'
import * as api from '@/utils/api'
import { mapState } from 'vuex'
import Constants from '@/Constants'
import { localeData } from 'moment';
import { create } from 'vue-modal-dialogs'

export default {
  name: 'groupwareDialog',
  props: {
    title: String,
    width: {
      default: '700px',
      type: String
    },
    containerHeight: String,
    data : Object
  },
  data: function () {
    return {
      dialogVisible: true,
      calcHeight: "550px",
      url : '',
      postdata :''
    }
  },
  mounted(){
    Event.off(EventList.GROUPWARECLOSE)
    Event.listen(EventList.GROUPWARECLOSE,this.close)
    this.$nextTick(() => {
        // 여기에 코드 넣기
        //this.calcHeight=($("#edrm-main").height()-36)+"px";
        console.log(this.data);
        this.url=this.data.url;
        this.postdata=this.data.data;

        var form = document.createElement("form");
        let param= this.postdata;
        form.action = this.url;
        form.method = 'POST';
        form.target = "groupwareframe";
        if (param) {
                      for (var key in  param) {
                        var input = document.createElement("textarea");
                        input.name = key;
                        input.value = typeof  param[key] === "object" ? JSON.stringify(param[key]) : param[key];
                        console.log(input.value);
                        form.appendChild(input);
                      }
        }
        form.style.display = 'none';

        var aIframe = document.createElement("iframe");

        aIframe.setAttribute("id","groupwareframe");
        aIframe.setAttribute("name","groupwareframe");
        aIframe.style.width = "100%";
        aIframe.style.height = this.calcHeight;
        aIframe.frameBorder = 0;
        aIframe.border=0;
        aIframe.scrolling="no";
        aIframe.allowTransparency="false";
        aIframe.src = this.url;
        $('#groupwareFrame').append(aIframe);
        $('#groupwareFrame').append(form);
        form.submit();
    });
    
  },
  methods: {
    close() {
      console.log("확인");
      this.dialogVisible=false;
      this.$store.commit('closeHovers');
      $("#groupwareDialog").remove();
    },
  }
}
</script>

<style>
#groupwareframe{
  overflow-x:hidden; 
  overflow:auto; 
  width:100%; 
}
</style>

