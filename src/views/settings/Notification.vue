<template>
<el-dialog ref="windowRef" :title="$t('label.manageNoty')" :before-close="onClose" :visible.sync="dialogVisible" v-draggable>
<div :style="{'max-height': containerHeight}" class="rules" v-loading="isLoading">
<el-container v-if="!isLoading" >
  <el-main>
    <el-header class="rules-header bg-purple-light rules-inherited" height="50px">
        <el-switch v-model="inherited" @change="toggleInheritance"
          :active-text="$t('label.inherited')" :inactive-text="$t('label.notInherited')" style="margin-right: 10px;"></el-switch>
        <el-tooltip class="item" effect="dark" :content="$t('messages.executeRule')" placement="bottom">
        <el-button class="button-new-tag option-right" size="small" @click="executeRule" v-show="!inherited" :disabled="executing" v-loading="executing">{{ $t('label.execute') }} </el-button>
        </el-tooltip>
    </el-header>
    <el-form :model="model" ref="form" label-width="150px" :disabled="inherited">
      <el-form-item :label="$t('label.activity')" prop="ruleDisabled">
        <el-switch v-model="model.ruleDisabled" :active-value="false" :inactive-value="true" :inactive-text="$t('label.disabled')" :active-text="$t('label.enabled')"></el-switch>
      </el-form-item>
      <el-form-item :label="$t('label.appliedToChildren')" prop="appliedToChildren">
        <el-switch v-model="model.appliedToChildren" ></el-switch>
      </el-form-item>

      <el-form-item :label="$t('label.actions')">
        <el-checkbox-group v-model="model.ruleTypes" :min="1">
          <el-checkbox v-for="type in allRuleTypes" :label="type.name" :key="type.name">{{type.displayLabel? type.displayLabel:type.name}}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item :label="getParameterValue('to_many', 'displayLabel')" @submit.native.prevent>
        <el-tag :key="role.id" v-for="role in roles" :closable="!inherited" :disable-transitions="false" @close="handleRemoveRole(role)">
          <i v-if="role.type==-1" class="fa fa-user" aria-hidden="true"></i>
          <i v-else class="fa fa-users" aria-hidden="true"></i>
          {{$Utils.getUserNameForUI(role.id, role.name)}}
        </el-tag>
        <el-button class="button-new-tag" size="small" @click="showUserGroup" :disabled="inherited">{{ $t('label.add') }} </el-button>
      </el-form-item>

      <el-form-item :label="getParameterValue('ignore_send_failure', 'displayLabel')">
        <el-checkbox v-model="model.actions[0].parameterValues['ignore_send_failure']">&nbsp;</el-checkbox>
      </el-form-item>

      <el-form-item :label="getParameterValue('providers', 'displayLabel')">
        <el-checkbox-group v-model="model.checkedProviders" :min="1">
          <el-checkbox v-for="provider in providers" :label="provider.name" :key="provider.name">{{$t('label.' + provider.name)}}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>

    </el-form>
  </el-main>
</el-container>
</div>

<span slot="footer" class="dialog-footer">
  <el-button @click="onClose">{{ $t('buttons.close') }}</el-button>
  <el-button type="danger" @click="handleDelete()" :disabled="inherited">{{ $t('buttons.init') }}</el-button>
  <el-button type="primary" @click="handleSave()" :disabled="inherited">{{ $t('buttons.save') }}</el-button>
</span>

</el-dialog>
</template>

<script>
import * as api from '@/utils/api'
import * as ruleapi from '@/utils/RulesApi'
import { mapState, mapActions } from 'vuex'
import SelectUserGroupDialog from '@/views/SelectUserGroupDialog'
import { create } from 'vue-modal-dialogs'

const userGroupDialog = create(SelectUserGroupDialog)


import {
  Form,FormItem,Input,Checkbox,Button
} from 'element-ui'

export default {
  name: 'notification',
  props: {
    elementId : {
      required : true, // false for test
      type: String
    },
    containerHeight: {
      type: String
    },
    width: {
      default: '80%',
      type: String
    },
    dynamic: {  // createDialog 로 생성되면 true
      default: true,
      type: Boolean
    }
  },
  data: () => ({
    dialogVisible : true,
    model: null,
    rules: [],
    parameters : [],
    inherited : false,
    linkedTo : null,
    isLoading: true,
    targetModel: {},
    providers: null,
    roles: [],   // roleId
    availableConditionSeeds: ['no-condition','compare-property-value'],
    requestReload: false,
    executing: false,
  }),
  components: {
  },
  computed: {
    ...mapState(['ruleTypes', 'ruleActions', 'ruleConditions', 'ruleConstraints']),
    allRuleTypes() {
      console.log(this.ruleTypes);
      return this.ruleTypes.filter(e => e.mandatory == true);
    }
  },
  methods: {
    ...mapActions(['loadRuleInfo']),
    handleRemoveRole(role) {
      this.roles.splice(this.roles.findIndex(e => e.id === role.id), 1);
    },
    async showUserGroup() {
        let params = {
            type: constants.VIEW_TYPES.SEL_USERGROUP,
            title: this.$t('messages.selectUser'),
            width: '80%',
            containerHeight: '600px',
            gridSelectable: constants.SELECTABLE.MULTIPLE
        }
        const result = await userGroupDialog(params)
        console.log('selected data is..')
        console.log(result)
        if (result && result.length > 0) {
          result.forEach(e => {
            let roleId = e.id
            let name = e.name
            if (e.type == -1) {
              roleId = '_user_' + roleId
            } else {
              name = e.description
            }
            if (this.roles.findIndex(r => r.id == roleId) < 0) {
              this.roles.push({id:roleId, type:e.type, name: name})
            }
          })
        }
    },
    handleDelete() {
      this.$confirm(this.$t('messages.confirmMessage', {action: this.$t('buttons.init')})).then(_ => {
        ruleapi.removeRule(this.elementId, this.model.ruleId).then(data=> {
          this.initRule()
        })
      })
    },
    executeRule() {
      this.$confirm(this.$t('messages.confirmMessage', {action: this.$t('label.execute')})).then(_ => {
        this.executing = true
        ruleapi.executeRule(this.elementId).then(data => {
          this.executing = false
          this.$showSuccess()
        }).catch(e => this.executing = false)
      })
    },
    // save current model
    handleSave() {

      if (!this.validate()) {
        this.$showError(this.$t('messages.invalidData'))
        return
      }

      this.model.actions[0].actionDefinitionName = this.model.actions[0].name
      this.model.conditions.forEach(e => {
        e.conditionDefinitionName = e.name
      })

      this.model.actions[0].parameterValues['subject'] = '${event}';
      this.model.actions[0].parameterValues['template'] = 'settings.notification.template.basic';
      this.model.actions[0].parameterValues['text'] = '[empty]';
      this.model.actions[0].parameterValues['to_many'] = this.roles.map(e => e.id);
      this.model.actions[0].parameterValues['providers'] = this.model.checkedProviders.join(',');

      let data = {
        title: this.model.title,
        description: this.model.description,
        ruleRefId: '',
        executeAsynchronously: this.model.executeAsynchronously,
        applyToChildren: this.model.appliedToChildren,
        disabled: this.model.ruleDisabled,
        ruleType: this.model.ruleTypes,
        action : {
          actionDefinitionName: 'composite-aciton',
          actions: this.model.actions,
          conditions: this.model.conditions
        },
      }

      ruleapi.saveRule(this.elementId, this.model.ruleId, data).then(data => {
        this.requestReload = true
        this.$showSuccess()
      }).catch( e => {
        console.log(e)
      })
    },

    validate() {
      if (!this.model.ruleTypes || this.model.ruleTypes.length < 1) {
        return false
      }
      if (this.roles.length < 1)
        return false
      if (this.model.checkedProviders.length < 1)
        return false

      let ok = true

      this.$refs['form'].validate((valid) => {
        if (!valid) {
          ok = false
        }
      })

      return ok
    },
    switchDisabled() {
      this.model.ruleDisabled = !this.model.ruleDisabled
    },

    switchApplyToChild() {
      this.model.appliedToChildren = !this.model.appliedToChildren
    },
    findCondition(name) {
      let found = this.ruleConditions.find(e => e.name === name)
      if (found)
        return found
      else return {}
    },
    availableConditions(names) {
      return this.ruleConditions.filter(e => {return names.includes(e.name)})
    },
    findConstraints(name) {
      let found = this.ruleConstraints.find(e => e.name === name)
      let obj = {}
      if(found)
        obj = found.allowableValues

      return Object.keys( obj ).map( p => Object.assign( {}, {name:p, value:obj[p]} ) )
    },
    findAction(name) {
      let found = this.ruleActions.find(e => e.name === name)
      if (found)
        return found
      else return {}
    },
    toggleInheritance(){
      ruleapi.toggleInheritance(this.elementId).then(data => {
        this.inherited = data.inherited
        // reload
        this.init()
      })
      .catch(e => {
        this.inherited = !this.inherited
      })
    },
    initRule() {
      this.model = {
        title: '##Notification##'+this.elementId, description: '',
        ruleId : null,
        ruleDisabled: true,
        appliedToChildren: true, executeAsynchronously: false,
        ruleTypes: [],
        conditions: [{
          name: 'no-condition',
          invertCondition: false,
          parameterValues: {}
        }],
        actions: [{name : "notification", parameterValues: {}}],
        checkedProviders: [],
      }
      if (this.roles.length > 0)
        this.roles.splice(0, this.roles.length)
    },
    getParameterValue(name, column) {
      let i = this.parameters.findIndex(e => e.name === name)
      if (i >= 0)
        return this.parameters[i][column]
      return undefined
    },
    async init() {
      this.isLoading = true
      // load doctype
      await this.loadRuleInfo()

      this.initRule()

      this.parameters = this.findAction('notification').parameterDefinitions

      this.providers = this.findConstraints('ac-noty-providers')

      ruleapi.getRuleSet(this.elementId).then(data => {
        let ruleset = data.ruleset
        this.inherited = ruleset.inherited
        this.linkedTo = ruleset.linkedTo
        this.rules = ruleset.rules
        let index = this.rules.findIndex(e => {
          return e.title.startsWith('##Notification##')
        })
        if (index >= 0){
          this.model = jQuery.extend(true, {}, this.rules[index]) // copy
          let to_many = this.model.actions[0].parameterValues['to_many']
          if (to_many && to_many.length > 0) {
            let users = to_many
            if (!Array.isArray(to_many)) {
              users = to_many.split(';')
            }
            this.roles = users.map(e => {
              let type = e.startsWith('_user_')? -1:0;
              let name = String(e).replace("_user_", "")
              return {id: e, name: name, type: type}
            })
          }
          this.model.checkedProviders = this.model.actions[0].parameterValues['providers'].split(',')
        }
        this.isLoading = false
      }).catch(e => {
        this.isLoading = false
      })

    },
    onClose(e) {
      if (this.dynamic)
        this.$close(null)
      else
        this.$store.commit('closeHovers')

      if (this.requestReload) {
        Event.fire(EventList.RELOAD_LIST)
        this.requestReload = false
      }
    },
  },

  created() {
    this.init()
  }
}
</script>
<style>
.rules {
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0px 20px;
}

.name-wrapper {
  display: inline-block;
}
.rules-inherited{
  position: relative;
  left: -20px;
}


</style>
