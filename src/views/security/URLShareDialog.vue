<template>
  <el-dialog
    :title="filename"
    width="40%"
    :visible.sync="dialogVisible" v-draggable
    >
    <div class='urlsharebox'>
     <el-input type="textarea" :autosize="{ minRows: 3, maxRows: 10}" :value="url" style="width:80%" :id="str" :readonly="true"></el-input>
     <el-button type="mini" @click="copyToClipboard">{{ $t('share.copyURL') }}</el-button>
    </div>
  </el-dialog>
</template>

<script>
import Vue from 'vue'
import url from '@/utils/url'
import * as api from '@/utils/api'
import { mapState } from 'vuex'
import Utils from '@/utils/utils'
import Constants from '../../Constants'

export default {
  name: 'urlshare',
   data: function () {
    return {
      url:"",
      str:"",
      filename: this.$t('prompts.urlshare'),
      dialogVisible: true,
    }
  },
  props: {
    linkURL : String,
  },
  components:{
  },
  computed: {
   
  },
  methods: {
    copyToClipboard(){
      var copyText = document.getElementById(this.str);
      copyText.select();
      document.execCommand("copy");
      this.close();
      vue.$message(vue.$t('messages.copyToClipboard', { target: 'URL' }));
      console.log('복사');
    },
    close() {
      this.$store.commit('closeHovers')
      this.dialogVisible=false;
    },
  },
  mounted() {
    this.url=this.linkURL;
    let date= Utils.idDate();
    this.str="url_text_"+date
  }
}
</script>

<style>
#share-div .el-input input {
  height: 40px;
}
.urlsharebox{
  margin: 10px;
}
</style>
