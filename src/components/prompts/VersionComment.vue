<template>
  <el-dialog
    :title="myTitle"
    width="30%"
    :visible.sync="dialogVisible"
    v-draggable
    :before-close="close"
  >
    <span class="dialog-body">
      <el-input
        v-model="setComment"
        type="textarea"
        :autosize="{ minRows: 4, maxRows: 4}"
        @keyup.native.enter="modifyComment()"
      ></el-input>
    </span>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="modifyComment()">{{ $t('buttons.ok') }}</el-button>
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
    },
    comment: {
      default: "",
      type: String
    }
  },
  data: function() {
    return {
      selectedList: null,
      dialogVisible: true,
      object_id: "",
      setComment: "",
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
    modifyComment: function(event) {
      this.$close(this.setComment);
    },
    close() {
      this.dialogVisible = false;
    }
  },
  mounted() {
    this.setComment = this.comment;
  }
};
</script>

