<template>
  <el-dialog
    :title="$t('prompts.rename')"
    width="50%"
    :visible.sync="dialogVisible"
    v-draggable
    :before-close="close"
  >
    <span class="dialog-body">
      <el-form
        ref="renameForm"
        :model="renameForm"
        :rules="rules"
        @keyup.enter.native="rename"
        @submit.native.prevent
      >
        <el-form-item>
          <span v-if="!this.renameForm.isFolder">{{ $t('prompts.renameMessage') }}</span>
          <span v-if="this.renameForm.isFolder">{{ $t('prompts.renameFolderMessage') }}</span>
        </el-form-item>
        <el-form-item prop="filename">
          <el-input
            ref="nameInput"
            id="inputname"
            v-model="renameForm.filename"
            autofocus
            type="text"
          ></el-input>
        </el-form-item>
      </el-form>
    </span>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="rename()" :disabled="submitDisabled">{{ $t('buttons.ok') }}</el-button>
      <el-button @click="close()">{{ $t('buttons.cancel') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import Vue from "vue";
import url from "@/utils/url";
import * as api from "@/utils/api";
import { mapState } from "vuex";
import Utils from "@/utils/utils";

export default {
  name: "rename",
  data: function() {
    return {
      selectedList: null,
      dialogVisible: true,
      object_id: "",
      renameForm: {
        filename: "",
        originalFilename: "",
        originalExt: "",
        isFolder: false
      },
      inMode: false,
      rules: {
        filename: [
          {
            validator: constants.FORM_VALIDATOR.FILTER_ILLEGAL_FILENAME,
            trigger: "change"
          }
        ]
      },
      submitDisabled: true
    };
  },
  watch: {
    "renameForm.filename": function() {
      this.submitDisabled =
        this.renameForm.filename == this.renameForm.originalFilename;
    }
  },
  computed: {
    ...mapState(["selected"])
  },
  methods: {
    rename: function(event) {
      if (this.inMode) return;
      this.inMode = true;
      this.$refs.renameForm.validate(valid => {
        if (valid) {
          if (!this.renameForm.isFolder) {
            this.checkFileExtIsChanged();
          } else {
            this.requestToServer();
          }
        }
        var obj = this;
        setTimeout(function() {
          obj.inMode = false;
        }, 2000);
      });
    },
    checkFileExtIsChanged() {
      var currentExt = Utils.getFileExtension(this.renameForm.filename);
      console.log(this.renameForm.originalExt);
      if (
        this.renameForm.originalExt != "" &&
        currentExt != this.renameForm.originalExt
      ) {
        this.$confirm(this.$t("messages.fileExtChanged"), "", {
          confirmButtonText: vue.$t("buttons.ok"),
          cancelButtonText: vue.$t("buttons.cancel"),
          type: "warning"
        })
          .then(() => {
            this.requestToServer();
          })
          .catch(() => {
            this.renameForm.filename = this.renameForm.originalFilename;
          });
      } else {
        this.requestToServer();
      }
    },
    requestToServer() {
      api
        .rename(this.object_id, this.renameForm.filename)
        .then(data => {
          let reloadParent = this.selectedList[0].reloadParent === true;
          Event.fire(EventList.RELOAD_TREE, reloadParent);
          this.close();
        })
        .catch(error => {
          this.close();
        });
    },
    close() {
      this.dialogVisible = false;
      this.$store.commit("closeHovers");
    }
  },
  mounted() {
    this.$nextTick(_ => {
      var idx = 0;
      if (this.renameForm.isFolder) {
        idx = this.renameForm.filename.length;
      } else {
        idx = this.renameForm.filename.lastIndexOf(".");
      }
      var inputForm = this.$refs.nameInput.$refs.input;
      inputForm.select();
      inputForm.setSelectionRange(0, idx);
    });

    this.selectedList = Utils.getCurrentSelect();
    if (this.selectedList.length != 1) this.close();
    this.object_id = this.selectedList[0].r_object_id;
    this.renameForm.filename = this.renameForm.originalFilename = this.selectedList[0].object_name;

    this.renameForm.originalExt = Utils.getFileExtension(
      this.renameForm.filename
    );
    this.renameForm.isFolder = this.selectedList[0].isFolder;

    if (
      this.selectedList[0].isFolder === null ||
      this.selectedList[0].isFolder === undefined
    ) {
      this.renameForm.isFolder =
        this.selectedList[0].r_object_type === "dm_folder" ? true : false;
    } else {
      this.renameForm.isFolder = this.selectedList[0].isFolder;
    }
  }
};
</script>

