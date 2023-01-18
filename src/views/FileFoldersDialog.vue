<template>
    <el-dialog ref="windowRef"
      :title="title" :width='width' :before-close="onClose" :visible.sync="dialogVisible" v-draggable>
      <filefolders :containerHeight='containerHeight' v-bind="$props" :gridSelectable="gridSelectable" :isFolder="isFolder" :isRoad='true'
        @notifySelected="onSelected">
      </filefolders>

      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="selectAndClose()" :disabled="selectedData? false: true">{{ $t('buttons.ok') }}</el-button>
        <el-button @click="onClose">{{ $t('buttons.close') }}</el-button>
      </span>

    </el-dialog>


</template>

<script>
import Constants from '@/Constants'
export default {
  name: 'FileFoldersDialog',
  props: {
    title: String,
    width: {
      default: '70%',
      type: String
    },
    containerHeight: {
      default: '600px',
      type: String
    },
    type: String,
    disableList : Boolean,
    gridSelectable: {
          default: Constants.SELECTABLE.MULTIPLE,
          type: String
    },
    isFolder: {
      default : null,
      type : Boolean
    }
  },
  data() {
    return {
      dialogVisible : false,
      selectedData: null
    }
  },
  components : {
    'filefolders' : () => import('./FileFolders.vue')
  },
  mounted() {
    this.dialogVisible = true
  },
  computed: {
  },
  methods : {
    onClose(e) {
      this.$close(null)
    },
    onSelected(data) {            
      this.selectedData = data
      console.log(this.selectedData);
    },
    selectAndClose() {
      console.log("선택=======>");
      console.log(this.selectedData);
      this.$close(this.selectedData)
    }
  }
}
</script>

<style>

</style>
