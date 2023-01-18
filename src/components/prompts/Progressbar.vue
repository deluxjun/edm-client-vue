<template>
  <el-dialog
    :title="titleMessage"
    width="45%"
    :visible.sync="dialogVisible"
    v-draggable
    :before-close="handleClose"
    append-to-body
  >
    <span>{{currentTask}} {{statusMessage}}</span>
    <el-progress
      :text-inside="true"
      :stroke-width="18"
      :percentage="currentPercent"
      :status="currentStatus"
    ></el-progress>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose()" v-if="!isDone">{{ $t('buttons.cancel') }}</el-button>
      <el-button @click="close()" v-if="isDone">{{ $t('buttons.close') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { mapState } from "vuex";
import * as api from "@/utils/api";
import buttons from "@/utils/buttons";
import mvcp from "./mvcpoption";
export default {
  name: "async-progressbar",
  props: {
    autoClose: {
      default: false,
      type: Boolean
    }
  },
  components: {
    mvcpopt: mvcp
  },
  watch: {
    currentPercent() {
      if (this.currentPercent >= 100) {
        this.titleMessage = this.$t("prompts.progressEnd");
      } else {
        this.titleMessage = this.$t("prompts.progress");
      }
    }
  },
  data() {
    return {
      titleMessage: "",
      dialogVisible: false,
      currentPercent: 0,
      currentStatus: "success",
      currentTask: this.message,
      progressLevel: 0,
      statusMessage: "",
      waitList: [],
      isDone: false,
      actionId: "",
      param: [],
      waitMode: false
    };
  },
  created() {},
  mounted() {
    this.titleMessage = this.$t("prompts.progress");
  },
  methods: {
    getStatus(actionId, init = true, param) {
      console.log("이벤트 호출");
      var obj = this;
      api
        .getProgressStatus(actionId)
        .then(data => {
          if (init) {
            this.dialogVisible = true;
            this.actionId = actionId;
            this.param = param;
          }

          if (
            data.processCount == 0 &&
            data.totalCount == 0 &&
            data.status === "Completed"
          ) {
            this.currentStatus = "exception";
            this.$alert(
              this.$t("messages.fileNotFound"),
              this.$t("label.error"),
              {
                type: "error",
                callback: action => {
                  if (this.autoClose) this.close(true);
                }
              }
            );
            return;
          } else if (data.processCount == 0 && data.totalCount == 0) {
            setTimeout(function() {
              if (!this.isDone) obj.getStatus(actionId, false, param);
              else return;
            }, 1000);
            return;
          }
          var percent =
            Math.ceil(
              (data.processCount / parseFloat(data.totalCount)) * 100
            ) || 0;
          if (!this.waitMode) this.currentPercent = percent;
          this.currentStatus = data.status;
          this.statusMessage = data.message;
          console.log(this.currentStatus);
          if (this.currentStatus == "Failed") {
            this.currentStatus = "exception";
            this.$alert(data.message, this.$t("label.error"), {
              type: "error",
              callback: action => {
                if (this.autoClose) this.close(true);
              }
            });
            return;
          }
          //20190316 추가. 취소된 경우 오류로 처리되지 않도록
          if (this.currentStatus == "Cancelled") {
            this.currentStatus = "exception";
            this.close(true);
            return;
          }
          if (this.currentPercent < 100 && this.currentStatus != "Completed") {
            setTimeout(function() {
              if (!this.isDone) obj.getStatus(actionId, false, param);
              else return;
            }, 1000);
          } else if (this.currentStatus == "Completed") {
            this.currentPercent = 100;
            this.isDone = true;
            this.currentStatus = "success";
            if (this.autoClose) this.close();
          } else {
            this.waitMode = true;
            this.currentPercent = 99;
            setTimeout(function() {
              if (!this.isDone) obj.getStatus(actionId, false, param);
              else return;
            }, 1000);
          }
        })
        .catch(error => {
          if (init) this.dialogVisible = true;
          this.currentStatus = "exception";
          this.$alert(error.message, this.$t("label.error"), {
            type: "error",
            callback: action => {
              if (this.autoClose) this.close(true);
            }
          });
          Event.fire(EventList.RELOAD_LIST);
          Event.fire(EventList.RELOAD_TREE);
        });
    },
    close(error = false) {
      this.dialogVisible = false;
      this.isDone = false;
      this.currentPercent = 0;
      Utils.showResultMessage(!error);
      this.$store.commit("closeHovers");
      if (!error) this.$emit("postAction");
    },
    handleClose(done) {
      if (this.isDone) {
        this.close();
        return;
      }
      this.$confirm(this.$t("label.cancelMessage")).then(_ => {
        api.cancelProgress(this.actionId).then(data => {
          this.close();
        });
      });
    }
  }
};
</script>
