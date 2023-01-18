import {get,post} from './request'

export function getSecurityPolicy(){
    return get(`${store.state.baseURL}/json/getSecurityProfiles`)
}
export function getDocSecurityRights(object_id){
    return get(`${store.state.baseURL}/json/getRights?elementId=${object_id}`)
}
export function setDocSecurityRights(data){
    return post(`${store.state.baseURL}/json/saveRights`,data);
}