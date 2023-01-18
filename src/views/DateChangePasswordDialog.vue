<template>
  <el-dialog id="CustomUserDialog" ref="windowRef"
    :title="title" :width="width" :visible.sync="dialogVisible" :close-on-press-escape="closeState" :close-on-click-modal="closeState" :show-close="closeState" v-draggable:before-close="closeState" :fullscreen="false">
      <div class='msg-view'>
      {{  $t('dealim.msg1') }}<br>
      {{  $t('dealim.msg2') }}<br>
      {{  $t('dealim.msg3') }}<br>
      {{  $t('dealim.msg4') }}<br>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dealimCustomProfileDialog()">{{ $t('buttons.change') }}</el-button>
        <el-button @click="logout()">{{ $t('buttons.cancel') }}</el-button>
      </div>
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
import auth from '@/utils/auth'
import CUSTOM_PROFILE_DIALOG from '@/views/CustomUserDialog'

const customProfileDialog = create(CUSTOM_PROFILE_DIALOG)

export default {
  name: 'dataChangeDialog',
  props: {
    closeState:{
      default: false,
      type: Boolean
    },
    width: {
      default: '30%',
      type: String
    },
    containerHeight: String,
    type: String,
    userName_prop: String,
  },
  data: function () {
    return {
      dialogVisible: true,
    }
  },
  components:{
   
  },
  computed: {
     ...mapState(['user']),
    inituserId(){
      return this.user.userId
    },
  },
  mounted(){
    this.init()
  },
  methods: {
    init(){
     
    },

    async dealimCustomProfileDialog(){
            this.close();
            let setting={
              type: 'MUST_CHANGE_PW',
              width: '40%', containerHeight: '400px',
              userName_prop: this.inituserId,
              closeState: false,
            }
            const result = await customProfileDialog(setting);
            if(result){
              
            }
    },
    close() {
      this.dialogVisible=false;
      this.$store.commit('closeHovers')
    },
    logout: auth.logout,
  }
}
</script>

<style>
.msg-view{
  font-size: 15px;
  font-weight: 700;
  padding: 10px;
}
</style>