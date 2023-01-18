<template>
  <div></div>
  <!-- 아무것도 없으면 콘솔에 에러표시됨 -->
</template>
<script>
import {mapGetters, mapState} from 'vuex'
import * as api from '@/utils/api'
import Utils from '@/utils/utils'

export default {
  name: 'encrypt',
  computed: {
    ...mapState(['selected'])
  },
  data: function () {
    return {
      selectedList:null,
      dialogVisible: true
    }
  },
  methods:{
    init(){
      let selectedList=Utils.getCurrentSelect();
      let eid = selectedList[0].r_object_id;
      api.customDRM(eid,'drm.encrypt.url','url').then(data => {
          if(this.$store.state.viewOption.view == "table") {
            Event.fire(EventList.TABLE_REFRESH)
          }else {
            Event.fire(EventList.RELOAD_DIR)
          }
      }).catch((error) => {
          console.log(error);
      })
    },
    close(){
      this.$store.commit('closeHovers')
    }
  },
  mounted() {
    this.init();
    this.close();
  }
}
</script>
