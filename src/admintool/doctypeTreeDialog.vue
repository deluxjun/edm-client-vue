<template>
  <el-dialog id="doctypeDialog" ref="windowRef"
    :title="title" :width='width' :visible.sync="dialogVisible" v-draggable:before-close="close">
     <div class="doc-tree">
      <doctypePage :showType="'tree'" @selected="onSelected"></doctypePage>
     </div>
     <el-button type="primary" @click="selectedAndClose()">{{ $t('buttons.ok') }}</el-button>
     <el-button @click="close()">{{ $t('buttons.cancel') }}</el-button>
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
import UserGroup from '@/views/UserGroup'
import doctypePage from '@/admintool/doctype'

export default {
  name: 'doctypeDialog',
  props: {
    title: String,
    width: {
      default: '50%',
      type: String
    },
    containerHeight: String,

  },
  data: function () {
    return {
      dialogVisible: true,
      docId : ''
    }
  },
  components:{
    doctypePage,
  },
  mounted(){

  },
  methods: {
    close() {
      this.dialogVisible=false;
      this.$store.commit('closeHovers')
    },
    onSelected(data) {
      this.docId=data.id;
    },
    selectedAndClose: function (event) {
        this.$close(this.docId);
    }
  }
}
</script>

<style>
.doc-tree{
  margin-bottom: 7px;
}
.doc-tree .admindoctype-left{
  float: inherit !important;
  width: 100% !important;
}
</style>

