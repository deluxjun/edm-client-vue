<template>
    <el-dialog id="category-dialog" ref="windowRef" 
      :title="title" :width='width' :before-close="onClose" :visible.sync="dialogVisible">
      <sel-category :containerHeight='containerHeight' 
        @selected="onSelected">
      </sel-category>

      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="selectAndClose()" id="uploadBtn">{{ $t('buttons.ok') }}</el-button>
        <el-button @click="onClose">{{ $t('buttons.close') }}</el-button>
      </span>

    </el-dialog>
    

</template>

<script>
export default {
  name: 'CategoryDialog',
  props: {
    title: String,
    width: {
      default: '50%',
      type: String
    },
    containerHeight: String,
  },
  data() {
    return {
      dialogVisible : false,
      selectedData: null
    }
  },
  components : {
    'sel-category' : () => import('./CategoryTree.vue')
  },
  mounted() {
    this.dialogVisible = true
  },
  computed: {
  },
  methods : {
    onClose(e) {
      console.log('closed')
      this.$close(null)
    },
    onSelected(data) {
      console.log(data)
      this.selectedData = data
    },
    selectAndClose() {
      this.$close(this.selectedData)
    }
  }
}
</script>

<style>
#category-dialog .el-dialog__body {
  padding-left: 20px;
}

</style>