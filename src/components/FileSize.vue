<template>
<div>
   <div>파일 최소 사이즈</div>
   <div>
       <el-input class='file-size-search-input' v-model="minSize"></el-input>
       <el-select v-model="minunit" class='file-size-search-select'>
            <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value">
            </el-option>
       </el-select>
   
   </div>
   <div>파일 최대 사이즈</div>
   <div>
       <el-input class='file-size-search-input' v-model="maxSize"></el-input>
        <el-select v-model="maxunit" class='file-size-search-select'>
            <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value">
            </el-option>
       </el-select>
   </div>
</div>
</template>

<script>
import FileFoldersDialog from '@/views/FileFoldersDialog'
import Constants from '../Constants'
import { create } from 'vue-modal-dialogs'
import FolderPicker from '@/components/FolderPicker'

const filefolderDialog = create(FileFoldersDialog)
const folderPicker = create(FolderPicker)

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
            tempName : '',
            minSize: 1,
            minunit: 1,
            maxSize: 1,
            maxunit: 1,
            options: [{
                value:  1,
                label: 'byte'
            }, {
                value: 1024,
                label: 'KB'
            }, {
                value: 1024*1024,
                label: 'MB'
            },{
                value: 1024*1024*1024,
                label: 'GB'
            }]
        };
    },
    mounted(){
        Event.off(EventList.LOAD_TREEDATA)
        Event.listen(EventList.LOAD_TREEDATA, this.defaultSetting)

        //folder Name Setting
        //Event.off(EventList.SEARCH_DEFAULT)
        //Event.listen(EventList.SEARCH_DEFAULT, this.defaultSetting)
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
            this.setCurrentValue(values);
        },
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
.file-size-search-input{
    width: 70%;
    float: left;
}
.file-size-search-select{
    width: 30%;
    float: left;
}
</style>