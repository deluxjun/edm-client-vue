<template>
   <el-dialog id="userDialog" ref="windowRef"
    :title="title" :width='width' :visible.sync="dialogVisible" v-draggable:before-close="close" :fullscreen="true">
   <el-tag type="warning" style="width:100%; padding:5px;height:45px;">
     <b class="font20">[{{title}}]</b> {{ $t('label.overlapdesc') }}.
    <el-button type="danger" size="small" @click="alldelete()" class="delBtn">{{ $t('buttons.alldelete') }}</el-button>
   </el-tag>
  </el-dialog>
</template>
<script>
import {mapGetters, mapState} from 'vuex'

export default {
  name: 'duplicate-document',
  computed: {
    ...mapState(['selected'])
  },
  data: function () {
    return {
      selectedList:null,
      dialogVisible: true,
      title: '',
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
      this.selectedList=Utils.getCurrentSelect();
      this.elemetnid=this.selectedList[0].r_object_id;
      this.title=this.selectedList[0].object_name
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
