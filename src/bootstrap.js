import Vue from 'vue'

import App from './App'

import router from './router'

import * as ModalDialogs from 'vue-modal-dialogs'

import * as api from '@/utils/api'
import * as ruleapi from '@/utils/RulesApi'

import { Loading } from 'element-ui';
import lodash from 'lodash'

import 'babel-polyfill'


// "/" url 버그 수정
router.beforeEach((to, from, next) => {
  let path = '/';
  /[/]{2,}/g.test(to.fullPath) ? path = to.fullPath.replace(/[/]{2,}/g, '/') : path = to;
  next({ path: path });

  
  if (decodeURIComponent(from.fullPath.replace(/[/]{2,}/g, '/')) == decodeURIComponent(to.fullPath.replace(/[/]{2,}/g, '/'))) {
    // let url = `${window.store.state.baseURL}/json/getFileFolderList?type=${window.store.state.currentDir}&moreData=true&ver4=true`;
    window.store.commit('setRootId', window.store.state.currentDir);
    Event.fire(EventList.RELOAD_DIR);
  }
});


Vue.prototype.$lodash = lodash

// Install vue-modal-dialogs
Vue.use(ModalDialogs)

Vue.config.productionTip = true


Vue.prototype.$showSuccess = function (title = null, message = null) {
  if (!message)
    message = i18n.t('messages.completed')
  if (!title)
    title = i18n.t('label.success')
  this.$notify({
    title: title,
    message: message, type: 'success'
  })
  // this.$message({
  //   message:message,
  //   type:'success'
  // })
}

Vue.prototype.$showError = function (error, title = null) {
  if (error.errcode) {
    error = `${error.errmsg} (${error.errcode})`
  } else {
    console.log(error)
  }

  if (!title)
    title = i18n.t('label.error')

  this.$notify.error({
    title: title,
    message: error
  })

}

let loadingInstance = null
let shouleBeLoading = true

let debouncedLoading = lodash.debounce( function (fullscreen = true) {
  if (shouleBeLoading){
    loadingInstance = Loading.service({ fullscreen: fullscreen });
  }
  shouleBeLoading = false
}, 1000)

Vue.prototype.$openLoading = function(fullscreen = true) {
  shouleBeLoading = true
  debouncedLoading(fullscreen)
}

Vue.prototype.$closeLoading = function () {
  if (loadingInstance) {
    loadingInstance.close();
  }
  shouleBeLoading = false
}

Array.prototype.inArray = function(comparer) {
  for(var i=0; i < this.length; i++) {
      if(comparer(this[i])) return true;
  }
  return false;
};

// adds an element to the array if it does not already exist using a comparer
// function
Array.prototype.pushIfNotExist = function(element, comparer = undefined) {
  if (!comparer){
    comparer = function(e) {
      return e === element
    }
  }
  if (!this.inArray(comparer)) {
      this.push(element);
  }
};

Array.prototype.remove = function() {
  var what, a = arguments, L = a.length, ax;
  while (L && this.length) {
      what = a[--L];
      while ((ax = this.indexOf(what)) !== -1) {
          this.splice(ax, 1);
      }
  }
  return this;
};

Vue.prototype.$Utils = Utils

/* eslint-disable no-new */
const app = new Vue({
  el: '#app',
  store,
  router,
  i18n,
  template: '<App/>',
  components: { App }
})

// test !!!! 나중에 지울것
window['vue'] = app
window['api'] = api
window['ruleapi'] = ruleapi
window['router'] = router


// dropdown close function
$(document).on('click', (e) => {
  // 상단 다이얼로그가 띄워져 있는가.
  if ($(e.target).closest('.el-dialog').length > 0)
    return

    let closest = $(e.target).closest('.dropdown')

    if (!closest.hasClass('is-active'))
      $('.js-dropdown').closest('.dropdown').removeClass('is-active')
})

document.addEventListener('contextmenu', event => event.preventDefault());
