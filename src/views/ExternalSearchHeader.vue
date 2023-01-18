<template>
<nav :class="['navbar is-transparent edrm-header', headerClassName]">
  <div class="navbar-brand">
    <span class="navbar-item brand-logo">
      <span class="x"></span><span>Search</span>
    </span>
  </div>
  <!-- <div id="navbarExampleTransparentExample" class="navbar-menu">
    <div class="navbar-end">
      <div id="searchKeyword" class="level-item">
        <search v-if="mainType === 'files'" ></search>
      </div>
    </div>
  </div> -->
</nav>
</template>

<script>
//import Search from './Search'
import {mapGetters, mapState} from 'vuex'
import * as api from '@/utils/api'
import buttons from '@/utils/buttons'
import auth from '@/utils/auth'
import Search from '@/views/Search'

export default {
  name: 'site-header',
  components: {
    Search
  },
  watch: {
    '$route'(val, oldValue) {
      this.handleRoute(val, oldValue);
    },
    reload: function() {
      this.reloadSelected();
    }
  },
  data: function () {
    return {
      width: window.innerWidth,
      pluginData: {
        api,
        buttons,
        'store': this.$store,
        'router': this.$router
      },
      mainType: 'files',
      prevUrl: null,
      volumeInfo: null,
    }
  },
  created () {
    window.addEventListener('resize', () => {
      this.width = window.innerWidth
    })
  },
  computed: {
    ...mapState([
      'info',
      'user',
      'currentDirInfo', 'rootId'
    ]),
    headerClassName () {
      if (!this.info.headerClassName)
        // return 'is-dark'
        return ''
      else
        return this.info.headerClassName
    },
  },
  mounted() {
    Event.fire(EventList.CUSTOM_SEARCH, 'externalSearch');
  },
  methods: {

  }
}
</script>

<style lang="scss">
.brand-logo {
    height: 54px;
}
.brand-logo span {
    //color: #fff;
    font-size: 32px;
    font-family: "warnock";
    font-weight: 900;
}
.brand-logo span.x {
    font-size: 37px;
    //color: #fff;
}
</style>
