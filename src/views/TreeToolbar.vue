<template>
  <nav class="level edrm-toolbar">
    <div class="level-left">
      <div class="level-item">
          <button class="button" @click='reload'>
            <span class="icon is-medium">
                <i class="fa fa-refresh"></i>
            </span>
          </button>
          <button class="button" v-bind:disabled="!$store.state.isMovableToParent" @click='gotoParentFolder'>
              <span class="icon is-medium">
              <i class="fa fa-arrow-up" ></i>
            </span>
          </button>
      </div>
    </div>

    <!-- <div class="level-item">
        <el-breadcrumb class="edrm-breadcrumbs input" separator="/">
          <el-breadcrumb-item v-for="link in breadcrumbs" :key="link.name" :to="{ path: link.url }">{{ link.name }}</el-breadcrumb-item>
        </el-breadcrumb> -->

        <!-- <a class="input edrm-breadcrumbs">
        <div id="breadcrumbs" class="tags has-addons">
          <span class="tag icon is-white "><i class="fa fa-home"></i></span>
          <span class="tag is-white">&sol;</span>
          <div v-for="link in breadcrumbs" :key="link.name">
            <span class="tag is-light"><router-link :to="link.url">{{ link.name }}</router-link></span>
            <span class="tag is-white">&sol;</span>
          </div>
        </div>
        </a> -->
    <!-- </div> -->
    <div class="level-right">
        <div class="level-item">
            <!-- <search></search> -->
            <div class="view-menu dropdown is-right">
              <div class="dropdown-trigger">
                <button class="button js-dropdown" aria-haspopup="true" aria-controls="dropdown-menu4" @click='toggleViewMenu("view-menu")'>
                  <span :class="['k-icon', viewIconString]"></span>
                </button>
              </div>
              <div class="dropdown-menu" id="dropdown-menu3" role="menu">
                <div class="dropdown-content">
                  <a v-for="view in viewList" href="#" :key="view.id" class="dropdown-item" @click='changeView(view.id)'>
                      <span :class="['k-icon', view.icon]"></span> {{ $t( view.text ) }}
                  </a>
                </div>
              </div>
              <div class="view-menu dropdown is-right">
              <div class="dropdown-trigger">
                <button class="button js-dropdown" aria-haspopup="true" aria-controls="dropdown-menu4" @click='toggleViewMenu("view-menu")'>
                  <span :class="['k-icon', viewIconString]"></span>
                </button>
              </div>
              <div class="dropdown-menu" id="dropdown-menu4" role="menu">
                <div class="dropdown-content">
                  <a v-for="view in viewList" href="#" :key="view.id" class="dropdown-item" @click='changeView(view.id)'>
                      <span :class="['k-icon', view.icon]"></span> {{ $t( view.text ) }}
                  </a>
                </div>
              </div>
          </div>
        </div>
    </div>
  </nav>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
// import Search from './Search'

export default {
  name: 'toolbar',
  data: function() {
    return {
      viewList: [
        {id: 'grid', text: 'buttons.gridView', icon: 'k-i-grid-layout'},
        {id: 'detail', text: 'buttons.detailView', icon: 'k-i-group'},
        {id: 'list1', text: 'buttons.list1View', icon: 'k-i-grid'},
        {id: 'list2', text: 'buttons.list2View', icon: 'k-i-group'},
      ],
    }
  },
  components : {
    // Search
  },
  computed: {
    ...mapState([/* 'currentDirInfo',  */'viewOption']),
    viewIconString() {
      var obj = this.viewList.find((obj) => { return obj.id === this.viewOption.view; });
      return obj.icon
    },
    // breadcrumbs() {
    //     let breadcrumbs = []

    //     if (!this.currentDirInfo)
    //         return breadcrumbs

    //     let namePath = this.currentDirInfo.r_folder_path;
    //     let idPath = this.currentDirInfo.idPath;
    //     let parts = namePath.split('/')
    //     let idParts = idPath.split('/')
    //     parts = Utils.cleanArray(parts)
    //     idParts = Utils.cleanArray(idParts)

    //     for (let i = 0; i < parts.length; i++) {
    //         if (i === 0) {
    //             breadcrumbs.push({ name: decodeURIComponent(parts[i]), url: '/' + idParts[i] + '/' })
    //         } else {
    //             breadcrumbs.push({ name: decodeURIComponent(parts[i]), url: breadcrumbs[i - 1].url + idParts[i] + '/' })
    //         }
    //     }

    //     if (breadcrumbs.length > 5) {
    //         while (breadcrumbs.length !== 6) {
    //             breadcrumbs.shift()
    //         }

    //         breadcrumbs[0].name = '...'
    //     }

    //     return breadcrumbs
    // }
  },
  methods: {
    ...mapMutations(['setViewOption']),
    toggleViewMenu(menu) {
      let dropdown = document.querySelector('.'+menu);
      event.stopPropagation();
      dropdown.classList.toggle('is-active');
    },
    changeView(option) {
      this.toggleViewMenu('view-menu')
      this.setViewOption(option)
    },
    reload() {
      store.dispatch('reloadSelectedFolder')
    },
    gotoParentFolder() {
      Event.fire(EventList.GOTO_PARENT)
    }
  }
}
</script>
<style>
  .level:not(:last-child) {
    margin-bottom: 0px;
  }

  .edrm-toolbar {
    padding-left : 5px;
    padding-right : 5px;
    padding-bottom: 3px;
    padding-top: 3px;
  }
  .el-breadcrumb__item {
    white-space: nowrap;
    overflow: hidden;
  }
</style>
