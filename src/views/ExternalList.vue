<template id="main">
    <div id="edrm-right-sub">
        <component ref="currentComp" :is="currentView" v-bind="properties"></component>
    </div>
</template>

<script>
import Vue from 'vue'
import store from '@/store'

import * as api from '@/utils/api'
import { mapGetters, mapState, mapMutations } from 'vuex'

import EdrmList from './EdrmList'
import EdrmGrid from './EdrmGrid'

import { Message } from 'element-ui';

// import PagerToolbar from './PagerToolbar'
import { Upload, UploadInstaller } from '@progress/kendo-upload-vue-wrapper'

import ErrorMessageBox from '@/components/prompts/ErrorMessageBox'

Vue.use(UploadInstaller)
export default {
    name: 'edrm-list2',
    components: {
        'list' : EdrmList,
        'grid' : EdrmGrid,
    },
    data () {
        return {
            oldView : null,
            properties : {
                requestData : {
                    url : null,
                    data : null
                },
                type : 'main'
            },
        }
    },
    watch: {
        'viewOption.view': function () {
            console.log('viewOption.view changed : ' + this.viewOption.view)
            console.log(this.$refs.currentComp.$el.id)
        },
        'rootId':function(){
            //$('.k-widget.k-upload.k-header.k-upload-empty').prop( "disabled",  );
            this.$refs.dragUpload.disabled=!constants.FEATURES_DRAGFILEUPLOAD(this.rootId);
        }
    },
    computed: {
        ...mapState([
            'viewOption','currentDir'
        ]),
        currentView() {
            if (this.isGrid) {
                return 'grid'
            }
            return 'list'
        },
        isGrid() {
            return this.viewOption.view === 'grid'
        },
    },
    mounted() {
        this.setChangeView();
    },
    methods:{
    ...mapMutations(['setViewOption']),
    setChangeView(){
      this.viewSelection={
        icon: "fa fa-info-circle",
        id: "detail",
        text: "buttons.detailView"
      }
      this.setViewOption('detail')
    }

    }
}
</script>
<style>
    #edrm-right-sub {
        height: 100%;
    }

.grayfont, .grayfont-10 {
    color: #888;
    font-size: 9pt;
    letter-spacing: -0.1px;
}
.class-con {
    display: inline-block;
    vertical-align: bottom;
}
.class-con span.k-icon {
    vertical-align: baseline;
}
#edrm-right-sub .box {
    box-shadow: none;
    border-bottom: 1px solid #ebebeb;
    border-radius: 0;
    padding: 2px 0px;
}
#edrm-right-sub .box:not(:last-child) {
    margin-bottom: 0;
}

.list-item-detail {
  display: flex;
  padding: 0;
  flex-wrap: wrap;
  justify-content: flex-start;
  position: relative;
}

.list-item-detail .size,
.list-item-detail .modified {
  font-size: 0.9em;
}

.media-content .content p:not(:last-child) {
  margin-bottom: 0.3em !important;
  margin-top: 0.3em !important;
}

.list-item-detail .name {
  font-weight: bold;
}

.margin-r-15 {
    margin-right: 15px;
}
.list-indicator {
    white-space: nowrap;
}
.hold-line {
    white-space: nowrap;
}

/* tags */
/* .tags:not(:last-child) {
    margin-bottom: 0.2rem;
}

.tags:last-child {
   margin-bottom: -0.5rem;
} */

.x-tags .tag {
    margin-bottom: 0;
}

.list-item-path {
    color: #888;
    font-size: 9pt;
    padding: 0px 0px 5px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.list-item-path:hover {
    text-decoration: underline;
    cursor: pointer;
}



</style>
