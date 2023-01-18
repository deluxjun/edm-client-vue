<template>
  <div></div>
  <!-- 아무것도 없으면 콘솔에 에러표시됨 -->
</template>
<script>
import {mapGetters, mapState} from 'vuex'

export default {
  name: 'goto',
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
    close(){
      this.$store.commit('closeHovers')
    }
  },
  mounted() {
    this.selectedList=Utils.getCurrentSelect();
    var url="/files";
    var count=this.selectedList.length
    if(count==1){
      var sel=this.selectedList[0];
      if(sel.isFolder){
        url+=sel.path;
      }
      else{
        url+=sel.path;
        url=url.replace(sel.r_object_id+'/',"");
      }
      this.$router.push(url);
    }
    this.close();
  }
}
</script>
