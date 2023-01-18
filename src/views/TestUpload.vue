<template>
  <div>
    <Upload name="files" id="files" :async-save-url="url"
                  :async-remove-url="url"
                  :async-auto-upload="true"
                  :async-with-credentials="false"
                  :showFileList="true"
                  dropZone=".dropZoneElement"
    ><!-- cancel 하고 remove 시 똑같은 함수 실행-->
    </Upload>
    <div class="demo-section k-content wide">
        <div class="wrapper">
            <div id="products"></div>
            <div class="dropZoneElement">
                <div class="textWrapper">
                <p><span>+</span>Add Image</p>
                <p class="dropImageHereText">Drop image here to upload</p>
                <i class="fa fa-bandcamp" aria-hidden="true">awefawefeawf</i>
            </div>
            </div>
         </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";

import * as api from "@/utils/api";
import { mapState, mapMutations } from "vuex";
import { Upload, UploadInstaller } from '@progress/kendo-upload-vue-wrapper'
Vue.use(UploadInstaller)

export default {
  name: "grid-view",
  components: {
    Upload
  },
  computed: {
    ...mapState(['loading']),
  },
  data: function() {
    return {
      grid: null,
      gridInitialized: false,
      url:"/upload"
    };
  },
  created() {},
  mounted() {
  },
  beforeDestroy() {},
  methods: {
    
  }
};
</script>
<style>
div.k-dropzone {
    border: 1px solid red;
}

.customDropZone.k-dropzone-active {
    border: 1px solid yellow;
}
.customDropZone.k-dropzone-active.k-dropzone-hovered {
    border: 1px solid green;
}
</style>