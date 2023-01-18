<template>
  <div v-if="available">
    <div class="shortcut-item" v-for="item in shorts">
      <span class="shortcut-name" @click="handleClick(item)">
        <i :class="item.icon"></i>  {{ $t( item.name ) }}
      </span>
      <i class="k-icon k-i-close-circle option-right" @click="remove(item.path)"></i>
    </div>
  </div>
  <!-- <div>111111111111111111</div> -->
</template>

<script>
import {mapState, mapGetters,mapMutations} from "vuex";
import * as api from "@/utils/api";

export default {
  name: 'shortcuts',
  data: function() {
    return {
      lists: [{
          date: '2016-05-03',
        }]
    }
  },
  created() {
    Event.off(EventList.ADD_SHORTCUT);
    Event.listen(EventList.ADD_SHORTCUT,this.add);
  },
  computed: {
    ...mapGetters(["getRootByName"]),
    ...mapState([
      "shortcuts",
    ]),
    available() {
      return this.$Utils.featuresDefault('shortcut',false)
    },
    shorts() {
      let value = []
      if (!this.shortcuts || this.shortcuts.length < 1) {
        this.addShortCut(this.$t('files.Workspace'))
      }

      this.shortcuts.forEach(element => {
        let path = decodeURIComponent(element)
        let name = element.replace(/^.*[\\\/]/, '')
        if (!name)
          name = path
        name = this.$Utils.truncate(name, 20)
        let data = {icon:'fa fa-location-arrow', name:name, path:path}
        let root = path.split('/')[0]
        if (root) {
          let css = this.getRootByName(root) && this.getRootByName(root).css
          if (css)
            data.icon = css
        }
        value.push(data)
      })
      return value
    }
  },
  methods: {
    ...mapMutations(["addShortCut", "removeShortCut"]),
    handleClick(item) {
      this.$router.push({ path: "/files/" + item.path });
    },
    add(path) {
      if (!path)
        return
      if (this.shortcuts.indexOf(path) >= 0)
        return
      api.addShortCut(path).then(r => {
        if (this.shortcuts.length >= 10)
          this.removeShortCut(0)
        this.addShortCut(path)
      })
    },
    remove(path) {
      if (!path)
        return
      api.removeShortCut(path).then(r => {
        let index = this.shortcuts.indexOf(path)
        this.removeShortCut(index)
      })
    }
  }
}
</script>
<style>
.shortcut-item {
  padding: 0px 7px 5px 7px
}
.shortcut-name {
  cursor: pointer;
}
.shortcut-name>i {
  padding-right: 10px;
  width: 15px;
}
</style>

