<template>
    <el-dialog ref="" :title="$t('prompts.prsrv')" :before-close="onClose" :visible.sync="dialogVisible" :width="'450px'" :fullscreen="false" >
      <div class='prsrv-box-list'>
        <div class='prsrv-box'>
          <el-radio v-model="radioValue" :label="false">{{$t('prsrv.create')}}</el-radio>
          <el-radio v-model="radioValue" :label="true">{{$t('prsrv.permanent')}}</el-radio>
        </div>
        <div class='prsrv-box'>
          <!-- <el-date-picker class='prsrv-date'
            v-model="yearValue"
            type="year"
            placeholder="Pick a year" :disabled="radioValue">
          </el-date-picker>-->
          <el-input-number v-model="yearValue" class='prsrv-date' :min="0" :max="999" :disabled="radioValue"  controls-position="right"></el-input-number>
          {{$t('Statistic.year')}}
          <el-select v-model="monthValue" class="prsrv-select" :disabled="radioValue">
                  <el-option
                      v-for="item in monthOption"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                  </el-option>
          </el-select>
          {{$t('Statistic.month')}}
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="addOrRemove()">{{ $t('buttons.ok') }}</el-button>
        <el-button @click="onClose()">{{ $t('buttons.cancel') }}</el-button>
      </span>
    </el-dialog>


</template>

<script>
import Vue from 'vue'
import Utils from '@/utils/utils'
import * as api from '@/utils/api'
export default {
  name: 'prsrvDialog',
  props: {
    width: {
      default: '150px',
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
    dynamic: {
      default: true,
      type: Boolean
    }
  },
  data() {
    return {
      dialogVisible : true,
      top : '50px',
      radioValue: false,
      yearValue: 1,
      monthValue: 1,
      yearOption: [],
      monthOption : [],
      elementIdList : []
    }
  },
  components : {
  },
  mounted() {

    for(var i=0; i< this.elementIds.length; i++){
      this.elementIdList.push(this.elementIds[i].r_object_id);
    }

    for(var i=1; i < 13;i++){
      this.monthOption.push({
        value : i,
        label : i
      });
    }

    console.log(this.elementIdList.join(","));
  },
  computed: {
  },
  methods : {
    addOrRemove(){
      api.addOrRemove(this.elementIdList.join(","),this.yearValue,this.monthValue,this.radioValue).then(data =>{
         this.$showSuccess();
      }).catch((error => {
         console.log(error);
      }));
      this.onClose();
    },
    onClose(e) {
      if (this.dynamic)
        this.$close(null)
      else
        this.$store.commit('closeHovers')
    },
  }
}
</script>

<style>
.prsrv-select .el-input{
  width: 120px !important;
}
.prsrv-box{
  text-align: center;
  margin-top: 15px;
}
.prsrv-box .el-input input{
  height: 38px !important;
}
.prsrv-date{
  width: 150px !important;
}
.prsrv-box-list{
  min-height: 80px;
}
</style>
