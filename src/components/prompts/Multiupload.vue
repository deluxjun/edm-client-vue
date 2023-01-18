<template>
    <el-dialog ref="windowRef"
      :title="title" :width='width' :before-close="onClose" :visible.sync="dialogVisible" v-draggable>
      <filefolders :containerHeight='containerHeight' v-bind="$props"  :isFolder="isFolder" :isRoad='true'
        @notifySelected="onSelected">
      </filefolders>

      <span slot="footer" class="dialog-footer">
        <el-button @click="onClose">{{ $t('buttons.close') }}</el-button>
      </span>

    </el-dialog>


</template>

<script>
import Constants from '@/Constants'
export default {
  name: 'multipleUploadDialog',
  props: {
    width: {
      default: '50%',
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
      selectedData: false,
      title: this.$t('prompts.multipleUpload')
    }
  },
  components : {
    'filefolders' : () => import('@/views/MultiuploadContent.vue')
  },
  mounted() {
    this.dialogVisible = true
  },
  computed: {
  },
  methods : {
    onClose(e) {
      this.$store.commit('closeHovers')
    },
    onSelected(data) {            
      this.selectedData = data
    },
  }
}
</script>

<style>

</style>
