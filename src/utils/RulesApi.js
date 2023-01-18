import store from '@/store'
import axios from 'axios';
import router from '@/router'
import * as api from './api'

export const RULES_URLS = {
}

// export function updateExtAttrs(elementId, attrList) {
//   let data = {
//     attrData : {
//       docId : elementId,
//       attrList: attrList
//     }
//   }
//   return post2('/json/updateDocEx', JSON.stringify(data))
// }

// export function analyzeFolder(elementId){
//   return get(`/service/analyze?folderId=${elementId}`)
// }

export function toggleInheritance(eid) {
  return api.get(`/json/rule/toggleInherited?id=${eid}`)
}

export function getRuleSet(eid) {
  return api.get(`/json/rule/getRuleSet?id=${eid}`)
}

export function getNotificationRuleSet(eid) {
  return api.get(`/json/rule/notification/getRuleSet?id=${eid}`)
}

export function getActions(eid) {
  return api.get(`/json/rule/getActions`)
}

export function getConstraints(eid) {
  return api.get(`/json/rule/getConstraints`)
}

export function getActionConditions(eid) {
  return api.get(`/json/rule/getActionConditions`)
}

export function getRuleTypes(eid) {
  return api.get(`/json/rule/getRuleType`)
}

export function saveRule(folderId, ruleId, data) {
  data.nodeRefId = folderId
  if (ruleId)
    data.ruleRefId = ruleId
  return api.post2('/json/rule/saveRule', JSON.stringify(data))
}

export function removeRule(folderId, ruleId) {
  return api.get(`/json/rule/removeRule?id=${folderId}&ruleId=${ruleId}`)
}

export function unlinkRule(folderId) {
  return api.get(`/json/rule/unlinkRule?id=${folderId}`)
}

export function linkRule(folderId, to) {
  return api.get(`/json/rule/linkRule?id=${folderId}&to=${to}`)
}

export function executeRule(folderId) {
  return api.get(`/json/rule/execute?folderId=${folderId}`)
}
