<template>
  <el-dialog
    id="zip"
    :title="$t('prompts.zip')"
    width="60%"
    :visible.sync="dialogVisible"
    v-draggable
    :before-close="close"
  >
    <span>{{ $t('prompts.zipMessage') }}</span>
    <br />
    <div id="file_list">
      <kendo-grid id="filelist-kendoGrid" :data-source="dataSource" :columns="gridcolums"></kendo-grid>
    </div>
    <div id="file_info">
      <el-form
        ref="zipForm"
        :model="zipForm"
        :rules="rules"
        @keyup.enter.native="submit"
        @submit.native.prevent
      >
        {{$t('label.filename')}}
        <el-form-item prop="zipFilename">
          <el-input ref="zipFilenameInput" v-model="zipForm.zipFilename"></el-input>
        </el-form-item>
        <el-checkbox v-model="usePassword">{{$t('prompts.usingPassword')}}</el-checkbox>
        <el-form-item>
          <el-input type="password" v-model="zipForm.password" :disabled="!usePassword"></el-input>
        </el-form-item>
      </el-form>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submit()" :disabled="!enableButton">{{ $t('buttons.ok') }}</el-button>
      <el-button @click="close()">{{ $t('buttons.cancel') }}</el-button>
    </span>
    <progressbar ref="progressbar" message="Compress" :autoClose="true" @postAction="postAction"></progressbar>
  </el-dialog>
</template>

<script>
import Vue from "vue";
import url from "@/utils/url";
import Utils from "@/utils/utils";
import * as api from "@/utils/api";
import { mapState } from "vuex";
import { Grid, GridInstaller } from "@progress/kendo-grid-vue-wrapper";

Vue.use(GridInstaller);

export default {
  name: "zip",
  components: {
    progressbar: () => import("@/components/prompts/Progressbar"),
    Grid
  },
  watch: {
    "zipForm.zipFilename": function() {
      if (this.zipForm.zipFilename.length == 0) {
        this.enableButton = false;
      } else {
        this.enableButton = true;
      }
    }
  },
  data: function() {
    return {
      selectedList: null,
      dialogVisible: true,
      usePassword: false,
      enableButton: false,
      zipForm: {
        zipFilename: "",
        password: ""
      },
      rules: {
        zipFilename: [
          {
            validator: constants.FORM_VALIDATOR.FILTER_ILLEGAL_FILENAME,
            trigger: "change"
          }
        ]
      },
      dataSource: new kendo.data.DataSource({
        data: Utils.getCurrentSelect(),
        schema: {
          model: {
            fields: {
              object_name: { type: "string" },
              size: { type: "string" }
            }
          },
          data: function(response) {
            console.log(response);
            var cnt = response.length;
            for (var i = 0; i < cnt; i++) {
              var type = "";
              if (response[i].isFolder || response[i].docTypeName == "FOLDER") {
                type = "dm_folder";
                response[i].displaySize = "-";
              } else
                response[i].displaySize = Utils.convertByteSizeToString(
                  response[i].fileList[0].fileSize
                );
              var ext = Utils.getFileExtension(response[i].object_name);
              response[i].icon = Utils.getContentTypeClass(type, ext);
            }
            return response;
          }
        }
      })
    };
  },
  mounted() {
    this.$nextTick(_ => {
      this.$refs.zipFilenameInput.$refs.input.focus();
    });
    this.selectedList = Utils.getCurrentSelect();
    if (this.selectedList.length == 0) {
      this.close();
    }
    var cnt = this.selectedList.length;
    this.zipForm.zipFilename = this.selectedList[0].object_name;
    this.zipForm.zipFilename = Utils.removeFileExtension(
      this.zipForm.zipFilename
    );
    if (cnt > 1) {
      this.zipForm.zipFilename += " (";
      this.zipForm.zipFilename += cnt;
      this.zipForm.zipFilename += ")";
    }
    this.zipForm.zipFilename += ".zip";
  },
  created() {
    this.gridcolums = [
      {
        template: "<i class=' #= icon #'></i>",
        title: "",
        width: "40px",
        encoded: false
      },
      {
        field: "object_name",
        title: this.$t("label.filename"),
        width: "67%"
      },
      {
        field: "displaySize",
        title: this.$t("files.size"),
        width: "25%"
      }
    ];
  },
  computed: {
    ...mapState(["currentDir"])
  },
  methods: {
    submit: function(event) {
      if (this.zipForm.zipFilename.length <= 0) {
        return;
      }
      this.$refs.zipForm.validate(valid => {
        if (!valid) return;
        var filename = this.filterFileExtension();
        var cnt = this.selectedList.length;
        var items = "";
        var folderIds = "";
        for (var i = 0; i < cnt; i++) {
          if (this.selectedList[i].docTypeName == "FOLDER") {
            folderIds += this.selectedList[i].r_object_id;
            folderIds += ",";
          } else {
            items += this.selectedList[i].r_object_id;
            items += ",";
          }
        }
        folderIds = folderIds.slice(0, -1);
        items = items.slice(0, -1);
        if (!this.usePassword) this.zipForm.password = "";
        api
          .zipCompress(items, folderIds, filename, this.zipForm.password)
          .then(data => {
            this.hide();
            this.$refs.progressbar.getStatus(data.actionId, true);
          })
          .catch(error => {
            console.log(error);
          });
      });
    },
    postAction() {
      Event.fire(EventList.RELOAD_LIST);
      this.close();
    },
    filterFileExtension() {
      var tmp = this.zipForm.zipFilename.split(".");
      if (tmp.length == 0) return "";
      var cnt = tmp.length;
      var ext = tmp[cnt - 1].toLowerCase();
      if (ext == "zip") {
        cnt -= 1;
      }
      var tmp2 = "";
      for (var i = 0; i < cnt; i++) {
        tmp2 += tmp[i];
      }
      return tmp2;
    },
    close() {
      this.dialogVisible = false;
      this.$store.commit("closeHovers");
    },
    hide() {
      this.dialogVisible = false;
    }
  }
};
</script>
<style>
#zip .is-error {
  margin-bottom: 15px;
}
#filelist-kendoGrid {
  height: 30vh;
  overflow: auto;
}
#file_info {
  margin-top: 10px;
}
#file_info_area {
  width: 100%;
}
</style>

