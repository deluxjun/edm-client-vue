<template>
    <el-input :placeholder="this.$t('messages.selectUser')" v-model="currentValue" :disabled="true"
        @focus="handleFocus"
        @blur="handleBlur">
        <el-button class='right-line' slot="append" icon="el-icon-search" @click="openUserPicker"></el-button>
        <el-button slot="append" icon="el-icon-error" @click="resetinput"></el-button>
    </el-input>
</template>

<script>
import SelectUserGroupDialog from '@/views/SelectUserGroupDialog'
import Constants from '../Constants'
import { create } from 'vue-modal-dialogs'

const userGroupDialog = create(SelectUserGroupDialog)

export default {
    name : 'date-range-picker',
    props : [
        'value'
    ],
    watch: {
      'value'(val, oldValue) {
        console.log(val);
        this.setCurrentValue(val);
      }
    },
    data() {
        return {
            currentValue : this.value,
            tempName : ''
        };
    },
    mounted(){
         //User Name Reset
        Event.off(EventList.SEARCH_RESET)
        Event.listen(EventList.SEARCH_RESET, this.resetinput)
    },
    methods : {
        setCurrentValue(value) {
            if (value === this.currentValue)
                return;

            this.currentValue = this.tempName;
            // if (this.validateEvent) {
            //     this.dispatch('ElFormItem', 'el.form.change', [value]);
            // }
        },
        handleBlur(event) {
            // this.focused = false;
            this.$emit('blur', event);
            // if (this.validateEvent) {
            //     this.dispatch('ElFormItem', 'el.form.blur', [this.currentValue]);
            // }
        },
        handleFocus(event) {
            // this.focused = true;
            this.$emit('focus', event);
        },
        handleChange(values) {
            this.$emit('change', values.join(','));
            this.$emit('input', values);
            // this.setCurrentValue(values);
        },
        async openUserPicker() {
            console.log('assign clicked')
            let params = {
                type: Constants.VIEW_TYPES.SEL_USER,
                title: this.$t('messages.selectUser'),
                width: '80%', 
                containerHeight: '600px',
                gridSelectable: Constants.SELECTABLE.ROW
            }
            const result = await userGroupDialog(params)
            if (process.env.NODE_ENV === 'development') {
                console.log('selected data is..')
                console.log(result)
            }
            if (result) {
                this.$emit('input', result[0].id);
                this.tempName=result[0].name+"("+result[0].id+")";
            }
        },
        resetinput(){
            console.log("탓냐??????");
            this.currentValue=''
            this.$emit('input', '');
        }
    }

};
</script>

<style>
.el-input.is-disabled .el-input__inner {
    cursor: auto;
}
.right-line{
    border-right: 1px solid #eee !important;
}
</style>