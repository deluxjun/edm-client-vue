<template>
  <div></div>
  <!-- 아무것도 없으면 콘솔에 에러표시됨 -->
</template>
<script>
import {mapGetters, mapState} from 'vuex'

export default {
  name: 'customURL',
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
      alert();
    },
    close(){
      this.$store.commit('closeHovers')
    }
  },
  mounted() {
    this.selectedList=Utils.getCurrentSelect();
    this.init();
    this.close();
  }
}
</script>
