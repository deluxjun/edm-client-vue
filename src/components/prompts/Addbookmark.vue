<template>
  <el-dialog
    :title="$t('prompts.Addbookmark')"
    width="50%"
    :visible.sync="dialogVisible"
    v-draggable
    :before-close="close"
    v-if="dialog"
  >
    <span class="dialog-body">
      <el-form
        ref="renameForm"
        :model="renameForm"
        :rules="rules"
        @keyup.native.enter="rename"
        @submit.native.prevent
      >
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
      submitDisabled: false,
      dialog: false
    };
  },
  watch: {
    // 'renameForm.filename':function(){
    //   this.submitDisabled = (this.renameForm.filename == this.renameForm.originalFilename)
    // }
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
          if (this.renameForm.isFolder != "FOLDER") {
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
      this.selectedList = Utils.getCurrentSelect();
      var count = this.selectedList.length;
      var selectedType = 1;
      if (count == 1) {
        var type = this.selectedList[0].docTypeName || "FOLDER"; //from treeview
        if (type == "FOLDER") {
          selectedType = 0;
        }
      }
      api
        .nameAddBookmark(this.object_id, selectedType, this.renameForm.filename)
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
    },
    addBookmark: function(object_id, type) {
      Utils.changeBookmarkLogo(object_id, true, true);
      this.close();
    }
  },
  mounted() {
    let renameBookmark = Utils.featuresDefault("renameBookmark", false);

    if (renameBookmark) {
      this.$nextTick(_ => {
        var idx = 0;
        if (this.renameForm.isFolder == "FOLDER") {
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
      this.renameForm.isFolder = this.selectedList[0].docTypeName;

      this.dialog = true;
    } else {
      this.dialog = false;
      this.selectedList = Utils.getCurrentSelect();
      var count = this.selectedList.length;
      if (count == 1) {
        var type = this.selectedList[0].docTypeName || "FOLDER"; //from treeview
        if (type == "FOLDER") {
          this.addBookmark(this.selectedList[0].r_object_id, 0);
        } else {
          this.addBookmark(this.selectedList[0].r_object_id, 1);
        }
      } else this.close();
    }
  }
};
</script>

