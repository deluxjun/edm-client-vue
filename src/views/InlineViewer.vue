<template>
<el-container v-if="!isLoading" style="height:100%;" id="viewer" >
    <el-header id="viewerHeader">
        <div class="navbar-start breadCrumb">
                <div class="level-item">
                    <el-breadcrumb  id="viewerBread" class="edrm-breadcrumbs input" separator-class="el-icon-arrow-right">
                        <el-breadcrumb-item v-for="link in breadcrumbs" :key="link.key" :to="{ path: link.url }">
                            {{ $Utils.truncate(link.name, 30) }}
                        </el-breadcrumb-item>
                    </el-breadcrumb>
                </div>
        </div>
        <!-- <nav class='navbar is-transparent'>
            <div class="navbar-menu">

            </div>
        </nav> -->
    </el-header>
    <el-container class="viewerMainContainer" >
      <el-main id="test2" style="overflow:hidden;"  v-loading="!documentLoaded">
          <iframe v-if="permissions.view" id="docViewerFrame" :src="url" @load="viewerLoaded"></iframe>
      </el-main>
      <!-- comments / details -->
      <el-aside class="viewer-details" :width="'400px'">
        <div class="navbar-end">
                    <div class="navbar-item">
                        <el-button type="primary" icon="el-icon-zoom-in" round @click='fullscreen'>{{ $t('buttons.fullscreen') }}</el-button>
                    </div>
                    <div class="navbar-item">
                        <el-button :disabled='!permissions.download' type="info" icon="el-icon-download" round @click='onDownload'>{{ $t('buttons.download') }}</el-button>
                    </div>
        </div>
        <el-tabs v-model="activeName">
          <el-tab-pane :label="$t('label.comments')" name="activity">
              <comments :elementId="elementId" :permissions="permissions"></comments>
          </el-tab-pane>
          <el-tab-pane :label="$t('label.details')" name="detail">
            <div v-if="showBasicProperty">
                <basic-property :model="element" :permissions="permissions" :labelPosition="'top'"></basic-property>
            </div>
            <div v-if="!showBasicProperty" class='setProperty'>
                <property :elementIds="[elementId]"></property>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-aside>
    </el-container>

</el-container>

</template>

<script>
import Vue from 'vue'
import url from '@/utils/url'
import * as api from '@/utils/api'
import { mapState } from 'vuex'
import Utils from '@/utils/utils'
import BasicProperty from '@/views/BasicProperty'
import Property from '@/views/Property'
import Comments from '@/views/Comments'


export default {
    name: 'inline-viewer',
    props: {
        argElementId : {
            default: null,
            type: String
        },
    },
    components: {
        'basic-property' : BasicProperty,
        'property' : Property,
        Comments
    },
    computed : {
        ...mapState(['info', 'user']),
        showBasicProperty(){
            return Utils.featuresDefault('property',false)
        }
    },
    data: function () {
        return {
            isLoading: true,
            activeName: 'detail',
            breadcrumbs: [],
            elementId:"",
            url:"",
            element: null,
            permissions: {},
            documentLoaded:false,
            userId:"",
        }
    },
    methods: {
        onClose(e) {
            if (this.dynamic)
                this.$close(null)
            else
                this.$store.commit('closeHovers')
        },
        onDownload() {
            let url=`${store.state.baseURL}/json/download?from=${store.state.rootId}&elementId=${this.elementId}`
            Utils.fileDownload(url)
        },
      getFileInfo:function(object_id){
            api.getDocInfo(object_id, true).then(data=>{
                if(data.list.length==0) return;
                this.element = data.list[0]

                // set permissions
                this.permissions.read = this.element.permissions.includes('READ')
                this.permissions.view = this.element.permissions.includes('VIEW')
                this.permissions.edit = this.element.permissions.includes('RENAME')
                this.permissions.delete = this.element.permissions.includes('DELETE')
                this.permissions.add = this.element.permissions.includes('ADD')
                this.permissions.download = this.element.permissions.includes('DOWNLOAD')
                this.permissions.owner = this.element.owner_id === this.user.userId

                this.breadcrumbs = this.$Utils.getBreadcrumbs(this.element.r_folder_path, false)

                this.isLoading = false

            }).catch(error=>{
                Utils.showResultMessage(false,"Fail to load doc info",this);
            });

      },
      viewerLoaded:function(){
          /*$('#docViewerFrame').contents().find('#header').remove();
          $('#docViewerFrame').contents().find('#headerWrap').remove();
          $('#docViewerFrame').contents().find('#container').css('height','100%')*/
          $('#docViewerFrame').contents().find('#fullScreenBtn').remove();
          this.documentLoaded=true;
      },
      fullscreen:function(){
            var i = document.getElementById("docViewerFrame");
            if (i.requestFullscreen) {
                i.requestFullscreen();
            } else if (i.webkitRequestFullscreen) {
                i.webkitRequestFullscreen();
            } else if (i.mozRequestFullScreen) {
                i.mozRequestFullScreen();
            } else if (i.msRequestFullscreen) {
                i.msRequestFullscreen();
            }
      }

  },
  created(){
      if (!this.argElementId) {
        if (this.$route.query.elementId)
          this.elementId = this.$route.query.elementId
      }
      else
        this.elementId = this.argElementId

        this.userId=store.state.user.userId;
        this.getFileInfo(this.elementId);
        api.getDocConvertedUrl(this.elementId).then(data=>{
            this.url=api.getFullUrl(data.url);
            console.log(this.url)
        }).catch(err=>{
            this.url=api.getFullUrl('/viewer/error.html');
        })
    }
}
</script>
<style>
#viewerHeader {
    text-align: right;
    height: 40px !important;
    padding: 0px !important;
}
#docViewerFrame {
    height: 100%;
    width:100%;
    overflow: scroll;
}
.edrm-breadcrumbs {
    /* width: calc(100% - 4px); */
    width: -o-calc(100% - 4px); /* opera */
    width: -webkit-calc(100% - 4px); /* google, safari */
    width: -moz-calc(100% - 4px); /* firefox */

    justify-content: left;
}

@media screen and (max-width: 1024px) {
    .viewer-details {
        display: none !important;
    }
}
.setProperty .property{
    overflow-y:initial !important;
    overflow-x:initial !important;
    padding: 0px !important;
}
.setProperty .el-input-group{
    display: inline !important;
}
.viewer-details {
    padding: 0px 10px;
}
.viewerMainContainer{
    height: calc(100% - 60px);
}
.breadCrumb{
    width: 100%;
    background-color: #ebf1f5;
}
#viewerBread .el-breadcrumb__separator, #viewerBread .el-breadcrumb__item:last-child .el-breadcrumb__inner, 
#viewerBread .el-breadcrumb__item:last-child .el-breadcrumb__inner a, #viewerBread .el-breadcrumb__item:last-child .el-breadcrumb__inner a:hover, 
#viewerBread .el-breadcrumb__item:last-child .el-breadcrumb__inner:hover, #viewerBread .el-breadcrumb__inner.is-link {
    /*color: #fff !important;*/
    font-size: 12pt;
    white-space: nowrap;
    font-family: "Verdana",sans-serif;
    letter-spacing: -1px;
    font-weight: inherit;
    padding: 0 !important;
}



</style>