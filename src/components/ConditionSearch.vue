<template>
    <div class="block">
        <el-input v-model="name_1" class="condition_name" @change="handleChange"></el-input>
        <el-select v-model="name_op" class="condition_select" @change="handleChange">
                                <el-option
                                  v-for="item in options"
                                  :key="item.value"
                                  :label="item.label"
                                  :value="item.value">
                                </el-option>
          </el-select>
        <el-input v-model="name_2" class="condition_name" @change="handleChange"></el-input>
    </div>
</template>

<script>
export default {
    name : 'condition-picker',
    props : [
        'value'
    ],
    watch: {
      'value'(val, oldValue) {
        this.setCurrentValue(val);
      }
    },
    data() {
        return {
            currentValue : this.value,
            name_op: '',
            name_1: '',
            name_2: '',
            options: [
                {
                    value: '',
                    label: this.$t('label.sel_none')
                }, 
                {
                    value: 'AND',
                    label: 'AND'
                }, 
                {
                    value: 'OR',
                    label: 'OR'
                }
            ]
        };
    },
    mounted(){
        this.setDateDefault();
    },
    methods : {
        setCurrentValue(value) {
            if (value === this.currentValue)
                return;
            this.currentValue = value;
        },
        setDateDefault(){
            let values=[this.name_1,this.name_op,this.name_2];
            this.currentValue=values
        },
        handleBlur(event) {
            this.$emit('blur', event);
        },
        handleFocus(event) {
            this.$emit('focus', event);
        },
        handleChange(values) {
            if(this.name_1==''&&this.name_op==''&&this.name_2==''){
                let arr=[];
                this.$emit('change', '');
                this.$emit('input', '');
            }else{
                 let arr=[this.name_1,this.name_op,this.name_2];
                this.$emit('change', arr.join(','));
                this.$emit('input', arr.join(','));
            }
           
        },
    }

};
</script>
<style>
 .condition-search-box{
    width: 490px;
    border: 1px solid #ebeef5;
    padding: 5px;
  }
  .condition-search-list{
    margin-bottom: 10px;
  }
  .condition_name{
    width: 117px !important;
  }
  .condition_select{
    width: 120px !important;
  }
</style>