<template>
  <el-dialog
    :title="myTitle"
    width="50%"
    :visible.sync="dialogVisible"
    v-draggable
    :before-close="close"
  >
    <span class="dialog-body">
      <el-form
        ref="makeFileForm"
        :model="makeFileForm"
        :rules="rules"
        @keyup.native.enter="mkfile"
        @submit.native.prevent
      >
        <el-form-item>
          <span>{{ $t('prompts.makefileType') }}</span>
        </el-form-item>
        <el-form-item>
          <el-radio-group v-model="fileType">
            <el-radio label="txt">
              <i class="fa fa-file-text-o"></i>
              {{ $t('label.text') }}
            </el-radio>
            <el-radio label="word">
              <i class="fa fa-file-word-o"></i>
              {{ $t('label.word') }}
            </el-radio>
            <el-radio label="excel">
              <i class="fa fa-file-excel-o"></i>
              {{ $t('label.excel') }}
            </el-radio>
            <el-radio label="ppt">
              <i class="fa fa-file-powerpoint-o"></i>
              {{ $t('label.ppt') }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <span>{{ $t('prompts.makefileMessage') }}</span>
        </el-form-item>
        <el-form-item prop="filename">
          <el-input ref="folderInput" v-model="makeFileForm.filename" autofocus type="text"></el-input>
        </el-form-item>
      </el-form>
    </span>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="mkfile()">{{ $t('buttons.ok') }}</el-button>
      <el-button @click="close()">{{ $t('buttons.cancel') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import Vue from "vue";
import { create } from "vue-modal-dialogs";
import url from "@/utils/url";
import * as api from "@/utils/api";
import { mapState } from "vuex";
import Utils from "@/utils/utils";
import overWriteDialog from "@/components/overWriteDialog";
const overwriteDialog = create(overWriteDialog);

export default {
  name: "rename",
  props: {
    title: {
      default: null,
      type: String
    },
    bundle: {
      default: false,
      type: Boolean
    },
    dynamic: {
      // createDialog 로 생성되면 true
      default: false,
      type: Boolean
    }
  },
  data: function() {
    return {
      selectedList: null,
      dialogVisible: true,
      overwrite: false,
      allowRename: false,
      skipfile: false,
      object_id: "",
      makeFileForm: {
        filename: this.$t("prompts.newfilename")
      },
      fileType: "txt",
      rules: {
        filename: [
          {
            validator: constants.FORM_VALIDATOR.FILTER_ILLEGAL_FILENAME,
            trigger: "change"
          }
        ]
      }
    };
  },
  computed: {
    ...mapState(["selected", "currentDir"]),
    myTitle() {
      return !this.title ? this.$t("prompts.makenewfile") : this.title;
    }
  },
  methods: {
    mkfile: function(event) {
      let successMessage = this.$t("success.complete");
      this.$refs.makeFileForm.validate(valid => {
        if (valid) {
          this.saveCall();
        } else {
          return;
        }
      });
    },
    async checkFileOverWrite() {
      const result = await overwriteDialog({
        title: this.$t("messages.fileChangeOrUpload"),
        width: "30%",
        containerHeight: "200px",
        fileName: this.makeFileForm.filename,
        allcheckType: false
      });
      if (result) {
        this.overwrite = result.overwrite;
        this.allowRename = result.allowRename;
        if (result.close || result.skipfile) {
        } else {
          this.saveCall();
        }
      }
    },
    errorMsg(msg) {
      this.$notify({
        title: i18n.t("label.error"),
        message: msg,
        type: "error"
      });
    },
    saveCall() {
      let id = this.currentDir;
      api
        .createTempleteDoc(
          id,
          this.makeFileForm.filename,
          this.fileType,
          this.overwrite,
          this.allowRename,
          store.state.rootId
        )
        .then(data => {
          Event.fire(EventList.RELOAD_TREE, false);
          Utils.showResultMessage(true);
          this.close();
        })
        .catch(error => {
          if (error.errcode == "ECM0001") {
            this.checkFileOverWrite();
          } else {
            this.errorMsg(error.errmsg);
            this.close();
          }
        });
    },
    close() {
      this.dialogVisible = false;
      if (this.dynamic) this.$close({ requestReload: this.requestReload });
      else this.$store.commit("closeHovers");
    }
  },
  mounted() {
    // this.$nextTick(_ => {
    //   this.$refs.folderInput.$refs.input.focus()
    // });
    // this.selectedList=Utils.getCurrentSelect();
    // if(this.selectedList.length!=1) this.close();
  }
};
</script>

