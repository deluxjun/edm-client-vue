<template>
  <el-dialog
    ref="windowRef"
    :title="$t('label.setManageNoty')"
    :before-close="onClose"
    :visible.sync="dialogVisible"
    v-draggable
  >
    <div class="version-card">
      <file-card v-if="element" :element="element"></file-card>
    </div>
    <div :style="{'max-height': containerHeight}" class="rules">
      <el-container>
        <el-main>
          <el-form ref="form" label-width="150px">
            <el-form-item :label="$t('label.activity')" prop="ruleDisabled">
              <el-switch
                v-model="ruleDisabled"
                :active-value="true"
                :inactive-value="false"
                :inactive-text="$t('label.disabled')"
                :active-text="$t('label.enabled')"
              ></el-switch>
            </el-form-item>
            <el-form-item :label="$t('label.actions')" v-if="ruleDisabled">
              <el-checkbox-group v-model="ruleTypes" :min="1">
                <el-checkbox
                  v-for="type in allRuleTypes"
                  :label="type.id"
                  :key="type.id"
                  @change="changeRules"
                >{{$t('label.'+type.name)}}</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-form>
        </el-main>
      </el-container>
    </div>

    <span slot="footer" class="dialog-footer">
      <el-button @click="onClose">{{ $t('buttons.close') }}</el-button>
      <el-button type="primary" @click="handleSave()">{{ $t('buttons.save') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import * as api from "@/utils/api";
import * as ruleapi from "@/utils/RulesApi";
import { mapState, mapActions } from "vuex";
import SelectUserGroupDialog from "@/views/SelectUserGroupDialog";
import { create } from "vue-modal-dialogs";
import FileCard from "@/views/FileCard";

const userGroupDialog = create(SelectUserGroupDialog);

import { Form, FormItem, Input, Checkbox, Button } from "element-ui";

export default {
  name: "notification",
  props: {
    elementId: {
      required: true, // false for test
      type: String
    },
    containerHeight: {
      type: String
    },
    width: {
      default: "80%",
      type: String
    },
    dynamic: {
      // createDialog 로 생성되면 true
      default: true,
      type: Boolean
    }
  },
  data: () => ({
    dialogVisible: true,
    model: null,
    element: "",
    ruleDisabled: false,
    ruleTypes: [],
    allRuleTypes: [
      { name: "inbound", id: "inbound" },
      { name: "checkin", id: "checkin" },
      { name: "outbound", id: "outbound" }
    ]
  }),
  components: {
    "file-card": FileCard
  },
  computed: {
    ...mapState(["user"]),
    userId() {
      return this.user.userId;
    }
  },
  methods: {
    ...mapActions(["loadRuleInfo"]),
    // save current model
    handleSave() {
      if (this.ruleDisabled) {
        //알람 설정
        //체크 안된 것 확인
        let removeRuleType=[];
        for(var i=0; i<this.allRuleTypes.length;i++){
          if(this.ruleTypes.indexOf(this.allRuleTypes[i].id) == -1){
              removeRuleType.push(this.allRuleTypes[i].id);
          }
        }
        console.log(this.ruleTypes);
        console.log(removeRuleType);
        api
          .addAlarmUser(this.elementId, this.userId, this.ruleTypes,removeRuleType)
          .then(data => {
            this.requestReload = true;
            this.$showSuccess();
            this.onClose();
          })
          .catch(e => {
            console.log(e);
          });
      } else {
        // 알람 해지
        let removeRuleType=['inbound','checkin','outbound'];
        api
          .addAlarmUser(this.elementId, this.userId, [],removeRuleType)
          .then(data => {
            this.requestReload = true;
            this.$showSuccess();
            this.onClose();
          })
          .catch(e => {
            console.log(e);
          });
        // api
        //   .removeAlarmUser(this.elementId, this.userId)
        //   .then(data => {
        //     this.requestReload = true;
        //     this.$showSuccess();
        //     this.onClose();
        //   })
        //   .catch(e => {
        //     console.log(e);
        //   });
      }
    },
    initRule(folderId) {
      let param = {
        id: folderId,
        userId: this.userId,
        name: ""
      };
      api
        .setAlarmFolderList(param)
        .then(data => {
          if (data.list.length > 0) {
            this.ruleDisabled = true;
          } else {
            this.ruleDisabled = false;
          }
        })
        .catch(e => {
          console.log(e);
        });
      ruleapi
        .getNotificationRuleSet(folderId)
        .then(data => {
          if (data.ruleset.rules) {
              if(data.ruleset.rules.length==1){
                this.ruleTypes.push(data.ruleset.rules[0].ruleTypes[0])
              }else if(data.ruleset.rules.length==2){
                this.ruleTypes.push(data.ruleset.rules[0].ruleTypes[0])
                this.ruleTypes.push(data.ruleset.rules[1].ruleTypes[0])
              }else if(data.ruleset.rules.length==3){
                this.ruleTypes.push(data.ruleset.rules[0].ruleTypes[0])
                this.ruleTypes.push(data.ruleset.rules[1].ruleTypes[0])
                this.ruleTypes.push(data.ruleset.rules[2].ruleTypes[0])
              }
          }
        })
        .catch(e => {
          console.log(e);
        });
    },
    async init() {
      // elementid setting
      let elementData = await api.getElement(this.elementId);
      this.element = elementData.list[0];
      let folderId = elementData.list[0].r_object_id;
      this.initRule(folderId);
    },
    changeRules(e) {
      console.log(e);
      console.log(this.ruleTypes);
    },
    onClose(e) {
      this.$close(null);
    }
  },

  created() {
    this.init();
  }
};
</script>
<style>
.rules {
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0px 20px;
  margin-top: 20px;
}

.name-wrapper {
  display: inline-block;
}
.rules-inherited {
  position: relative;
  left: -20px;
}
</style>
