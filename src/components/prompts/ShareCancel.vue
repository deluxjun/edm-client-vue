<template>
  <div></div>
</template>
<script>
import {mapGetters, mapState} from 'vuex'

export default {
  name: 'sharecancel',
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
    cancelShare:function(eid){
      api.deleteURLShare(eid, false)
        .then(data=>{
          Utils.showResultMessage(true);
          if(this.$store.state.viewOption.view == "table") {
            Event.fire(EventList.TABLE_REFRESH)
          }else {
            Event.fire(EventList.RELOAD_DIR)
          }
        }).catch(err=>{
        })
    },
    close(){
      this.$store.commit('closeHovers')
    }
  },
  mounted() {
    this.selectedList=Utils.getCurrentSelect();
    this.cancelShare(this.selectedList[0].r_object_id);
    this.close();
  }
}
</script>
