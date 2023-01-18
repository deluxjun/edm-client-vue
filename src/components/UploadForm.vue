	<template>
  <div>
    <Upload
      name="files"
      id="files"
      :async-save-url.sync="url"
      :async-auto-upload="false"
      :async-batch="false"
      :async-with-credentials="false"
      :multiple="multiple"
      :success="onSuccess"
      :error="onError"
      :select="onSelect"
      :remove="onRemove"
      :cancel="onRemove"
      :dropZone="useDragDropUpload()"
      :upload="onUpload"
    >
      <!-- cancel 하고 remove 시 똑같은 함수 실행-->
    </Upload>
  </div>
</template>
<script>
import Vue from "vue";
import { mapState } from "vuex";
import buttons from "@/utils/buttons";
import Utils from "@/utils/utils";
import { Upload, UploadInstaller } from "@progress/kendo-upload-vue-wrapper";

Vue.use(UploadInstaller);

export default {
  name: "uploadForm",
  props: ["multiple", "closeWhenUploaded", "uploadUrl"],
  components: {
    Upload
  },
  data: function() {
    return {
      current: window.location.pathname,
      dest: null,
      dialogVisible: true,
      failList: [],
      url: this.uploadUrl,
      blackListUID: [],
      totalfileSize: 0
    };
  },
  mounted() {
    const dragComment =
      store.state.info.features.useDragDropInUploadDialog == "true"
        ? this.$t("messages.dragcomment")
        : "";
    document.querySelector(".k-upload .k-dropzone em").innerHTML = dragComment;
  },
  computed: {
    ...mapState(["user"]),
    isAdmin() {
      return this.user.isAdmin;
    },
    isManager() {
      return this.user.isManager;
    }
  },
  methods: {
    useDragDropUpload() {
      if (store.state.info.features.useDragDropInUploadDialog == "true") {
        return "#dragzone";
      } else {
        return "false";
      }
    },
    upload: function() {
      var upload = $("#files").data("kendoUpload");
      upload.removeFile(function(file) {
        for (var i = 0; i < file.length; i++) {
          if (file[i].size == 0) {
            return true;
          } else return false;
        }
      });

      var check = $(".k-file-progress");
      if (check.length < 1) {
        this.$emit("uploadDone");
      }
      upload.upload();
      this.blackListUID = [];
    },
    uploadWithUrl: function(url) {
      var upload = $("#files").data("kendoUpload");
      upload.removeFile(function(file) {
        for (var i = 0; i < file.length; i++) {
          if (file[i].size == 0) return true;
          else return false;
        }
      });
      var check = $(".k-file-progress");
      if (check.length < 1) {
        this.$emit("uploadDone");
      }
      upload.options.async.saveUrl = url;
      upload.upload();
      this.blackListUID = [];
    },
    onError: function(e) {
      if (this.closeWhenUploaded == true) {
        this.$emit("closePopup");
        Utils.showResultMessage(false, null, e.response.errmsg);
      }
      if (this.totalCount <= 0) {
        this.$emit("uploadDone");
      }
    },
    onSuccess: function(e) {
      if (e.response.errcode != 0) {
        //서버반환 http 상태코드가 200이여서 수동으로 에러처리를 해야함
        this.setErrorMessage(
          e.files[0].uid,
          e.response.errmsg,
          e.response.errcode,
          e.files[0]
        );
        if (this.closeWhenUploaded == true) {
          this.$emit("closePopup");
          Utils.showResultMessage(
            false,
            e.response.errcode || null,
            e.response.errmsg
          );
        }
      } else {
        if (this.closeWhenUploaded == true) {
          this.$emit("closePopup");
          Utils.showResultMessage(true);
        }
        //중복 문서 확인창
        if (e.response.dupActionId && e.response.dupActionId.length > 0) {
          this.$confirm(this.$t("messages.isduplicateDoc"), "", {
            confirmButtonText: vue.$t("buttons.ok"),
            cancelButtonText: vue.$t("buttons.cancel"),
            type: "info"
          })
            .then(() => {
              api.ignoreDuplicateDoc(e.response.dupActionId);
            })
            .catch(() => {
              api.removeDuplicateDocDirectly(e.response.dupActionId);
              this.setErrorMessage(
                e.files[0].uid,
                this.$t("messages.duplicateDoc")
              );
            });
        }
        this.$emit("successCallback", e);
      }
      var check = $(".k-file-progress");
      if (check.length < 1) {
        this.$emit("uploadDone", e);
        this.totalfileSize = 0;
      }
    },
    onSelect: function(e) {
      if (!this.isAdmin && !this.isManager) {
        var sizeLimit = parseInt(Utils.featuresDefault("fileSizeLimit", 1));
        var totalSizeLimit = parseInt(Utils.features("totalfileSizeLimit"), 0);

        console.log(sizeLimit);
        if (sizeLimit <= 0) {
          this.$emit("enableUpload", true, e);
          this.$emit("onSelected", e);
          return;
        }

        var ext = Utils.featuresDefault("extension", "");
        var extList = null;

        var exceptionExtension = Utils.featuresDefault(
          "upload.exceptionExtension",
          ""
        );
        var exceptionExtList = null;

        try {
          extList = ext.split("/");
        } catch (exception) {
          extList = [];
        }

        try {
          exceptionExtList = exceptionExtension.split("/");
        } catch (exception) {
          exceptionExtList = [];
        }

        var fileCnt = e.files.length;
        for (var i = 0; i < fileCnt; i++) {
          var fileExt = e.files[i].extension.toLowerCase();

          //특정확장자만 용량 제약 풀기
          if (!extList.includes(fileExt) && sizeLimit < e.files[i].size) {
            this.blackListUID.push(e.files[i].uid);
          }
          //특정확장자 올릴시 업로드 제약
          if (exceptionExtList.includes(fileExt)) {
            this.exceptionExtCheck(fileExt, e.files[i].uid);
          }

          // 파일 사이즈 0 체크
          if (e.files[i].size == 0) {
            this.fileSizeZeroCheck(e.files[i].uid);
          }

          this.totalfileSize += e.files[i].size;
        }

        if (this.totalfileSize > totalSizeLimit) {
          this.totalfileSizeMsg(totalSizeLimit);
        }
      } else {
        var fileCnt = e.files.length;
        for (var i = 0; i < fileCnt; i++) {
          if (e.files[i].size == 0) {
            this.fileSizeZeroCheck(e.files[i].uid);
          }
        }
      }
      setTimeout(this.filterBlackListFile, 500);
      this.$emit("enableUpload", true, e);
      this.$emit("onSelected", e);
    },
    onRemove: function(e) {
      $(".k-file")
        .filter(`[data-uid=${e.files[0].uid}]`)
        .removeClass("k-file-progress");
      this.checkCount();
      this.$emit("minusCount", "total");
    },
    totalfileSizeMsg(totalSizeLimit) {
      this.$alert(
        this.$t("messages.totalSizeLimit", {
          size: Utils.convertByteSizeToString(totalSizeLimit)
        }),
        "",
        {
          confirmButtonText: this.$t("buttons.ok"),
          type: "warning"
        }
      )
        .then(() => {
          Event.fire(EventList.CLEAR_DATA, true);
          this.totalfileSize = 0;
        })
        .catch(() => {});
    },
    fileSizeZeroCheck(uid) {
      this.$alert(this.$t("messages.zerofileUpload"), "", {
        confirmButtonText: this.$t("buttons.ok"),
        type: "warning"
      })
        .then(() => {
          Event.fire(EventList.CLEAR_DATA, true);
          this.totalfileSize = 0;
        })
        .catch(() => {});
    },
    exceptionExtCheck(fileExt, uid) {
      this.$alert(
        "'" + fileExt + "'" + this.$t("messages.exceptionExtfileUpload"),
        "",
        {
          confirmButtonText: this.$t("buttons.ok"),
          type: "warning"
        }
      )
        .then(() => {
          Event.fire(EventList.CLEAR_DATA, true);
          this.totalfileSize = 0;
        })
        .catch(() => {});
    },
    checkCount: function() {
      var check = $(".k-file-progress");
      if (check.length == 0) {
        if ($(".k-toupload").length > 0) this.$emit("enableUpload", true);
        this.$emit("uploadDone");
      } else {
        this.$emit("enableUpload", false);
      }
    },
    cancelAll: function() {
      $("#files")
        .data("kendoUpload")
        .removeAllFiles();
    },
    allcheckedUpload(url) {
      var element = $(".k-file");
      element.removeClass("k-file-success").addClass("k-toupload");
      $(".k-upload-status").hide();
      this.uploadWithUrl(url);
    },
    initUploadClass(uid) {
      var element = $(".k-file").filter(`[data-uid=${uid}]`);
      element.removeClass("k-file-success").addClass("k-toupload");
      $(".k-upload-status").hide();
    },
    setErrorMessage(uid, msg, code, files) {
      let overwriteUpload = Utils.featuresDefault("overwriteUpload", false);
      if (code == "ECM0001" && overwriteUpload) {
        let data = {
          uid: uid,
          msg: msg,
          code: code,
          fileName: files.name
        };
        this.$emit("errorCallback", data);
      } else {
        if (code != "ECM0001") {
          var element = $(".k-file").filter(`[data-uid=${uid}]`);
          element.removeClass("k-file-success").addClass("k-file-error");
          element.find(".k-file-size").text(msg);
          this.$emit("errorCallback", 1);
          //건너뛰기 하는 경우
          this.$emit("successCallback", 1);
        }
      }
    },
    allErrorMessage() {
      var element = $(".k-file");
      element.removeClass("k-file-success").addClass("k-file-error");
    },
    allskipFileDelete() {
      var element = $(".k-file");
      element.remove();
      $(".k-upload-status").hide();
    },
    skipFileDelete(uid) {
      var element = $(".k-file").filter(`[data-uid=${uid}]`);
      element.remove();
      $(".k-upload-status").hide();
    },
    filterBlackListFile() {
      var limitSize = parseInt(Utils.features("fileSizeLimit"));
      for (var i = 0; i < this.blackListUID.length; i++) {
        this.setErrorMessage(
          this.blackListUID[i],
          this.$t("messages.isOverSize", {
            size: Utils.convertByteSizeToString(limitSize)
          })
        );
      }
    },
    onUpload(e) {
      var xhr = e.XMLHttpRequest;
      let sizeStr = e.files.map(e => e.size).join(",");
      let modifiedStr = e.files.map(e => e.rawFile.lastModified).join(",");
      if (xhr) {
        xhr.addEventListener("readystatechange", function(e) {
          if (xhr.readyState == 1 /* OPENED */) {
            xhr.setRequestHeader(
              "Authorization",
              `Bearer ${Utils.getCookie("auth")}`
            );
            xhr.setRequestHeader("FileSize", sizeStr);
            //xhr.setRequestHeader("LastModified", modifiedStr);
          }
        });
      }
    }
  }
};
</script>
<style>
.el-upload-dragger {
  width: 100%;
}
.el-upload {
  width: 100%;
}
.k-clear-selected,
.k-upload-selected {
  /*hide default upload button*/
  display: none !important;
}
.k-upload .k-dropzone em {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  font-style: normal !important;
  font-size: 8pt !important;
}
.k-upload .k-dropzone-hovered {
  background-color: #ededed !important;
}
.k-upload-files {
  max-height: 250px;
  overflow-y: auto;
}
</style> 