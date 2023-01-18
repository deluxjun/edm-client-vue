<template>
<div :style="{'max-height': containerHeight}" class="rules" v-loading="isLoading">
<el-container v-if="!isLoading" >
  <el-header class="rules-header bg-purple-light" height="auto">
        <el-switch v-model="inherited" @change="toggleInheritance" :active-text="$t('label.inherited')" :inactive-text="$t('label.notInherited')" style="margin-right: 10px;"></el-switch>
        <el-button v-if="!linkedTo" type="primary" icon="el-icon-plus" size="small" @click='newRule'>{{ $t('buttons.new') }}</el-button>
        <el-button v-if="rules.length < 1" type="primary" icon="el-icon-share" size="small" @click='linkRule'>{{ $t('buttons.link') }}</el-button>
        <el-button v-if="linkedTo" type="warning" icon="el-icon-close" size="small" @click='unlinkRule'>{{ $t('buttons.unlink') }}</el-button>
        <el-card v-if="linkedTo" class="box-card" shadow="always">
          {{ linkedTo.path }} <i class="fa fa-folder"></i> {{ linkedTo.object_name }}
        </el-card>
  </el-header>
  <el-main>
    <el-table :data="rules" style="width: 100%" max-height="250">
      <!-- title, hover: description, icon : activity-->
      <el-table-column label="Title" width="180">
        <template slot-scope="scope">
          <i :class="scope.row.ruleDisabled? 'el-icon-error' : 'el-icon-success'" :style="{color: scope.row.ruleDisabled? 'red' : 'green'}"></i>
          <el-popover trigger="hover" placement="top">
            <p>{{ scope.row.description }}</p>
            <div slot="reference" class="name-wrapper">
              <span style="margin-left: 10px">{{ scope.row.title }}</span>
              <!-- <el-tag size="medium">{{ scope.row.name }}</el-tag> -->
            </div>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column label="Type" width="auto">
        <template slot-scope="scope">
          <el-tag :key="item" v-for="item in scope.row.ruleTypes" size="medium">{{ getRuleTypeName(item) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Condition" width="auto">
        <template slot-scope="scope">
          <el-tag :key="item.name" v-for="item in scope.row.conditions" size="medium">{{ (item.invertCondition? '- ' : '+ ') + findCondition(item.name).title }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Actions" width="auto">
        <template slot-scope="scope">
          <el-tag :key="item.name" v-for="item in scope.row.actions" size="medium">{{ findAction(item.name).title }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column v-if="!linkedTo" label="Operations" width="160">
        <template slot-scope="scope">
          <div v-show="!scope.row.inherited">
            <el-button size="mini" @click="handleEdit(scope.$index, scope.row)">{{ $t('buttons.edit') }}</el-button>
            <el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)">{{ $t('buttons.delete') }}</el-button>
          </div>
          <div v-show="scope.row.inherited">
            <p>{{$t('label.inherited')}}</p>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <el-form v-if="model" :model="model" ref="form" label-width="100px">
      <h3>{{ $t('messages.editRule') }}
        <div class="option-right">
          <el-button size="mini" @click="handleCancel()">{{ $t('buttons.cancel') }}</el-button>
          <el-button size="mini" type="primary" @click="handleSave()">{{ $t('buttons.save') }}</el-button>
        </div>
      </h3>

      <el-form-item :label="$t('label.name')" prop="title" :rules='{required: true, trigger: "blur"}'>
        <el-input v-model="model.title" :placeholder="$t('messages.inputName')"></el-input>
      </el-form-item>
      <el-form-item :label="$t('label.description')" prop="description" :rules='{required: true, trigger: "blur"}'> <!-- 설명 -->
        <el-input type="textarea" v-model="model.description" :placeholder="$t('messages.inputDesc')" ></el-input>
      </el-form-item>
      <el-form-item :label="$t('label.activity')" prop="ruleDisabled">
        <el-switch v-model="model.ruleDisabled" :active-value="false" :inactive-value="true" :inactive-text="$t('label.disabled')" :active-text="$t('label.enabled')"></el-switch>
      </el-form-item>
      <el-form-item :label="$t('label.executeAsynchronously')" prop="executeAsynchronously">
        <el-switch v-model="model.executeAsynchronously"></el-switch>
      </el-form-item>
      <el-form-item :label="$t('label.appliedToChildren')" prop="appliedToChildren">
        <el-switch v-model="model.appliedToChildren" ></el-switch>
      </el-form-item>
    </el-form>

    <div v-if="model">
      <!-- when -->
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>{{ $t('label.when') }}</span>
        </div>
        <el-select v-model="model.ruleTypes" multiple style="width:500px" placeholder="Select">
          <el-option v-for="item in ruleTypes" :key="item.name" :label="item.displayLabel" :value="item.name">
            <span style="float: left">{{ item.displayLabel }}</span>
            <span class="option-right">{{ item.name }}</span>
          </el-option>
        </el-select>
      </el-card>

      <!-- condition -->
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>{{ $t('label.conditions') }}</span>
          <el-button style="float: right; padding: 3px 0" type="text" @click="addCondition" >Add</el-button>
        </div>
        <div v-for="(item,index) in model.conditions" :key="index" class="card-item">
          <i v-if="item.invertCondition" class="el-icon-remove" :style="{color: 'red'}" @click="switchInvert(item, false)">(NOT)</i>
          <i v-else class="el-icon-circle-plus" :style="{color: 'green'}" @click="switchInvert(item, true)"></i>
          <el-select v-model="item.name" placeholder="Select" @change="initCondition(item)">
            <el-option v-for="condition in availableConditions(availableConditionSeeds)" :key="condition.name" :label="condition.title" :value="condition.name">
              <span style="float: left">{{ condition.name }}</span>
              <span class="option-right">{{ condition.title }}</span>
            </el-option>
          </el-select>
          <el-button style="float: right; padding: 3px 0" type="text" @click="remove(model.conditions, index)">Delete</el-button>
          <div v-if="findCondition(item.name).parameterDefinitions && findCondition(item.name).parameterDefinitions.length > 0" class="card-inner-item">
            <span v-for="param in findCondition(item.name).parameterDefinitions" :key="param.name">
              <el-input v-if="!param.parameterConstraintName" v-model="item.parameterValues[param.name]" :placeholder="param.displayLabel"></el-input>
              <el-select v-else v-model="item.parameterValues[param.name]" :placeholder="param.displayLabel">
                <el-option v-for="(constraints,cindex) in findConstraints(param.parameterConstraintName)" :key="cindex" :label="constraints.value" :value="constraints.name">
                  <span style="float: left">{{ constraints.value }}</span>
                  <span class="option-right">{{ constraints.name }}</span>
                </el-option>
              </el-select>
            </span>
          </div>
        </div>
      </el-card>

      <!-- Actions -->
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>{{ $t('label.actions') }}</span>
          <el-button style="float: right; padding: 3px 0" type="text" @click="addAction" >Add</el-button>
        </div>
        <div v-for="(aitem,index) in model.actions" :key="index" class="card-item">
          <el-select v-model="aitem.name" placeholder="Select" @change="initAction(aitem)">
            <el-option v-for="action in ruleActions" :key="action.name" :label="action.title? action.title: action.name" :value="action.name">
              <span style="float: left">{{ action.name }}</span>
              <span class="option-right">{{ action.title }}</span>
            </el-option>
          </el-select>
          <el-button style="float: right; padding: 3px 0" type="text" @click="remove(model.actions, index)">Delete</el-button>
          <div v-if="findAction(aitem.name).parameterDefinitions && findAction(aitem.name).parameterDefinitions.length > 0" class="card-inner-item">
            <el-form :model="aitem" ref="formAction" label-width="30%">

            <el-form-item v-for="(param) in findAction(aitem.name).parameterDefinitions" :label="param.displayLabel? param.displayLabel : param.name" :key="param.name" :prop="'parameterValues[\''+param.name+'\']'"
              :rules="{required: param.mandatory, trigger:'blur', message: param.name + ':' + $t('messages.required') }">
              <!-- <span>{{ param.displayLabel }}</span> -->
              <el-input v-if="!param.parameterConstraintName && param.type === 'java.lang.String'" v-model="aitem.parameterValues[param.name]" :placeholder="param.displayLabel"></el-input>
              <el-input v-else-if="!param.parameterConstraintName && param.type === 'java.lang.Integer'" v-model.number="aitem.parameterValues[param.name]" :placeholder="param.displayLabel"></el-input>
              <el-checkbox v-else-if="!param.parameterConstraintName && param.type === 'java.lang.Boolean'" v-model="aitem.parameterValues[param.name]">&nbsp;</el-checkbox>
              <el-select v-else v-model="aitem.parameterValues[param.name]" :placeholder="param.displayLabel">
                <el-option v-for="(constraints,cindex) in findConstraints(param.parameterConstraintName)" :key="cindex" :label="constraints.value" :value="constraints.name">
                  <span style="float: left">{{ constraints.name }}</span>
                  <span class="option-right">{{ constraints.value? constraints.value: constraints.name }}</span>
                </el-option>
              </el-select>
            </el-form-item>
            </el-form>
          </div>
        </div>
      </el-card>
    </div>
  </el-main>
</el-container>
</div>
</template>

<script>
import * as api from '@/utils/api'
import * as ruleapi from '@/utils/RulesApi'
import { mapState, mapActions } from 'vuex'
import FileFoldersDialog from '@/views/FileFoldersDialog'
import { create } from 'vue-modal-dialogs'

const fileFoldersDialog = create(FileFoldersDialog)

import {
  Form,FormItem,Input,Radio,Checkbox,Select,Option,Button
} from 'element-ui'

export default {
  name: 'rules',
  props: {
    elementId : {
      // default : '2017121310265600',   // test folder
      // default: '2018032015521900',  // link to 배부
//      default : '2017121310265600',   // 배부
      required : true, // false for test
      type: String
    },
    containerHeight: {
      type: String
    }
  },
  data: () => ({
    model: null,
    rules: [],
    inherited : false,
    linkedTo : null,
    isLoading: true,
    targetModel: {},
    availableConditionSeeds: ['no-condition','compare-property-value']
  }),
  components: {
  },
  computed: {
    ...mapState(['ruleTypes', 'ruleActions', 'ruleConditions', 'ruleConstraints']),

  },
  methods: {
    ...mapActions(['loadRuleInfo']),
    handleEdit(index, row) {
      this.model = jQuery.extend(true, {}, this.rules[index]) // copy
      console.log(index, row);
    },
    handleDelete(index, row) {
      this.$confirm(this.$t('prompts.deleteMessage')).then(_ => {
        ruleapi.removeRule(this.elementId, row.ruleId).then(data=> {
          let index = this.rules.findIndex(e => e.ruleId === row.ruleId)
          if (index != -1)
            this.rules.splice(index,1)
        })
      })
    },
    // save current model
    handleSave() {
      if (this.linkedTo) {
        this.$showError(this.$t('messages.cannotSavelinkedRule'))
        return
      }
      if (!this.validate()) {
        this.$showError(this.$t('messages.invalidData'))
        return
      }

      this.model.actions.forEach(e => {
        e.actionDefinitionName = e.name
      })
      this.model.conditions.forEach(e => {
        e.conditionDefinitionName = e.name
      })

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
        }
      }

      ruleapi.saveRule(this.elementId, this.model.ruleId, data).then(data => {
        // let index = this.rules.findIndex(e => e.ruleId === this.model.ruleId)
        // this.rules.splice(index,(index !== -1)? 1:0, data.ruleRef)
        this.model = null
        this.init()
        this.$showSuccess()
      }).catch( e => {
        console.log(e)
      })
    },
    handleCancel() {
      this.model = null
    },
    validate() {
      if (!this.model.ruleTypes || this.model.ruleTypes.length < 1) {
        return false
      }
      if (!this.model.conditions || this.model.conditions.length < 1) {
        return false
      }
      if (!this.model.actions || this.model.actions.length < 1) {
        return false
      }

      let ok = true
      // form 안에 form validation이 오류가 있는것 같음..
      // if (Array.isArray(this.$refs.formAction)) {
      //   this.$refs.formAction.forEach(e => {
      //     e.validate((valid) => {
      //         if (!valid) {
      //           ok = false
      //         }
      //       });
      //   })
      // }

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
    switchAsync() {
      this.model.executeAsynchronously = !this.model.executeAsynchronously
    },
    switchApplyToChild() {
      this.model.appliedToChildren = !this.model.appliedToChildren
    },
    getRuleTypeName(ruleType) {
      let found = this.ruleTypes.find(e => e.name === ruleType)
      if (found)
        return found.displayLabel
      return ruleType
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
    initCondition(item) {
      item.parameterValues = {value:''}
    },
    switchInvert(item, invert){
      item.invertCondition = invert
    },
    remove(arrays, index) {
      arrays.splice(index,1)
    },
    addCondition() {
      this.model.conditions.push({name : 'no-condition', parameterValues: {}})
    },
    initAction(item) {
      item.parameterValues = {}
    },
    addAction() {
      let first = this.ruleActions[0].name
      this.model.actions.push({name : first, parameterValues: {}})
    },
    newRule() {
      this.model = {
        title: '', description: '',
        ruleId : null,
        ruleDisabled: false, appliedToChildren: false, executeAsynchronously: false,
        ruleTypes: ['inbound'],
        conditions: [{
          name: 'no-condition',
          invertCondition: false,
          parameterValues: {}
        }],
        actions: []
      }
    },
    async linkRule() {
      const params = {
          disableList: true, type: 'rules', title: this.$t('messages.selectFolder'),
          width: '70%', containerHeight: '600px',
      }
      const selectedId = await fileFoldersDialog(params)
      if (selectedId && selectedId.rid) {
        // let selectedId = await
        ruleapi.linkRule(this.elementId, selectedId.rid).then(data => {
          this.init()
          this.model = null
          this.$showSuccess()
        }).catch(e => {
          this.$showError(e)
        })
      }
    },
    unlinkRule() {
      this.$confirm(this.$t('messages.confirmMessage', {action: this.$t('buttons.unlink')})).then(_ => {
        ruleapi.unlinkRule(this.elementId).then(data => {
          this.rules = []
          this.model = null
          this.linkedTo = null
          this.$showSuccess()
        })
      })
    },
    init() {
      this.isLoading = true
      // load doctype
      this.loadRuleInfo()

      ruleapi.getRuleSet(this.elementId).then(data => {
        let ruleset = data.ruleset
        this.inherited = ruleset.inherited
        this.linkedTo = ruleset.linkedTo
        this.rules = ruleset.rules
        this.isLoading = false
      }).catch(e => {
        this.isLoading = false
      })
    }
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


</style>
