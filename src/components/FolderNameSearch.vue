<template>
    <el-input :placeholder="this.$t('messages.selectFolder')" v-model="currentValue" :disabled="true"
        @focus="handleFocus"
        @blur="handleBlur">
        <el-button class='right-line' slot="append" icon="el-icon-search" @click="openFolderPicker"></el-button>
        <el-button slot="append" icon="el-icon-error" @click="resetinput"></el-button>
    </el-input>
</template>

<script>
import FileFoldersDialog from "@/views/FileFoldersDialog";
import Constants from "../Constants";
import { create } from "vue-modal-dialogs";
import FolderPicker from "@/components/FolderPicker";

const filefolderDialog = create(FileFoldersDialog);
const folderPicker = create(FolderPicker);

export default {
  name: "date-range-picker",
  props: ["value"],
  watch: {
    value(val, oldValue) {
      console.log(val);
      this.setCurrentValue(val);
    }
  },
  data() {
    return {
      currentValue: this.value,
      tempName: ""
    };
  },
  mounted() {
    /*
    2020-04-20 : 김준호
    트리에서 우클릭->검색 시 'SEARCH_DEFAULT' 이벤트에 의해서 선택된 폴더값이 카테고리에도 영향을 주기에
    이벤트명을 변경함.
    */
    Event.off(EventList.LOAD_TREEDATA_FOLDER);
    Event.listen(EventList.LOAD_TREEDATA_FOLDER, this.defaultSetting);

    //folder Name Setting
    //Event.off(EventList.SEARCH_DEFAULT)
    //Event.listen(EventList.SEARCH_DEFAULT, this.defaultSetting)
  },
  methods: {
    setCurrentValue(value) {
      if (value === this.currentValue) return;

      this.currentValue = this.tempName;
      // if (this.validateEvent) {
      //     this.dispatch('ElFormItem', 'el.form.change', [value]);
      // }
    },
    handleBlur(event) {
      // this.focused = false;
      this.$emit("blur", event);
      // if (this.validateEvent) {
      //     this.dispatch('ElFormItem', 'el.form.blur', [this.currentValue]);
      // }
    },
    handleFocus(event) {
      // this.focused = true;
      this.$emit("focus", event);
    },
    handleChange(values) {
      this.$emit("change", values.join(","));
      this.$emit("input", values);
      this.setCurrentValue(values);
    },
    async openFolderPicker() {
      console.log("assign clicked");
      let params = {
        title: this.$t("messages.selectFolder"),
        width: "50%",
        containerHeight: "500px"
      };
      const result = await folderPicker(params);
      if (process.env.NODE_ENV === "development") {
        console.log("selected data is..");
        console.log(result);
      }
      if (result) {
        console.log(result);
        this.$emit("input", result.eid);
        this.tempName = result.name;
        this.setCurrentValue(result.name);
      }
    },
    resetinput() {
      this.currentValue = "";
      this.$emit("input", "");
    },
    defaultSetting(result) {
      console.log(result);
      if (result) {
        this.$emit("input", result[0].r_object_id);
        this.tempName = result[0].object_name;
        this.currentValue = result[0].object_name;
      }
    }
  }
};
</script>

<style>
.el-input.is-disabled .el-input__inner {
  cursor: auto;
}
.right-line {
  border-right: 1px solid #eee !important;
}
</style>
