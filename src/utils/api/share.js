import {get,post} from './request'

export function createURLShare (object_id,version) {
    return post(`${store.state.baseURL}/service/share/create?elementId=${object_id}&version=${version}&url=true`,'{"privs":null}')
}
  
export function createURLShareWithExpired (object_id,version,expired,count) {
    return post(`${store.state.baseURL}/service/share/create?elementId=${object_id}&expired=${expired}&count=${count}&version=${object_id}&url=true`,'{"privs":null}')
}
  
export function deleteURLShare(object_id){
    return get(`${store.state.baseURL}/service/share/delete?elementId=${object_id}&url=true`)
}
export function getURLShareInfo(object_id){
    return get(`${store.state.baseURL}/service/share/get?elementId=${object_id}&url=true`)
}