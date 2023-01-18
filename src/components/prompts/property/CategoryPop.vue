<template>
  <el-dialog
    :title="$t('prompts.property')"
    width="45%"
    :visible.sync="dialogVisible" v-draggable
    :before-close="handleClose"
    >
  </el-dialog>
</template>

<script>
import Vue from 'vue'
import url from '@/utils/url'
import * as api from '@/utils/api'
import { mapState } from 'vuex'
import Utils from '@/utils/utils'
import {
  Form,
  FormItem,
  Input,
  Radio,
  Checkbox,
  Select,
  Option,
  Button
} from 'element-ui'

export default {
  name: 'categoryPop',
  props: ['categoryPop'],
  data: () => ({
    showModal: false
  }),
  components: {
  },
  computed: {
    ...mapState(['selected']),
  },
  methods: {
  },

  mounted() {
  }
}
</script>
<style>
</style>
