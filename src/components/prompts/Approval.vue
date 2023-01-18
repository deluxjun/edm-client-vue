<template>
  <el-dialog
    :title="$t('prompts.approval')"
    width="60%"
    :visible.sync="dialogVisible" v-draggable
    :before-close="handleClose"
    >
    <el-dialog width="45%" title="Approval" :visible.sync="childdialogVisable" :before-close="handleCloseChild" append-to-body>
      <table style="width:100%">
        <tr>
          <td>결재 구분</td>
          <td><input type="radio" name="what" checked>승인 <input type="radio" name="what">반려</td>
        </tr>
        <tr>
          <td>위임자</td>
          <td><el-button>+</el-button></td>
        </tr>
        <tr>
          <td>결재 첨언</td>
          <td><el-input
                type="textarea"
                id="comment_input"
                :autosize="{ minRows: 2, maxRows: 3}"
                :clearable='true'
                placeholder="Enter Comment">
            </el-input></td>
        </tr>
      </table><br>
      <el-button type="primary">Save</el-button>
    </el-dialog>
    <h3>문서:{{docInfo.name}}</h3>
    <h3>기안자:{{approvalInfo.who}}</h3>
    <h3>기안 종류:{{approvalInfo.type}}</h3>
    <h3>결제 라인</h3>
    <table>
      <tr>
        <td>구분</td>
        <td>작성자</td>
        <td>결재자</td>
      </tr>
      <tr>
        <td>소속그룹</td>
        <td>{{sProcessFrom.rewriterDeptName}}</td>
        <td>{{sProcessEnd.rewriterDeptName}}</td>
      </tr>
      <tr>
        <td>기안자</td>
        <td>{{sProcessFrom.rewriterId}}</td>
        <td>{{sProcessEnd.rewriterId}}</td>
      </tr>
      <tr>
        <td>결재일자</td>
        <td>{{sProcessFrom.completeDate}}</td>
        <td>{{sProcessEnd.completeDate}}</td>
      </tr>
      <tr>
        <td>서명</td>
        <td>(sign)</td>
        <td><el-button type="primary" @click="childdialogVisable=true">결재하기</el-button></td>
      </tr>
    </table>
  </el-dialog>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import Utils from '@/utils/utils'
import * as api from '@/utils/api'
import buttons from '@/utils/buttons'
export default {
  name: 'approval',
  data: function () {
    return {
      docInfo:{
        name:"",
        object_id:"",
        size:""
      },
      approvalInfo:{
        who:"",
        type:""
      },
      sProcessFrom:{
        comment:"",
        completeDate:"",
        rewriterDeptName:"",
        rewriterId:"",
        rewriteName:""
      },
      sProcessEnd:{
        comment:"",
        completeDate:"",
        rewriterDeptName:"",
        rewriterId:"",
        rewriteName:""
      },
      selectedList:null,
      dialogVisible: true,
      childdialogVisable:false
    }
  },
  computed: mapState(['selected']),
  mounted:function(){
    this.selectedList=Utils.getCurrentSelect();
    if(this.selectedList.length!=1){
      this.close();
      return;
    }
    else{
      this.getDocumentInfo();
    }
  },
  methods: {
    ...mapMutations(["setReload"]),
    getDocumentInfo:function(){
      api.getDocInfo(this.selectedList[0].r_object_id).then(data=>{
        this.docInfo.name=data.list[0].object_name;
        this.getApprovalInfo();

      }).catch(error=>{
        console.log(error)
      })
    },
    getApprovalInfo:function(){
      api.getApprovalItem(this.selectedList[0].approval_id).then(data=>{
        this.approvalInfo.who=data.list[0].author;
        this.approvalInfo.type=data.list[0].command;
        this.sProcessFrom=data.list[0].sProcess[0];
        this.sProcessEnd=data.list[0].sProcess[1];
      }).catch(error=>{

      })
    },
    handleCloseChild(){
      this.childdialogVisable=false;
    },
    handleClose(done) {
      this.$confirm(this.$t('label.closeMessage'))
        .then(_ => {
          this.close();
        })
    },
    close(){
      this.$store.commit('closeHovers')
    }
  }
}
</script>
