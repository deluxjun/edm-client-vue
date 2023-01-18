<template>
    <el-dialog id="propertyDialog" v-show="!isLoading" ref="windowRef"
      :title="title" :width='width' :before-close="onClose" :visible.sync="dialogVisible" v-draggable>
      <property :containerHeight='containerHeight' :elementIds="elementIds" :argElements="argElements" @loaded="loaded" @reload="reload" @close="onClose">
      </property>

      <span slot="footer" class="dialog-footer">
        <el-button @click="onClose">{{ $t('buttons.close') }}</el-button>
      </span>

    </el-dialog>


</template>

<script>
export default {
  name: 'PropertyDialog',
  props: {
    title: String,
    width: {
      default: '60%',
      type: String
    },
    containerHeight: {
      default: '100%',
      type: String
    },
    elementIds: {
      required: true,
      type: Array
    },
    argElements:{
      required: true,
      type: Array
    },
    dynamic: {  // createDialog 로 생성되면 true
      default: true,
      type: Boolean
    }
  },
  data() {
    return {
      dialogVisible : true,
      requestReload: false,
      isLoading: true,
    }
  },
  components : {
    'property' : () => import(/* webpackChunkName: "property" */ './Property.vue')
  },
  mounted() {
  },
  computed: {
  },
  created() {
  },
  methods : {
    onClose(e) {
      this.isLoading = true
      if (this.dynamic){
        this.$close({requestReload: this.requestReload})
        this.$store.commit('closeHovers')
      }else{
        this.$store.commit('closeHovers')
      }
    },
    loaded() {
      this.isLoading = false
    },
    reload() {
      this.requestReload = true
    }
  }
}
</script>

<style>
#propertyDialog .el-dialog{
  margin-top: 3vh !important;
}
</style>
