<template>
   <el-dialog id="ovelapDialog" ref="windowRef" style="width:100%;"
    :title="$t('search.overlaptext')" width='width' :visible.sync="dialogVisible" v-draggable:before-close="close" :fullscreen="true">
        <OverlapList :mode="mode" :elementName="elementName"></OverlapList>
  </el-dialog>
</template>
<script>
import {mapGetters, mapState} from 'vuex'
import OverlapList from '@/views/OverlapList'

export default {
  name: 'ovelapDialog',
  computed: {
    ...mapState(['selected'])
  },
  components: {
    OverlapList
  },
  props: {
    mode: String,
    elementName: String,
  },
  data: function () {
    return {
      selectedList:null,
      dialogVisible: true,
      width: '100%',
      elemetnid: ''
    }
  },
  mounted() {
    this.init();
  },
  methods:{
    close(){
      this.$store.commit('closeHovers')
    },
    alldelete(){
      
    },
    init(){
      this.title=this.title_prop;
      // this.selectedList=Utils.getCurrentSelect();
      // this.elemetnid=this.selectedList[0].r_object_id;
      // this.title=this.selectedList[0].object_name
    }
  },
 
}
</script>

<style lang="scss">
.delBtn{
  float: right;
  right: 10px;
}
.font20{
  font-size: 20px;
}
</style>
