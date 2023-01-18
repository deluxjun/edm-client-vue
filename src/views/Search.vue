<template>
  <div class="level" id="topSearch">
    <div class="dropdown search-menu">
      <div class="dropdown-trigger">
        <el-input
          type="text"
          :placeholder="this.$t('buttons.search')"
          v-model="autoCompleteValue"
          @keydown.native="handleChange"
        >
          <i
            class="el-icon-circle-plus js-dropdown el-input__icon"
            slot="prefix"
            aria-haspopup="true"
            aria-controls="dropdown-menu-search"
            @click="clickSubMenu"
            v-if="!daelimSearch"
          ></i>
          <i class="el-icon-circle-close-outline el-input__icon" slot="suffix" @click="resetSearch"></i>
        </el-input>
      </div>
      <div class="dropdown-menu search-popup" id="dropdown-menu-search" role="menu">
        <div class="dropdown-content">
          <div class="dropdown-item">
            <el-tabs v-model="activeName" @tab-click="tabClicked">
              <el-tab-pane :label="$t('search.index')" name="index" v-if="showSearchMenu">
                <el-card class="form">
                  <form-schema
                    ref="indexSearchForm"
                    :schema="schemaIndex"
                    v-model="searchModel"
                    v-show="!isTrashIndex"
                    @submit="searchService"
                  >
                    <el-button type="primary" @click="searchService">
                      {{
                      $t("buttons.search")
                      }}
                    </el-button>
                    <el-button
                      type="reset"
                      @click="$Utils.toggleActive('search-menu', false)"
                    >{{ $t("buttons.cancel") }}</el-button>
                  </form-schema>
                  <form-schema
                    ref="indexSearchFormTrash"
                    :schema="schemaIndexTrash"
                    v-model="searchModel"
                    v-show="isTrashIndex"
                    @submit="searchService"
                  >
                    <el-button type="primary" @click="searchService">
                      {{
                      $t("buttons.search")
                      }}
                    </el-button>
                    <el-button
                      type="reset"
                      @click="$Utils.toggleActive('search-menu', false)"
                    >{{ $t("buttons.cancel") }}</el-button>
                  </form-schema>
                </el-card>
              </el-tab-pane>
              <el-tab-pane :label="$t('search.fulltext')" name="fulltext" v-if="showfulltext">
                <el-card class="form">
                  <form-schema
                    ref="fullSearchForm"
                    :schema="schemaFull"
                    v-model="searchModelFull"
                    @submit="searchService"
                  >
                    <el-button type="submit" @click="searchService">
                      {{
                      $t("buttons.search")
                      }}
                    </el-button>
                    <el-button
                      type="reset"
                      @click="$Utils.toggleActive('search-menu', false)"
                    >{{ $t("buttons.cancel") }}</el-button>
                  </form-schema>
                </el-card>
              </el-tab-pane>
              <!-- <el-tab-pane :label="$t('search.conditiontext')" name="conditiontext" v-if="showConditionSearchMenu">
                      <div class='condition-search-box'>
                        <div class='condition-search-list'>{{ $t('label.filename') }}</div>
                        <div class='condition-search-list'>
                            <el-input v-model="name_1" class="condition_name" @keyup.enter.native="ConditionSearchService"></el-input>
                            <el-select v-model="name_op" class="condition_select">
                                <el-option
                                  v-for="item in options"
                                  :key="item.value"
                                  :label="item.label"
                                  :value="item.value">
                                </el-option>
                              </el-select>
                            <el-input v-model="name_2" class="condition_name" @keyup.enter.native="ConditionSearchService"></el-input>
                        </div>
                        <div class='condition-search-list'>
                            <el-button type="submit" @click="ConditionSearchService">{{ $t('buttons.search') }}</el-button>
                            <el-button type="reset" @click='$Utils.toggleActive("search-menu", false)'>{{ $t('buttons.cancel') }}</el-button>
                        </div>
                      </div>
              </el-tab-pane>-->
              <!-- <el-tab-pane :label="$t('search.overlaptext')" name="overlaptext" v-if="showSearchMenu">
                        <el-card class="form">
                            <el-form ref="overlapSearchForm" label-width="120px" @submit.native.prevent>
                              <el-form-item :label="$t('label.range')" >
                                <el-radio v-model="searchModelOverlap.mode" label="duplistname" @change="changeKeyword(true)">{{$t('label.samename')}}</el-radio>
                                <el-radio v-model="searchModelOverlap.mode" label="duplist" @change="changeKeyword(false)">{{$t('label.samefile')}}</el-radio>
                              </el-form-item>
                              <el-form-item :label="$t('label.keyword')" v-if="this.keywordState==true">
                                <el-input type="text" placeholder="Search" v-model="searchModelOverlap.elementName"  @keydown.native="enterEvent"></el-input>
                              </el-form-item>
                              <el-button type="submit" @click="searchService">{{ $t('buttons.search') }}</el-button>
                              <el-button type="reset" @click='$Utils.toggleActive("search-menu", false)'>{{ $t('buttons.cancel') }}</el-button>
                           </el-form>

                        </el-card>
              </el-tab-pane>-->
              <el-tab-pane
                v-if="
                  this.info.features &&
                    this.info.features.tag &&
                    showSearchMenu &&
                    showTagMenu
                "
                :label="$t('label.tags')"
                name="tag"
              >
                <el-card class="form" v-loading="tagLoading">
                  <vue-word-cloud :words="tags" :style="cloudStyle">
                    <template slot-scope="{ word, text, weight, color }">
                      <div
                        :style="{
                          cursor: 'pointer',
                          color: color,
                          'font-family': 'sans-serif'
                        }"
                        :title="weight"
                        @click="onTagClick(word)"
                      >{{ text }}</div>
                      <!-- ([, weight]) => weight > 10 ? 'DeepPink' : weight > 5 ? 'RoyalBlue' : 'Indigo' -->
                    </template>
                  </vue-word-cloud>
                </el-card>
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<!-- <template src="./template.html"></template> -->

<script>
import { mapState, mapMutations } from "vuex";
import FormSchema from "vue-json-schema";
// import FormSchemaFull from 'vue-json-schema'
import formInit from "@/utils/FormInit";
import * as api from "@/utils/api";
import { AutoComplete } from "@progress/kendo-dropdowns-vue-wrapper";
import VueWordCloud from "vuewordcloud";
import { create } from "vue-modal-dialogs";
import Overlap from "@/views/Overlap";

const overlapDialog = create(Overlap);

formInit("120px", FormSchema);
//formInit("120px", FormSchemaFull);

const defaultIndexSearchModel = {
  name: "",
  keyword: "",
  owner: "",
  modifier: ""
};
const defaultFullSearchModel = {
  name: "",
  range: "all",
  owner: "",
  modifier: ""
};

const defaultOverlapSearchModel = {
  mode: "duplistname",
  elementName: ""
};

export default {
  name: "search",
  data: () => ({
    activeName: "index",
    schemaIndex: require("@/schema/search_index"),
    schemaIndexTrash: require("@/schema/search_index_trash"),
    schemaFull: require("@/schema/search_full"),
    schemaOverlap: require("@/schema/search_overlap"),
    searchModel: defaultIndexSearchModel,
    searchModelFull: defaultFullSearchModel,
    searchModelOverlap: defaultOverlapSearchModel,
    autoCompleteValue: "",
    autoCompletePageSize: 20,
    timer: null,
    tags: [],
    keywordState: true,
    cloudStyle: {
      height: "500px"
    },
    tagLoading: true,
    showSearchMenu: true
  }),
  components: {
    // 'form-schema-index' : FormSchemaIndex,
    // 'form-schema-full' : FormSchemaFull,
    FormSchema,
    [VueWordCloud.name]: VueWordCloud,
    AutoComplete
  },
  computed: {
    ...mapState(["info", "rootId"]),
    isTrashIndex() {
      return this.rootId == "onlyExpired" || this.rootId == "trash";
    },
    showfulltext() {
      return Utils.featuresDefault("showFullText", false);
    },
    showTagMenu() {
      return Utils.featuresDefault("showTagMenu", false);
    },
    showConditionSearchMenu() {
      return Utils.featuresDefault("showConditionSearchMenu", false);
    },
    daelimSearch() {
      return Utils.featuresDefault("daelim.search", false);
    }
  },
  mounted() {
    this.enterEvent();
    Event.off(EventList.CUSTOM_SEARCH);
    Event.listen(EventList.CUSTOM_SEARCH, this.externalSearchView);
    this.setDateDefault();
    console.log("==================>검색");

    this.showIndexSearchTagMenu(this.schemaIndex);
  },
  methods: {
    ...mapMutations(["setSearchOption"]),
    externalSearchView() {
      this.showSearchMenu = false;
      this.activeName = "fulltext";
    },
    showIndexSearchTagMenu(schemaIndex) {
      let exceptionSearchMenu = Utils.features("exceptionSearchMenu") || "";
      let removeList = exceptionSearchMenu.split(",");
      let condition = Utils.featuresDefault("showConditionSearchMenu", false);
      if (!condition) {
        removeList.push("condition");
      } else {
        removeList.push("name");
      }
      if (removeList.length > 0) {
        let paneLabel = $("#pane-index").find("label");
        for (var i = 0; i < paneLabel.length; i++) {
          removeList.forEach(exception => {
            if (exception.trim() == paneLabel[i].htmlFor) {
              $(paneLabel[i])
                .parent()
                .hide();
            }
          });
        }
      }
    },
    setDateDefault() {
      console.log("SET DEFAULT");
      //기본 데이터 세팅
      const end = new Date();
      const start = new Date();
      let day = parseInt(Utils.featuresDefault("search.dateDiff", 30));
      start.setTime(start.getTime() - 3600 * 1000 * 24 * day);
      let values = [start, end];
      /*
      2020-04-20 : 김준호
      초기값을 코드에서 읽어서 기간차를 계산하도록 변경
      */
      this.searchModel = {
        ...this.searchModel,
        r_creation_date: values,
        r_creation_date_fr: Utils.toDateString(values[0]),
        r_creation_date_to: Utils.toDateString(values[1]),
        r_modify_date: values,
        r_modify_date_fr: Utils.toDateString(values[0]),
        r_modify_date_to: Utils.toDateString(values[1])
      };

      //this.setSearchOption(this.searchModel);
    },
    enterEvent() {
      $(".search-popup").on("keydown", ".el-input__inner", e => {
        if (e.keyCode === 13) {
          this.autoCompleteValue = "";
          this.searchService();
        }
        console.log("Enter Key Search");
      });
    },
    getTypeClass(type, ext) {
      return Utils.getContentTypeClass(type, ext);
    },
    tabClicked() {
      if (this.activeName === "tag") {
        this.tagLoading = true;
        this.getTags();
      }
    },
    getTags() {
      console.log("getTags");
      if (!this.info.features || !this.info.features.tag) return [];
      let max = this.info.features.tagOption.visibleCount;
      api.getTags(1, max).then(r => {
        this.tagLoading = false;
        this.tags = r.list.map(e => {
          let color =
            e.count > 100
              ? "Red"
              : e.count > 10
                ? "DeepPink"
                : e.count > 5
                  ? "RoyalBlue"
                  : "Indigo";
          return {
            word: e.id,
            text: e.description,
            weight: e.count,
            color: color
          };
        });
      });
    },
    onTagClick(tag) {
      Event.fire(EventList.SEARCH_TAG, tag.word);
      Event.fire(EventList.CLOSE_POPUPS);
    },
    handleChange(e) {
      clearTimeout(this.timer);
      console.log(e.target.value);
      if (e.target.value.length > 0) {
        if (e.keyCode === 13) {
          if (!this.daelimSearch) {
            this.searchAuto(e.target.value);
          } else {
            let query = e.target.value;
            let username = Utils.getCookie("VFUSER");
            let url = `http://newecm.daelim.co.kr/xedrm/view/ecmSearch/search.jsp?query=${query}&username=${username}`;
            window.open(url);
          }
        }
        this.splitterclose();
      }
    },
    clickSubMenu() {
      this.$Utils.toggleActive("search-menu");
    },
    resetSearch() {
      if (!this.showSearchMenu) {
        this.autoCompleteValue = "";
        let data = { url: api.URLS.FULL_SEARCH };
        this.setSearchOption(data);
        Event.fire(EventList.SEARCH, data);
      } else {
        this.autoCompleteValue = "";
        Event.fire(EventList.RELOAD_DIR);
      }
      this.$Utils.toggleActive("search-menu", false);
    },
    ConditionSearchService() {
      let data = {};
      data.url = "/json/searchDoc";
      data.content = {
        categories: "",
        keyword: "",
        modifier: "",
        name: "",
        owner: "",
        r_creation_date_fr: "",
        r_creation_date_to: "",
        r_creator_name: "",
        r_folder_id: "",
        r_modify_date_fr: "",
        r_modify_date_to: "",
        name_1: this.name_1,
        name_2: this.name_2,
        name_op: this.name_op
      };
      Event.fire(EventList.SEARCH, data);
      Event.fire(EventList.CLOSE_POPUPS);
      this.setSearchOption(data);
    },
    searchService() {
      let form = "";
      let data = {};
      if (
        this.searchModel.r_creation_date_fr == null ||
        this.searchModel.r_creation_date_to == null
      ) {
        this.setDateDefault();
      }
      if (this.activeName === "index") {
        form = this.$refs.indexSearchForm;
        data.url = api.URLS.INDEX_SEARCH;
        data.content = this.searchModel;
        console.log("=====Search=====");

        console.log("=searchModel=");
        console.log(this.searchModel);
        console.log("=data=");
        console.log(data);
        this.validateForm(form)
          .then(() => {
            // Event.fire(EventList.SEARCH, {url: api.URLS.INDEX_SEARCH, content: vue.searchModel})
            Event.fire(EventList.SEARCH, data);
            Event.fire(EventList.CLOSE_POPUPS);
          })
          .catch(e => {
            console.log("error : " + e);
          });
        this.splitterclose();
        this.setSearchOption(data);
      }

      if (this.activeName === "fulltext") {
        form = this.$refs.fullSearchForm;
        data.url = api.URLS.FULL_SEARCH;
        data.content = this.searchModelFull;
        this.validateForm(form)
          .then(() => {
            // Event.fire(EventList.SEARCH, {url: api.URLS.INDEX_SEARCH, content: vue.searchModel})
            Event.fire(EventList.SEARCH, data);
            Event.fire(EventList.CLOSE_POPUPS);
          })
          .catch(e => {
            console.log("error : " + e);
          });
        this.splitterclose();
        this.setSearchOption(data);
      }

      if (this.activeName === "overlaptext") {
        if (this.searchModelOverlap.elementName) {
          let param = {
            mode: this.searchModelOverlap.mode,
            elementName: this.searchModelOverlap.elementName,
            searchPane: true
          };
          Event.fire(EventList.OPEN_SPLITTER, param);
          Event.fire(EventList.LOAD_SPLITTER, param);
          Event.fire(EventList.CLOSE_POPUPS);
        } else {
          let param = {
            mode: this.searchModelOverlap.mode,
            searchPane: true
          };
          Event.fire(EventList.OPEN_SPLITTER, param);
          Event.fire(EventList.LOAD_SPLITTER, param);
          Event.fire(EventList.CLOSE_POPUPS);
        }
        this.setSearchOption(data);
      }
    },
    async overlapOpen() {
      console.log(this.searchModelOverlap.mode);
      const result = await overlapDialog({
        mode: this.searchModelOverlap.mode,
        elementName: this.searchModelOverlap.elementName
      });
    },
    changeKeyword(param) {
      this.keywordState = param;
    },
    splitterclose() {
      Event.fire(EventList.CLOSE_SPLITTER);
    },
    // autocomplete search
    searchAuto(value) {
      let model = {};
      let data = {};
      if (!this.showSearchMenu) {
        model = Object.assign({}, defaultFullSearchModel);
        model.name = value;
        data = { url: api.URLS.FULL_SEARCH, content: model };
        Event.fire(EventList.SEARCH, data);
      } else if (
        !this.info.defaultSearch ||
        this.info.defaultSearch === "index"
      ) {
        /*
        2020-04-20 : 김준호
        검색창옵션과 동일한 조건을 가지고 검색어, 부모폴더 만 변경해서 재검색 하도록 변경
        */
        //model = Object.assign({}, defaultIndexSearchModel);
        model = Object.assign({}, this.searchModel);

        model.name = value;
        model.r_folder_id = Utils.getCurrentSelect()[0].r_object_id;

        data = { url: api.URLS.INDEX_SEARCH, content: model };
        // let values = Object.assign({}, vue.searchModel)
        Event.fire(EventList.SEARCH, {
          url: api.URLS.INDEX_SEARCH,
          content: model
        });
      } else {
        model = Object.assign({}, defaultFullSearchModel);
        model.name = value;
        data = { url: api.URLS.FULL_SEARCH, content: model };
        Event.fire(EventList.SEARCH, data);
      }
      this.setSearchOption(data);
    },
    validateForm: function(form) {
      return new Promise((resolve, reject) => {
        form.form().validate(valid => {
          if (valid) {
            resolve();
            form.clearErrorMessage();
          } else {
            form.setErrorMessage("Please fill out the required fields");
            reject();
            return false;
          }
        });
      });
    },
    passForm: function() {
      return new Promise((resolve, reject) => {
        resolve();
      });
    }
    // auto select 후 선택하면 해당 폴더나 파일로 이동
    // TODO : 파일 이동 구현해야함
    // handleAutoCompleteSelect(item) {
    //   console.log(item);
    //   Event.fire(EventList.FOLDER_SELECTED, item.idPath)
    // },
    // autocomplete search
    // querySearchAsync(queryString, cb = null) {
    //   if (!queryString && queryString.length < 1) {
    //     return
    //   }

    //   if (!this.info.defaultSearch || this.info.defaultSearch === 'index') {
    //     let model = Object.assign({}, this.searchModel); model.name = queryString
    //     api.searchIndex(model, 1, this.autoCompletePageSize).then( (res) => {
    //       if (cb)
    //         cb(res.list);
    //     })
    //   } else {
    //     let model = Object.assign({}, this.searchModelFull); model.name = queryString
    //     api.searchFull(model, 1, this.autoCompletePageSize).then( (res) => {
    //       if (cb)
    //         cb(res.list);
    //     })
    //   }
    // },
  }
};
</script>
<style lang="scss">
.search-popup {
  position: fixed;
  /* bottom: 0; */
  right: 5px;
  top: $header-height;
  left: auto;
}

.form {
  text-align: left;
  width: 500px;
  margin: auto;
}

.el-alert {
  margin-bottom: 15px;
}

.my-autocomplete {
  width: 450px !important;
}

.my-searchbutton {
  font-size: 1rem;
  height: 2.25em;
}

.search-menu .el-input__inner {
  font-size: 1rem;
  height: 2.25em;
}
.search-menu .el-input__icon {
  color: #303133;
  line-height: 2.25em;
}

.search-menu .el-input-group__prepend {
  padding: 0 5px;
}

.my-autocomplete li {
  line-height: normal;
  padding: 7px;
}

.my-autocomplete li .value {
  text-overflow: ellipsis;
  overflow: hidden;
}

.my-autocomplete li .value i {
  margin-right: 5px;
}

.my-autocomplete li .link {
  font-size: 12px;
  color: #b4b4b4;
}
div.search-menu > div:first-child input {
  border-radius: 100px;
}
.el-tabs__item:hover,
.el-tabs__item.is-active,
.el-tabs__active-bar,
.el-radio__input.is-checked + .el-radio__label {
  color: #409eff;
}

.el-button--primary,
.el-button--submit {
  color: white;
}
.el-button--primary,
.el-button--submit,
.el-radio__input.is-checked .el-radio__inner {
  border-color: #409eff;
  background: #409eff;
}

.tag-cloud {
  height: 500px;
}

#dropdown-menu-search {
  left: auto;
}
</style>
