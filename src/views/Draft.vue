<template>
<div style="height:100%;" id="draft">
<el-container >

  <el-main v-loading="isLoading">
    <div id="draft-button" class="option-right" >
      <el-button v-if="drafting" type="primary" @click="handleAddRewriter">{{ $t('label.draftline') }}{{ $t('label.add') }}</el-button>
      <el-button v-if="drafting" type="primary" @click="handleDraft" :disabled="!validate()">{{ $t('buttons.draft') }}</el-button>
      <el-button v-if="canRollback" type="primary" @click="handleRollback" >{{ $t('buttons.rollback') }}</el-button>
      <el-button v-if="rewriting" type="success" @click="handleRewrite" >{{ $t('buttons.rewrite') }}</el-button>
      <el-button v-if="rewriting" type="danger" @click="handleReject" >{{ $t('buttons.reject') }}</el-button>
      <!-- <el-button size="mini" type="primary" @click="handleSave()">{{ $t('buttons.cancelDraft') }}</el-button> -->
    </div>
    <br>
    <span class="draftline"><i class='fa fa-arrow-circle-right'></i> {{ $t('label.draftline') }}  </span>
    <table class="table is-narrow margin-top10 tableclass">
			<thead>
				<tr>
          <th class='tablefix'>{{ $t('label.items') }} </th>
          <th v-for="(process,index) in model.sProcess" :key="process.position">{{ getProcessColumnName(process) }}
            <i v-if="drafting && index > 0"  @click="handleRemoveRewriter(index)" class="el-icon-error red"></i>
            <!-- <el-button v-if="drafting && index > 0" size="mini" type="danger" @click="handleRemoveRewriter(index)">{{ $t('prompts.remove') }}</el-button> -->
          </th>
			  </tr>
      </thead>
			<tbody>
				<tr>
					<th class='tablefix'>{{ $t('label.department') }}</th>
          <td v-for="process in model.sProcess" :key="process.position">
            {{ $Utils.removeLastCharacterAtGroup(process.rewriterDeptName) }}
          </td>
				</tr>
				<tr>
					<th class='tablefix'>{{ $t('label.name') }}</th>
          <td v-for="process in model.sProcess" :key="process.position">
            {{ $Utils.getIdName(process.rewriterId, process.rewriterName) }}
          </td>
				</tr>
				<tr>
					<th class='tablefix'>{{ $t('label.completeDate') }}</th>
          <td v-for="process in model.sProcess" :key="process.position">
            {{ process.completeDate? $Utils.moment(new Date(process.completeDate)).format('LL') : ''}}
          </td>
				</tr>
				<tr>
					<th class='tablefix'>{{ $t('label.sign') }}</th>
          <td v-for="process in model.sProcess" :key="process.position">
            <span v-if="process.completeDate" class='completeText'>{{ $t('label.complete') }}</span>
            <!-- <img v-if="process.completeDate" width="80" height="80" class="draftingPng" src="../assets/approved.png"> -->
            <!-- <button v-else-if="!drafting && user.userId === process.rewriterId" class="k-button k-primary" @click="rewrite()">{{ $t('label.rewrite') }}</button> -->
            <span v-else>{{ $t('label.rewriting') }}</span>
          </td>
				</tr>
			</tbody>
		</table>

    <el-form v-if="model" :model="model" ref="form" label-width="150px" :show-message="false">
      <div class='draftgeneral'><i class='fa fa-arrow-circle-right'></i> {{ $t('label.general') }}
        <span style="margin-left: 20px;"> ({{ draftStatus }}) </span>
      </div>
      <div class="margin-top10">
      <el-form-item :label="$t('label.title')" prop="subject" :rules='{required: true, trigger: "blur"}'>
        <el-input v-model="model.subject" :placeholder="$t('messages.inputName')" :readonly="!drafting"></el-input>
      </el-form-item>
      <el-form-item :label="$t('label.draftCommand')" prop="command" :rules='{required: true, trigger: "blur"}'>
        <el-input v-if="!drafting" class="label-custom" :value="commandTitle" :readonly="true"></el-input>
        <el-select v-else v-model="model.command" placeholder="Select">
          <el-option v-for="item in draftCommands"
            :key="item.command" :label="item.title" :value="item.command">
            <span style="float: left">{{ item.title }}</span>
            <!-- <span style="float: right; color: #8492a6; font-size: 13px">{{ item.command }}</span> -->
          </el-option>
        </el-select>
      </el-form-item>
      <!-- 부가적인 정보 -->
      <div v-if="model.command == '11'">
      <el-form-item :label="$t('label.bundleName')" prop="contents[name]" :rules='{required: true, trigger: "blur"}' >
        <el-input v-model="model.contents.name" :placeholder="$t('messages.inputName')" :readonly="!drafting"></el-input>
      </el-form-item>
      <el-form-item :label="$t('label.folder')" > <!-- folder -->
        <el-button v-if="drafting" size="small" @click="showExplorer">{{ $t('messages.selectFolder') }} </el-button>
        <span style="margin-left: 20px;">{{ model.contents.folderName }}</span>
      </el-form-item>
      </div>


      <el-form-item :label="$t('label.draftPeriod')" prop='period' :rules='{required: true, trigger: "blur"}'>
        <el-date-picker v-model="model.period" type="daterange" align="right" unlink-panels range-separator="~"
          start-placeholder="Start date" end-placeholder="End date" :picker-options="pickerOptions" :readonly="!drafting">
        </el-date-picker>
      </el-form-item>
      </div>
    </el-form>

    <div class="contentfix">
        <span><i class='fa fa-arrow-circle-right'></i> {{ $t('label.contents') }}</span>
    </div>
    <el-card class="box-card margin-top10">
      <div>
        <!-- 내용 -->
        <!-- <el-input v-model="model.comment" type="textarea" :readonly="drafting"></el-input> -->
        <kendo-editor id="contentEditor" :resizable-content="true"
                    :resizable-toolbar="false"
                    v-model="model.comment"
                    :readonly="!drafting"
                    style="height:80px"
                    rows="5"
                    cols="30">
        </kendo-editor>
        <!-- <file-card v-for="e in elements" :key="e.r_object_id" :element="e"></file-card> -->
        <!-- 파일 kendo template-->
        <div id="filecard-draft"></div>

      </div>
    </el-card>

    <el-card v-if="!drafting" class="box-card">
      <div class="contentfix margin-top10">
        <span><i class='fa fa-arrow-circle-right'></i> {{ $t('label.comments') }} </span>
      </div>
      <el-form :model="model" ref="extForm" label-width="120px">
        <div v-for="(process, index) in model.sProcess" :key="process.position">
          <el-form-item v-if="showComment(process,index)" :label="$Utils.getIdName(process.rewriterId, process.rewriterName)">
            <el-input :value="process.comment" type="textarea" :readonly="!editableComment(process)"></el-input>
          </el-form-item>
        </div>
      </el-form>
    </el-card>

  </el-main>
</el-container>
</div>
</template>

<script>
import Vue from 'vue'
import * as api from '@/utils/api'
import { mapState, mapActions } from 'vuex'

import {
  Form,FormItem,Input,Radio,Checkbox,Select,Option,Button
} from 'element-ui'

import SelectUserGroupDialog from '@/views/SelectUserGroupDialog'
import Constants from '../Constants'
import FileFoldersDialog from './FileFoldersDialog'
import { create } from 'vue-modal-dialogs'

const fileFoldersDialog = create(FileFoldersDialog)
const userDialog = create(SelectUserGroupDialog)

import { Editor,EditorTool,EditorInstaller } from '@progress/kendo-editor-vue-wrapper'

Vue.use(EditorInstaller);

export default {
  name: 'draft',
  props: {
    argRewriteId : {
      type: String
    },
    argElementId : {
      type: Array
    },
    containerHeight: {
      default: '80vh',
      type: String
    }
  },
  data: function () {
    return {
      elements: [],
      isLoading: true,
      draftContents: '',
      elementIds: null,
      rewriteId: null,
      model: {
          subject: '',
          comment: '',
          command: 0,
          period: [],
          sProcess: [],
          newcomment: '',
          contents: {name:'', folderName:'',parentId:''}
      },
    }
  },
  components: {
    Editor,
  },
  computed: {
    ...mapState(['draftCommands','user']),
    draftStatus() {
      console.log("??");
      if (this.model.status == 1)
        return this.$t('messages.draft_approved')
      else if (this.model.status == 2)
        return this.$t('messages.draft_rejected', {rewriter: this.model.currentRewriter})
      else if (this.model.status == 3)
        return this.$t('messages.draft_rollbacked')
      console.log(this.$t('messages.draft_progressing'));
      return this.$t('messages.draft_progressing')
    },
    drafting() {
      return this.elementIds && this.elementIds.length > 0 && this.rewriteId == null
    },
    canRollback() {
      let ok = this.elementIds && this.elementIds.length > 0 && this.rewriteId
      ok = ok && this.model.status == 0 // now progress
      ok = ok && !this.drafting // not drafting
      ok = ok && (this.model.sProcess.length == 2 && this.model.sProcess[0].rewriterId === this.user.userId)
      return ok
    },
    rewriting() {
      let ok = this.elementIds && this.elementIds.length > 0 && this.rewriteId
      ok = ok && this.model.status == 0 // now progress
      ok = ok && (this.model.sProcess.length > 1 && this.model.sProcess[this.model.sProcess.length-1].rewriterId === this.user.userId)
      return ok
    },
    pickerOptions() {
      return {
        shortcuts: [{
          text: this.$t('label.nextWeek'),
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            end.setTime(start.getTime() + 3600 * 1000 * 24 * 7);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: this.$t('label.nextMonth'),
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            end.setTime(start.getTime() + 3600 * 1000 * 24 * 30);
            picker.$emit('pick', [start, end]);
          }
        }]
      }
    },
    commandTitle() {
      let command = this.draftCommands.find(e=>{return e.command === this.model.command})
      if (command)
        return command.title
      return this.model.command
    },
  },
  methods: {
    ...mapActions(['loadDraftCommands']),

    validate(withForm = false) {
      console.log('called')
      if (!this.rewriteId && (!this.elementIds || this.elementIds.length < 1))
        return false

      if (this.drafting) {
        if (this.model.sProcess.length < 2)
          return false
      }

      if (!this.model.subject || this.model.period.length < 1)
        return false

      let ok = true
      if (withForm) {
        this.$refs['form'].validate((valid) => {
          if (!valid) {
            ok = false
          }
        })
      }
      return ok
    },
    showComment(process, index){
      if (index < 1)
        return false

      if (this.user.userId === process.rewriterId)
        return true   // 편집가능
      else {
        if (process.comment)
          return true   // 보여주기만
      }

      return false
    },
    editableComment(process){
      return !this.drafting && (this.user.userId === process.rewriterId) && !process.completeDate
    },
    init() {
      if (this.argRewriteId)
        this.rewriteId = this.argRewriteId

      // load doctype
      this.loadDraftCommands().then(r => {
        if (!this.rewriteId) {
          this.model.command = this.draftCommands[0].command
          this.model.sProcess.push({
            position: 1,
            rewriterName: this.user.userName,
            rewriterId: this.user.userId,
            rewriterDeptName: this.getGroupName(this.user.group)
          })

          this.setRewriter();
        }
      })

      if (!this.rewriteId)
        this.rewriteId = this.$route.query.rewriteId

      if (!this.argElementId) {
        if (this.$route.query.elementId)
          this.elementIds = [this.$route.query.elementId]
      }
      else
        this.elementIds = this.argElementId

      // get rewrite info
      if (this.rewriteId) {
        api.getRewriteInfo(this.rewriteId).then(data=>{
          this.model = data
          if (data.elements && data.elements.length > 0)
            this.elementIds = data.elements

          // get element
          this.elements = []
          this.elementIds.forEach((e,i,array) => {
            api.getElement(e).then(data => {
              this.elements.push(data.list[0])

              // put template data
              var template = kendo.template($("#detail-itemTemplate").html());
              var data = data.list[0];

              var result = template(data); //Execute the template
              $("#filecard-draft").html(result); //Append the result
            })
          })

          this.model.period = [new Date(this.model.startDate), new Date(this.model.endDate)]
          this.model.comment = this.model.sProcess[0].comment   // 작성자의 comment

          // get extra data
          if (this.model.contents) {
            try {
              this.model.contents = JSON.parse(this.model.contents)
            } catch (error) {
              console.log(error)
            }
          }

          $($('#contentEditor').data().kendoEditor.body).attr('contenteditable',false)
          this.$emit('loaded')
          this.isLoading = false
        })
      } else {
        $($('#contentEditor').data().kendoEditor.body).attr('contenteditable',true)
        this.isLoading = false
      }
    },
    getGroupName(groupIds){
      let namelist='';
      for(var i=0; i<groupIds.length;i++){
        if(groupIds[i].type!=-1){
          if(i==groupIds.length-1){
            namelist+=groupIds[i].descriprion
          }else{
            namelist+=groupIds[i].descriprion+","
          }
        }
      }
      return namelist;
    },
    setRewriter(){
      let eid=Utils.getCurrentSelect()[0].r_object_id;
      api.listUserByElementId(eid).then(data => {
         let grouplist=data.list;
         for(var i=0; i<grouplist.length;i++){
            this.model.sProcess.push({
                  position: this.model.sProcess.length+1,
                  rewriterName: grouplist[i].name,
                  rewriterId: grouplist[i].id,
                  rewriterDeptName: grouplist[i].parentGroupNames.slice(0,-1)
            })
        }
      }).catch(e => {
          console.log(e)
      })
    },
    getProcessColumnName(process) {
      if (process.position === 1) {
        return this.$t('label.drafter')
      }
      return this.$t('label.rewriter')
    },
    rewrite() {
      console.log('rewrite')
      this.$confirm(this.$t('messages.confirmMessage', {action: this.$t('label.rewrite')})).then(_ => {
        this.isLoading = false
        api.rewrite(this.rewriteId, this.model.comment).then(data => {
          // refresh and close
          this.isLoading = false
          this.init()
          this.$emit('closeRequested')
        }).catch(e => {
          this.isLoading = false
        })
      })
    },
    // rewrite
    handleRewrite() {
      this.isLoading = true
      api.rewrite(this.rewriteId, this.model.comment).then(r => {
         this.isLoading = false
         this.$emit('closeRequested')
       }).catch(e => {
         this.isLoading = false
      })
    },
    // 반려 Reject
    handleReject() {
      this.isLoading = true
      api.rejectDraft(this.rewriteId, this.model.comment).then(r => {
          this.isLoading = false
         this.$emit('closeRequested')
      }).catch(e => {
         this.isLoading = false
      })
    },
    // 회수 rollback
    handleRollback() {
      this.isLoading = true
      api.rollbackDraft(this.rewriteId, '').then(r => {
        this.isLoading = false
        this.$emit('closeRequested')
      }).catch(e => {
        this.isLoading = false
      })
    },
    handleDraft() {
      if (!this.validate(true)) {
        this.$showError(this.$t('messages.invalidData'))
        return
      }
      if (!this.drafting) {
        this.$showError(this.$t('messages.cannotDraft'))
        return
      }

      let newProcess = this.model.sProcess.slice() // 자기자신 제거
      newProcess.shift()
      let data = {
        docId: this.elementIds.join(';'),
        records: newProcess.map(e=>{return e.rewriterId}).join(';'),
        comment: this.model.comment,
        subject: this.model.subject,
        command: this.model.command,
        startDay: this.$Utils.toDateString(this.model.period[0]),
        endDay: this.$Utils.toDateString(this.model.period[1]),
        contents: JSON.stringify(this.model.contents)
      }
      // loading
      this.isLoading = true
      api.draft(data).then(r => {
        this.rewriteId = r.rewrite.id
        //this.init()
        this.elementIds = null
        this.isLoading = false
        this.$emit('closeRequested')
      }).catch(e => {
        this.isLoading = false
      })
    },
    async handleAddRewriter() {
      const params = {
          type: Constants.VIEW_TYPES.SEL_USER,
          title: this.$t('messages.selectUser'),
          width: '70%',
          containerHeight: '600px',
          gridSelectable: Constants.SELECTABLE.ROW
      }
      const selected = await userDialog(params)
      if (selected && selected.length>0) {
        if(selected.id==this.model.sProcess[0].rewriterId){
          this.$notify({
                title: this.$t('label.warning'),
                message: this.$t('messages.self'), type: 'warning'
           })
        }else{
          this.model.sProcess.push({
            position: this.model.sProcess.length+1,
            rewriterName: selected[0].name,
            rewriterId: selected[0].id,
            rewriterDeptName: selected[0].groupName
          })
        }
      }
    },
    handleRemoveRewriter(index) {
      this.model.sProcess.splice(index, index)
    },
    // show 탐색
    async showExplorer() {
      const params = {
          title: this.$t('messages.selectFiles'),
          width: '70%',
          containerHeight: '40vh', disableList: true
      }
      const result = await fileFoldersDialog(params)
      console.log(result)
      if (result) {
        this.model.contents.parentId = result.rid
        this.model.contents.folderName = result.text
        this.$set(this.model.contents, 'folerName', result.text)
      }
    },
  },

  mounted() {
    this.init()
  }
}
</script>
<style>
#draft {
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0px 20px;
}

.name-wrapper {
  display: inline-block;
}

#draft .table th {
    text-align: center;
    width: 200px;
    font-size: 13px;
    /*color: darkcyan;*/
    color: #0F366B;
    background-color: #EBF5FB;
}
#draft .table td {
    text-align: center;
}

.tablefix{
  width: 120px !important;
}
.draftline{
  font-size: 15px;
  color: #0F366B;
  font-weight: 700;
}
.draftgeneral{
  font-size: 15px;
  color: #0F366B;
  font-weight: 700;
}
.tableclass{
  border : 1px solid #4C7DAA;
}
.contentfix{
  font-size: 15px;
  color: #0F366B;
  font-weight: 700;
}
.red{
  color: #ff6358;
  cursor: pointer
}
.completeText{
  color: #4C7DAA;
  font-weight: 700;
}


</style>
