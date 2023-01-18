<template>
    <div class="block">
        <!-- <el-date-picker v-model="currentValue" type="daterange" align="right" unlink-panels range-separator="~" :start-placeholder="this.$t('adminMenu.history_start')"
            :end-placeholder="this.$t('adminMenu.history_end')" :picker-options="pickerOptions2" @change="handleChange"
                @focus="handleFocus"
                @blur="handleBlur"
            >
        </el-date-picker> -->
        <el-date-picker class="searchDateRange"
            v-model="start"
            type="date"
            placeholder=""
            :picker-options="startPickerOptions"
            :clearable="false"
            @change="checkStartDate"
            >
        </el-date-picker>
        ~
        <el-date-picker class="searchDateRange"
            v-model="end"
            type="date"
            placeholder=""
            :clearable="false"
            :picker-options="endPickerOptions"
            @change="checkEndDate"
            >
        </el-date-picker>
    </div>
</template>

<script>
import * as api from "@/utils/api";
export default {
  name: "date-range-picker",
  props: ["value"],
  watch: {
    value(val, oldValue) {
      this.setCurrentValue(val);
    }
  },
  data() {
    return {
      currentValue: this.value,
      start: "",
      end: "",
      startPickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now();
        }
      },
      endPickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now();
        }
      },
      pickerOptions2: {
        shortcuts: [
          {
            text: this.$t("adminMenu.last_week"),
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", [start, end]);
            }
          },
          {
            text: this.$t("adminMenu.last_month"),
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit("pick", [start, end]);
            }
          },
          {
            text: this.$t("adminMenu.last_3month"),
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit("pick", [start, end]);
            }
          }
        ]
      }
    };
  },
  mounted() {
    this.setDateDefault();
  },
  methods: {
    setCurrentValue(value) {
      if (value === this.currentValue) return;
      this.currentValue = value;
      // if (this.validateEvent) {
      //     this.dispatch('ElFormItem', 'el.form.change', [value]);
      // }
    },
    setDateDefault() {
      this.end = new Date();
      let setStart = new Date();
      //setStart.setTime(setStart.getTime() - 3600 * 1000 * 24 * 30);
      /*
      2020-04-20 : 김준호
      초기값을 코드에서 읽어서 기간차를 계산하도록 변경
      */
      let day = parseInt(Utils.featuresDefault("search.dateDiff", 30));
      this.start = setStart.setTime(
        setStart.getTime() - 3600 * 1000 * 24 * day
      );
      let values = [this.start, this.end];
      this.currentValue = values;
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
      if (!values) values = [];
      this.$emit("change", values.join(","));
      this.$emit("input", values);
      // this.setCurrentValue(values);
    },
    checkStartDate() {
      if (this.start > this.end) {
        this.start = this.end;
      }
      if (this.start) {
        this.$emit("input", [this.start, this.end]);
      } else {
        this.$emit("input", ["", this.end]);
      }
    },
    checkEndDate() {
      if (this.end < this.start) {
        this.end = this.start;
      }
      if (this.end) {
        this.$emit("input", [this.start, this.end]);
      } else {
        this.$emit("input", [this.start, ""]);
      }
    }
  }
};
</script>
<style>
.searchDateRange {
  width: 170px !important;
}
</style>
