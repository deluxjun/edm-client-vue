import * as api from '@/utils/api'
import * as ruleapi from '@/utils/RulesApi'
import * as url from '@/utils/url'
// import initdata from './initdata'
import axios from 'axios';

import i18n from '@/i18n'
import Utils from '../utils/utils';

var i18 = i18n
const actions = {
  // browser init!!
  // browserInit({ commit, state }) {
  //   return new Promise((resolve, reject) => {

  //     let infodata = {info:{},permissionList:null}
  //     axios.get(state.baseURL + '/json/info')
  //       .then((response) => {
  //         for (let field in response.data) {
  //           infodata.info[field] = response.data[field];
  //           console.log(field + '=' + infodata.info[field]);
  //         }
  //       })
  //       .catch((error => {
  //           console.log(error);
  //       }));
  //     // infodata.info.grid_columns = initdata.info.grid_columns

  //     // // change language
  //     // let data = infodata.info.grid_columns.map((obj) => {
  //     //   obj.title = i18.t(obj.title)
  //     //   return obj
  //     // })
  //     // })
  //     // })
  //     // infodata.info.grid_columns = data
  //     commit("FETCH_INFO", infodata);
  //     resolve();

  //   });
  // },
  // async browserInit({commit}) {
  //   const { data } = await axios.get(`malScraper.json?year=2016&season=fall`)
  //   commit('setSeasons', data )
  // }
  async browserInit({ commit, state }) {
    console.log("INIT")
    let infodata = { info: {}, permissionList: null }
    let response = await axios.get(state.baseURL + '/json/info')
    for (let field in response.data) {
      infodata.info[field] = response.data[field];
      //console.log(field + '=' + infodata.info[field]);
    }
    Utils.setCookie('hqServer', infodata.info.features['hqServer.ip'], '/')
    commit("FETCH_INFO", infodata);
  },

  reloadSelectedFolder({ commit }) {
    commit('setReload', true)
  },

  resetState({ commit }) {
    commit('setCurrentDir', null)
    commit('setCurrentDirInfo', null)
    commit('setCurrentPath', '')
    commit('clearSelected')
    commit('setRootId', null)
    commit('setIsCarryout', false)
    commit('setCarryoutList', [])

  },

  async loadDocTypes({ commit, state }) {
    let docTypes = state.docTypes
    try {
      if (!docTypes || docTypes.length < 1) {
        let data = await api.getDocTypes()
        docTypes = data.list
        commit('setDocTypes', docTypes)
      }
    } catch (error) {
      console.log(error)
    }
    return docTypes
  },

  // rules
  async loadRuleInfo({ dispatch, commit, state }) {
    await Promise.all([
      dispatch('loadRuleConditions'),
      dispatch('loadRuleConstraints'),
      dispatch('loadRuleTypes'),
      dispatch('loadRuleActions')
    ])
  },

  async loadRuleActions({ commit, state }) {
    let ruleActions = state.ruleActions
    try {
      if (!ruleActions || ruleActions.length < 1) {
        let data = await ruleapi.getActions()
        ruleActions = data.actions
        commit('setRuleActions', ruleActions)
      }
    } catch (error) {
      console.log(error)
    }
    return ruleActions
  },
  async loadRuleConstraints({ commit, state }) {
    let data = state.ruleConstraints
    try {
      if (!data || data.length < 1) {
        let ldata = await ruleapi.getConstraints()
        data = ldata.actionConstraints
        commit('setRuleConstraints', data)
      }
    } catch (error) {
      console.log(error)
    }
  },
  async loadRuleConditions({ commit, state }) {
    let data = state.ruleConditions
    try {
      if (!data || data.length < 1) {
        let ldata = await ruleapi.getActionConditions()
        data = ldata.actionConditionDefinitions
        commit('setRuleConditions', data)
      }
    } catch (error) {
      console.log(error)
    }
  },
  async loadRuleTypes({ commit, state }) {
    let data = state.ruleTypes
    try {
      if (!data || data.length < 1) {
        data = await ruleapi.getRuleTypes()
        commit('setRuleTypes', data)
      }
    } catch (error) {
      console.log(error)
    }
  },
  async loadDraftCommands({ commit, state }) {
    let data = state.draftCommands
    try {
      if (!data || data.length < 1) {
        data = await api.getDraftCommands()
        commit('setDraftCommands', data)
      }
    } catch (error) {
      console.log(error)
    }
  },
  async getPreDefinedPermissions({ commit, state }) {
    let data = state.preDefinedPermissions
    try {
      if (!data || data.length < 1) {
        data = await api.getPermissionGroups()
        commit('setPreDefinedPermissions', data)
      }
    } catch (error) {
      console.error(error)
    }
    return data
  },
  async getSecurityProfiles({ commit, state }) {
    let data = state.securityProfiles
    try {
      if (!data || data.length < 1) {
        let all = await api.getSecurityProfiles()
        data = all.list
        commit('setSecurityProfiles', data)
      }
    } catch (error) {
      console.error(error)
    }
    return data
  },
}

export default actions
