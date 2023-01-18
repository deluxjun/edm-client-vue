<template>
  <el-dialog
    :title="$t('prompts.permission')"
    width="50%"
    :visible.sync="advDialogVisible"
    :before-close="close"
    append-to-body
    >
    <template v-for="item in permissionList">
      <el-checkbox v-model="item.enabled" :disabled="isReadOnly" >{{item.name}}</el-checkbox>
      <br>
    </template>
    <el-button v-if="!isReadOnly" @click="close">Save</el-button>
  </el-dialog>
</template>

<script>
import {mapState, mapGetters} from 'vuex'
import constants from '@/Constants';
import * as api from '@/utils/api'

export default {
  name: 'advancedPermission',
  props: ['isReadOnly','advDialogVisible'],
  computed: {

  },
  data() {
    return {
      mask:0,
      permissionList:[]
    }
  },
  methods: {
    close(){
      var mask=0;
      for(var item in this.permissionList){
        if(this.permissionList[item].enabled){
          mask |= this.permissionList[item].mask;
        }
      }
      this.$emit('closeAdv',mask);
    },
    refresh(mask){
      this.mask=mask;
      this.permissionList=[]
      for(var item in constants.PERMISSION){
        var tmp={};
        tmp.name=this.$t('permission.'+item);
        tmp.id=item;
        tmp.mask=constants.PERMISSION[item] || 0;
        if(this.mask & tmp.mask){
          tmp.enabled=true;
        }
        else tmp.enabled= false;
        
        this.permissionList.push(tmp);
      }
    }
  },
  mounted(){
    this.refresh();
  }
}
</script>
