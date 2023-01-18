<template>
  <el-dialog
    :title="filename"
    width="65%"
    :visible.sync="dialogVisible" v-draggable
    :before-close="close"
    >
    <el-collapse id="share-div" v-model="activeNames">
      <el-collapse-item :title="$t('prompts.share')" v-if="showShare" name="share">
        <ShareCard :isURLShare="false" :showShare="this.showShare"></ShareCard>
      </el-collapse-item>

      <el-collapse-item :title="$t('prompts.urlshare')" v-if="showURLShare" name="url">
        <ShareCard :isURLShare="true" :showShare="this.showURLShare"></ShareCard>
      </el-collapse-item>
    </el-collapse>
   <span slot="footer" class="dialog-footer">
      <el-button @click="close()">{{ $t('buttons.cancel') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import Vue from 'vue'
import url from '@/utils/url'
import * as api from '@/utils/api'
import { mapState } from 'vuex'
import Utils from '@/utils/utils'
import SelectUserGroupDialog from '@/views/SelectUserGroupDialog'
import ShareCard from './ShareCard'
import Constants from '../../Constants'
import { create } from 'vue-modal-dialogs'
import moment from 'moment'

const userGroupDialog = create(SelectUserGroupDialog)

export default {
  name: 'share',
   data: function () {
    return {
      object_id:"",
      filename:"",
      version:"",
      dialogVisible: true,
      activeNames: ["share","url"],
      settingEvent:null,
    }
  },
  props: {
    containerHeight: String,
    menus: Object,
    elements : {
      default: [],
      type: Array
    }
  },
  components:{
    ShareCard
  },
  computed: {
    ...mapState(['selected','rootId']),
    showShare() {
      if (this.menus) {
        if (this.menus.manageSharing == 'Y' || this.menus.createSharing == 'Y')
          return true
      }
      return false
    },
    showURLShare() {
      if (this.menus) {
        this.selectedList=this.elements.slice()
        let urlShare =Utils.featuresDefault('prompt.urlshare', false);
        if(urlShare){
          let mgConnect = Utils.featuresDefault('mgConnect.websocket.open',false);
          if(mgConnect){
            return true
          }else{
            if(this.selectedList[0].r_object_type !== 'dm_folder'){
              return true
            }
          }
        }else{
          if(this.selectedList[0].r_object_type !== 'dm_folder'){
              return true
          }else{
              return false
          }
        }
       
      }
      return false
    }
  },
  methods: {
    close() {
      this.$store.commit('closeHovers')
      this.dialogVisible=false;
      $('.box-card').hide();
    },
  },
  mounted() {
    this.selectedList=this.elements.slice()
    this.$store.commit('setSharedContent', this.selectedList)
    this.object_id=this.selectedList[0].r_object_id;
    this.version=this.selectedList[0]["doc:Version"] || "";
    this.filename=this.selectedList[0].object_name;
  }
}
</script>

<style>
#share-div .el-input input {
  height: 40px;
}
</style>
