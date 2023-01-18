<template>
<el-dialog ref="windowRef" :top="top" :title="$t('label.carryingOut')" width='800px' :before-close="onClose" :visible.sync="dialogVisible" v-draggable>
<el-container :style="{'max-height': containerHeight, 'min-height': '300px'}" >

  <el-main v-loading="isLoading">

    <file-card v-if="element" :element="element">
    </file-card>
    <div v-if="elements && elements.length > 1" class="text-block">
      <h3 class="h3">{{ multipleMessage }}</h3>
    </div>

    <el-form v-if="model" :model="model" ref="form" label-width="150px" :show-message="false">

      <div id="carringOutDate" class="margin-top10" style="margin-top: 30px">
        <el-form-item :label="$t('label.draftPeriod')" prop='expiry' :rules='{required: true, trigger: "blur"}'>
          <!-- <el-date-picker v-model="model.expiry" type="date"
            :clearable="false" :editable="false" :picker-options="pickerOptions"
            format="yyyy-MM-dd" value-format="yyyy-MM-dd">
          </el-date-picker> -->
          <el-date-picker
            v-model="model.expiry"
            type="daterange"
            align="left"
            unlink-panels
            size="small"
            range-separator="||"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            :start-placeholder="$t('adminMenu.history_start')"
            :end-placeholder="$t('adminMenu.history_end')"
            :picker-options="pickerOptions2">
          </el-date-picker>
        </el-form-item>
        <el-form-item :label="$t('label.user')" prop='authorId' :rules='{required: true, trigger: "blur"}'>
          <el-input :value="tempName" class="label-custom" @click.native="selectUser" readonly>
            <i class="el-icon-edit el-input__icon" slot="prefix"></i>
          </el-input>
        </el-form-item>
      </div>
    </el-form>

  </el-main>
</el-container>

    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="carryingOut" :disabled="!validate()">{{ $t('buttons.ok') }}</el-button>
      <el-button @click="onClose" >{{ $t('buttons.close') }}</el-button>
    </span>

</el-dialog>

</template>

<script>
import Vue from 'vue'
import * as api from '@/utils/api'
import { mapState, mapActions } from 'vuex'
import FileCard from '@/views/FileCard'

import {
  Form,FormItem,Input,Radio,Checkbox,Select,Option,Button
} from 'element-ui'

import SelectUserGroupDialog from '@/views/SelectUserGroupDialog'
import { create } from 'vue-modal-dialogs'

const userDialog = create(SelectUserGroupDialog)

export default {
  name: 'carryingout',
  props: {
    argElements : {
      type: Array
    },
    containerHeight: {
      default: '80vh',
      type: String
    },
    dynamic: {  // createDialog 로 생성되면 true
      default: true,
      type: Boolean
    }
  },
  data: function () {
    return {
      element: null,
      elements: [],
      tempName: '',
      model : {
        authorId: '',
        expiry: ''
      },
      dialogVisible : true,
      top : '50px',
      isLoading: true,
      hasError: false,            // 에러 여부
      errorMessage: '',           // 에러 메시지
      pickerOptions2: {
          disabledDate(time) {
            var settingDate = new Date();
            settingDate.setDate(settingDate.getDate()-1);
            return time.getTime() < settingDate;
          },
          shortcuts: [{
            text: this.$t("label.nextWeek"),
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              end.setTime(start.getTime() + 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: this.$t("label.nextMonth"),
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              end.setTime(start.getTime() + 3600 * 1000 * 24 * 30);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: this.$t("label.next3Month"),
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              end.setTime(start.getTime() + 3600 * 1000 * 24 * 90);
              picker.$emit('pick', [start, end]);
            }
          }]
      },
    }
  },
  components: {
    'file-card' : FileCard,
  },
  computed: {
    isMulti() {
      if (this.elements.length > 1)
        return true
      return false
    },
    multipleMessage() {
      if (!this.elements || this.elements.length < 2)
        return ""
      let message = this.$t('label.selectedWithCount', {name: this.$Utils.truncate(this.elements[0].object_name,20), count: this.elements.length})
      return this.$t('messages.selectedMultiple') + ' : ' + message
    },
    pickerOptions() {
      return {
          disabledDate(time) {
            return time.getTime() < Date.now();
          },
          shortcuts: [{
              text: this.$t('label.tommorrow'),
              onClick(picker) {
                const date = new Date();
                date.setTime(date.getTime() + 3600 * 1000 * 24);
                picker.$emit('pick', date);
              }
            }, {
              text: this.$t('label.nextWeek'),
              onClick(picker) {
                const date = new Date();
                date.setTime(date.getTime() + 3600 * 1000 * 24 * 7);
                picker.$emit('pick', date);
              }
            }, {
              text: this.$t('label.nextMonth'),
              onClick(picker) {
                const date = new Date();
                date.setTime(date.getTime() + 3600 * 1000 * 24 * 30);
                picker.$emit('pick', date);
              }
            }]
      }
    },
  },
  methods: {
    initParams() {
      this.elements = this.argElements.slice()

      if (!this.isMulti && this.elements.length < 1) {
        this.setError(this.$t('messages.selectFileOrFolder'))
        return false
      }

      return true
    },
    setError(message) {
      this.hasError = true
      this.errorMessage = message
      this.isLoading = false
    },
    validate() {
      console.log('called')
      if (!this.elements || this.elements.length < 1)
        return false

      let ok = true
      // check more
      if (!this.model.authorId || !this.model.expiry)
        ok = false

      return ok
    },
    async selectUser() {
      const params = {
          type: this.$Constants.VIEW_TYPES.SEL_USER,
          title: this.$t('messages.selectUser'),
          width: '80%',
          containerHeight: '600px',
          gridSelectable: this.$Constants.SELECTABLE.ROW
      }
      const result = await userDialog(params)
      if (result) {
        this.model.authorId = result[0].id
        this.tempName= result[0].name+"("+result[0].id+")";
      }
    },

    async init() {
      // init
      try {
        if (!this.isMulti) {
          let elementData = await api.getElement(this.elements[0].r_object_id)
          this.element = elementData.list[0]
        }
        this.isLoading = false
      } catch (error) {
        console.log(error)
        this.setError(error.errmsg)
        this.isLoading = false
      }
    },
    carryingOut() {
      console.log('carryingOut')
      this.isLoading = true
      let elementIds = this.elements.map(e => e.r_object_id)
      console.log(this.model.expiry);
      api.carryingOut(elementIds, this.model.authorId, this.model.expiry[0],this.model.expiry[1]).then(data => {
        // refresh and close
        this.isLoading = false
        this.$emit('closeRequested')
        this.close();
        this.$notify({
                title: this.$t('label.success'),
                message: this.$t('messages.completed'), type: 'success'
        })
      }).catch(e => {
        this.isLoading = false
      })
    },
    onClose(e) {
      this.close()
    },
    close() {
      this.dialogVisible=false;
      if (this.dynamic)
        this.$close(null)
      else
        this.$store.commit('closeHovers')

    },

  },
  created() {
    if (!this.initParams())
      return

    this.init()
  },
  mounted() {
  }
}
</script>
<style>
#carringOutDate .el-range-editor--small.el-input__inner{
  height: 40px !important;
}

</style>
