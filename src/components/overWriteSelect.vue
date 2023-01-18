<template>
<div class='overWriteDialog'>
   <el-radio v-model="check" label="overwrite" @change="handleRadio()" border><i class='k-icon k-i-check'></i> {{ this.$t('messages.overwrite') }}
    <span class='allowRename'>({{ $t('messages.overWriteComment') }})</span>
   </el-radio>
   <el-radio v-model="check" label="skipfile" @change="handleRadio()" border><i class='k-icon k-i-rotate'></i> {{ this.$t('messages.skipfile')}}
    <span class='allowRename'>({{ $t('messages.skipFileComment') }})</span>
   </el-radio>
   <el-radio v-model="check" label="allowRename" @change="handleRadio()" border><i class='k-icon k-i-copy'></i> {{ this.$t('messages.allowRename')}}
   <span class='allowRename'>({{ $t('messages.allowRenameComment') }})</span>
   </el-radio>
   <span class='overwriteMessage'>(※ {{ $t('label.overwriteMessage') }})</span> 
</div>
</template>

<script>
import Vue from 'vue'
import url from '@/utils/url'
import Utils from '@/utils/utils'
import * as api from '@/utils/api'
import { mapState } from 'vuex'
import Constants from '@/Constants'
import { localeData } from 'moment';

export default {
  name: 'overWriteSelect',
  props: {
    setting:{
      default: 'overwrite',
      type: String
    }
  },
  data: function () {
    return {
      check: 'overwrite'
    }
  },
  mounted(){
    this.check=this.setting
  },
  methods: {
    handleRadio(){
      console.log(this.check);
      this.$emit('onSelectedRadio',this.check);
    }
  }
}
</script>

<style>
.overWriteDialog{
  margin-top: 2px;
}
.overWriteDialog .el-radio{
  margin-left: 0px !important;
  width: 100% !important;
  margin-bottom: 3px;
}
.allowRename{
    font-size: 7pt;
    color: #ccc;
    float: right;
}
.el-radio.is-bordered{
  height: 43px !important;
}
</style>

