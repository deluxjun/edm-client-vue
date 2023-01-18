<template>
    <div id="edrm-statistic">
    <el-tabs v-model="activeName" @tab-click="handleClick">
          <el-tab-pane :label="$t('Statistic.archive')" :name="$Constants.STATISTIC.arc">
             <arcPage v-if="type==$Constants.STATISTIC.arc"></arcPage>
          </el-tab-pane>
          <el-tab-pane :label="$t('Statistic.search_statistic')" :name="$Constants.STATISTIC.search">
              <searchPage v-if="type==$Constants.STATISTIC.search"></searchPage>
          </el-tab-pane>
    </el-tabs>
    </div>
</template>

<script>

import Vue from 'vue'
import url from '@/utils/url'
import * as api from '@/utils/api'
import { mapState,mapActions } from 'vuex'
import Utils from '@/utils/utils'

export default {
  name: "statistic",
  components: {
    'arcPage' : () => import('@/statistic/archive'),
    'searchPage' : () => import('@/statistic/search'),
  },
  data() {
    return {
      activeName : 'archive',
      type: 'archive',
    };
  },
  computed: {

  },
  mounted() {

  },
  methods: {
    handleClick(tab, event) {
      this.type=tab.name;
    },
  }
};
</script>

<style lang="scss">
#edrm-statistic{
  margin: 0 auto;
  width: 80%;
  margin-top : 10px;
}
</style>

