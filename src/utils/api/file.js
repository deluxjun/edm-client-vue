import {get} from './request'

export function createFolder (id, name, descr) {
    name = encodeURIComponent(name)
    descr = encodeURIComponent(descr)
    return get(`${store.state.baseURL}/json/createFolder?folderId=${id}&folderName=${name}&description=${descr}`)
}
  
// it can delete file 
export function remove (items,callback) {
    let promises = []
    for (let item of items) {
        promises.push(new Promise((resolve, reject) => {
            get(`${store.state.baseURL}/json/deleteFolder?folderId=${item}`)
        }))
    }
    callback(Promise.all(promises));
}

export function rename(object_id,newname){
    return get(`${store.state.baseURL}/json/renameDoc?docId=${object_id}&newName=${newname}`);
}

export function moveCopy (items,target,ismove,callback) {
    let promises = []
    for (let item of items) {
        promises.push(new Promise((resolve, reject) => {
            get(`${store.state.baseURL}/json/moveAndCopyFolder?srcId=${item}&targetId=${target}&isMove=${ismove }`);
        }))
    }
    callback(Promise.all(promises))
}
  
export function addBookmark(object_id,type){
    return get(`${store.state.baseURL}/json/addBookmark?srcId=${object_id}&type=${type}`)
}

export function removeBookmark(object_id){
    return get(`${store.state.baseURL}/json/deleteBookmark?srcId=${object_id}`)
}

export function getDocInfo(object_id){
    return get(`${store.state.baseURL}/json/getDocument?elementId=${object_id}&from=${store.state.rootId}`)
}

export function fetch (url, id=null) {
    url = removePrefix(url)
  
    return new Promise((resolve, reject) => {
      get(`${store.state.baseURL}/json/getFileFolderList?folderId=${id}`)
      .then(response => {
        if(response.data.errcode!="0"){
          reject(response.data)
          return
        }
        resolve(response.data)
      })
      .catch(error => {
        console.log(error)
        reject(error.response.data)
      })
    })
}

// get context menu
export function getMenu (id) {
    // TODO: 여러건에 대한 context menu 액션을 정확히 정하지 않았음
    if (Array.isArray(id))
        id = id.join(',');
    return get(`${store.state.baseURL}/json/contextMenu?srcId=${id}`)
}