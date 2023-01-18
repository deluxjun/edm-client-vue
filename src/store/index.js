import Vue from 'vue'
import Vuex from 'vuex'
import mutations from './mutations'
import actions from './actions'
import getters from './getters'

Vue.use(Vuex)

// TODO: get info from server. baseURL etc

const state = {
    isHq: false,
    passwordExpired: false,
    info: {
        features: undefined
    },
    user: {
        locale: 'ko',
        isFirstLogin: true
    },
    clipboard: {
        key: '',
        items: []
    },
    css: (() => {
        let css = window.CSS
        window.CSS = null
        return css
    })(),
    staticGen: document.querySelector('meta[name="staticgen"]').getAttribute('content'),
    // api base
    baseURL: (process.env.NODE_ENV !== 'production') ? '' : document.querySelector('meta[name="base"]').getAttribute('content'),
    // web contents base
    webBaseURL: (process.env.NODE_ENV !== 'production') ? '' : document.querySelector('meta[name="webbase"]').getAttribute('content'),
    version: document.querySelector('meta[name="version"]').getAttribute('content'),
    sharedId: '',
    sharedContent: {},
    departId: '',
    ticket: '',
    progress: 0,
    schedule: '',
    loading: false,
    reload: false,
    reloadList: false,
    currentDir: null,
    currentDirName: null,
    currentDirInfo: null,
    rootId: null,
    rootMap: new Map(),
    viewOption: {
        view: 'grid',
        orderBy: 'name',
        dir: 'asc',
        pageSize: 30,
        columns: {},
    },
    shortcuts: [], // 20180705, shortcuts
    selected: [],
    multiple: false,
    show: null,
    showMessage: null,
    showConfirm: null,
    currentTask: {
        operation: 0,
        fileList: []
    },
    isMovableToParent: false,
    docTypes: null,

    // rules
    ruleTypes: [],
    ruleActions: [],
    ruleConditions: [],
    ruleConstraints: [],

    // draft
    draftCommands: [],
    // predefined permissions
    preDefinedPermissions: [],

    // security profiles
    securityProfiles: [],

    securityPolicyList: null,

    lastSearchOption: {},

    //login
    mgLogin: false,
    LGUplus: '',
    LGUplusUSERID: '',

    canCopy: true,
    copySelectedList: null,
    moveSelectedList: null,
    moveTreeList: null,
    moveTableList: null,
    moveTableEnabled: false,

    copyList: null,
    moveList: null,
    selectStatusMessage: null,
    newUserName: '',
    isDragged: false,
    isCarryout: false,
    carryoutList: [],
    currentPath: '',
}

const store = new Vuex.Store({
    strict: process.env.NODE_ENV !== 'production',
    state,
    getters,
    mutations,
    actions
});

(async () => {
    await store.dispatch('browserInit')
    //console.log("Browser has been initialized")
    await
        import('../bootstrap')
})();

// store.dispatch('browserInit').then(() => {
//   console.log("Browser has been initialized")
//   import('../bootstrap')
// });

export default store;