<template>
  <!-- <div class="el-card__body media" role="button"
  @dblclick="open"
  :data-dir="isDir"
  :aria-label="element.object_name">
    <div class="media-left">
      <i :class='$Utils.getContentTypeClass(element.r_object_type, element.dos_ext)'></i>
    </div>

    <div class="media-content">
      <p class="name">{{ element.object_name }}</p>

      <p v-if="isDir" class="size" data-order="-1">&mdash;</p>
      <p v-else class="size" :data-order="humanSize()">{{ humanSize() }}</p>

      <p class="modified">
        <time :datetime="element.r_modify_date">{{ humanTime(element.r_modify_date) }}</time>
      </p>
    </div>
  </div> -->
  <div ref="filecard" :id="'filecard-' + element.r_object_id" class="filecard"></div>
</template>

<script>
import { mapMutations, mapGetters, mapState } from 'vuex'
import * as api from '@/utils/api'
import * as actions from '@/utils/actions'

export default {
  name: 'filecard',
  data: function () {
    return {
    }
  },
  props: ['element'],
  computed: {
    // isDir() {
    //   return this.element.r_object_type === 'dm_folder'
    // },
  },
  methods: {
    humanSize: function () {
      return this.$Utils.filesize(this.element.r_content_size)
    },
    humanTime: function (t) {
      return this.$Utils.formatMoment(t)
    },
    open: function (event) {
      if(this.$store.state.info.fileClickEvent=="VIEWER"){
        let action = actions.getAction(this.$Constants.ACTIONS.VIEWER)
        action.do(this)
      }
    }
  },
  mounted() {
    var template = kendo.template($("#detail-itemTemplate").html());
    this.element.doAction = false
    var result = template(this.element); //Execute the template
    $("#filecard-"+this.element.r_object_id).html(result); //Append the result

  }
}
</script>
