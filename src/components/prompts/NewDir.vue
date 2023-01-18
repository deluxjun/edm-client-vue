<template>
  <el-dialog
    :title="myTitle"
    width="50%"
    :visible.sync="dialogVisible"
    v-draggable
    :before-close="close"
  >
    <span class="dialog-body">
      <el-form ref="newDirForm" :model="newDirForm" :rules="rules" @submit.native.prevent>
        <el-form-item>
          <span>{{ $t('prompts.newDirMessage') }}</span>
        </el-form-item>
        <el-form-item prop="filename">
          <el-input ref="folderInput" v-model="newDirForm.filename" autofocus></el-input>
        </el-form-item>
      </el-form>
    </span>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="mkdir()">{{ $t('buttons.ok') }}</el-button>
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
      object_id: "",
      newDirForm: {
        filename: ""
      },
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
      return !this.title ? this.$t("prompts.newDir") : this.title;
    }
  },
  methods: {
    mkdir: function(event) {
      let successMessage = this.$t("success.complete");
      this.$refs.newDirForm.validate(valid => {
        if (valid) {
          let id = this.currentDir;
          api
            .createFolder(id, this.newDirForm.filename, "", this.bundle)
            .then(data => {
              Event.fire(EventList.RELOAD_TREE, false);
              Utils.showResultMessage(true);
            })
            .catch(error => {});
          this.close();
        } else {
          return;
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

