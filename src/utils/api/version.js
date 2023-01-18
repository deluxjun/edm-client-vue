import {get} from './request'

export function checkout(object_id){
    return get(`${store.state.baseURL}/json/checkout?docId=${object_id}`);
}
  
export function getDocHistory(object_id){
    return get(`${store.state.baseURL}/json/getHistory?docId=${object_id}&skip=0&page=1&pageSize=30`);
}
  
export function getDocVersion(object_id){
    return get(`${store.state.baseURL}/json/getVersion?docId=${object_id}`);
}
  
export function revertDocs(object_id){
    return get(`${store.state.baseURL}/json/restoreVersion?versionId=${object_id}`);
}