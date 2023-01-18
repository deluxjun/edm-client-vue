<template>
   <el-dialog id="scan-dialog" ref="windowRef"
    title='스캔연결' :width='width' :visible.sync="dialogVisible" :before-close="setclose">
    <div style="height:300px">
      <div class='loadingview'>
        <i class='el-icon-loading' style="font-size:50pt;"></i><br>
        스캔 화면 연결 중입니다..
      </div>
    </div>
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
      title: '스캔 연결',
      width: '50%',
      elemetnid: ''
    }
  },
  mounted() {
    this.init();
  },
  methods:{
    setclose(){
      this.dialogVisible=false;
      this.$store.commit('closeHovers')
      console.log("닫기");
    },
    alldelete(){
      
    },
    init(){
  
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
.loadingview{
    width: 80%;
    margin: auto;
    top: 100px;
    text-align: center;
    position: relative;
}
</style>
