import { Option } from 'element-ui'

import DateRangePicker from '@/components/DateRangePicker'
import FileSize from '@/components/FileSize'
import UserPicker from '@/components/UserPicker'
import FolderNameSearch from '@/components/FolderNameSearch'
import CategorySearch from '@/components/CategorySearch'
import ConditionSearch from '@/components/ConditionSearch'

export default function formInit(labelWidthLocal, FormSchema) {
FormSchema.setComponent('form', 'el-form', ({ vm }) => {
  // daterange 는 validator 무시해야함
    var validatorIgnore = (rule, value, callback) => {
        callback();
    };
    // vm is the FormSchema VM
    let labelWidth = '120px'
    if (labelWidthLocal)
      labelWidth = labelWidthLocal
    const model = vm.data
    const rules = {}

    // 초기화
    if (!vm.initialized) {
      const mySchema = vm.$options.propsData.schema
      mySchema.title = i18n.t(mySchema.title)
      mySchema.description = i18n.t(mySchema.description)

      vm.fields.forEach((field) => {
        field.title = i18n.t(field.title)
        field.label = i18n.t(field.label)
        field.placeholder = i18n.t(field.placeholder)

        // enum i18n
        if (field.items) {
          field.items.forEach(element => {
            element.label = i18n.t(element.label)
          });
        }
      })
      vm.initialized = true
    }

    vm.fields.forEach((field) => {
      let type = field.schemaType === 'array' && field.type === 'radio'? 'string' : field.schemaType
      const required = field.required

      const message = field.title
      const trigger = ['radio', 'checkbox', 'select'].includes(field.type)? 'change' : 'blur'
      // http://element.eleme.io/#/en-US/component/form#validation
      rules[field.name] = { type, required, message, trigger }
      // date range는 array를 _fr, _to 로 값을 추가로 입력
      if (field.type === 'daterange') {
        rules[field.name] = { type, validator: validatorIgnore, required, message, trigger }
        let arr = model[field.name]
        if (Array.isArray(arr) && arr.length > 1) {
            model[field.name + '_fr'] = Utils.toDateString(arr[0])
            model[field.name + '_to'] = Utils.toDateString(arr[1])
        } else {
          delete model[field.name + '_fr']
          delete model[field.name + '_to']
        }
      }
      if (field.type == 'condition') {
        let arr = model[field.name].split(',')
        if (arr.length > 1) {
            model['name_1'] = arr[0]
            model['name_op'] = arr[1]
            model['name_2'] =arr[2]
        } else {
          delete model['name_1']
          delete model['name_op']
          delete model['name_2']
          delete model['name']
        }
      }
      
    })
    // returning the form props
    return { labelWidth, rules, model }
  })
  // http://element.eleme.io/#/en-US/component/form#validation
  FormSchema.setComponent('label', 'el-form-item', ({ field }) => ({
    prop: field.name
  }))
  FormSchema.setComponent('email', 'el-input')
  FormSchema.setComponent('size', FileSize)
  FormSchema.setComponent('daterange', DateRangePicker)
  FormSchema.setComponent('condition', ConditionSearch)
  FormSchema.setComponent('user', UserPicker)
  FormSchema.setComponent('folder', FolderNameSearch)
  FormSchema.setComponent('category', CategorySearch)
  FormSchema.setComponent('text', 'el-input')
  FormSchema.setComponent('textarea', 'el-input')
  FormSchema.setComponent('checkbox', 'el-checkbox')
  FormSchema.setComponent('switch', 'el-switch')
  FormSchema.setComponent('radio', 'el-radio', ({ item }) => {
    return { label: item.value }
  })
  
  FormSchema.setComponent('radiogroup', 'el-radio-group')
  
  FormSchema.setComponent('select', 'el-select')
  // You can also use the component object
  FormSchema.setComponent('option', 'el-option')
  // By default `<h1/>` is used to render the form title.
  // To override this, use the `title` type:
  FormSchema.setComponent('title', 'h2')
  // By default `<p/>` is used to render the form title.
  // To override this, use the `description` type:
  FormSchema.setComponent('description', 'small')
  // By default `<div/>` is used to render the message error.
  // To override this, use the `error` type:
  FormSchema.setComponent('error', 'el-alert', ({ vm }) => ({
    type: 'error',
    title: vm.error
  }))
  FormSchema.setComponent('readonly','el-readonly', ({ vm }) => ({
    type: 'error',
    title: vm.error
  }))
}
