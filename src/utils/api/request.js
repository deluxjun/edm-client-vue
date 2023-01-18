import store from '@/store'
import axios from 'axios';
import router from '@/router'

export function get(url, params = '') {
    return new Promise((resolve, reject) => {
      ax().get(url, { params : params})
      .then(response => {
        if(response.data.errcode!="0"){
          // -100 is expired session
          if (response.data.errcode == -100){
            router.push({ path: '/login', query: { redirect: route.path } })
            return
          }
          reject(response.data)
          return
        }
        resolve(response.data)
      })
      .catch(error => {
        console.log(error)
        if (error.response.data)
          reject(error.response.data)
      })
    })
}

export function post (url, content = '', overwrite = false, onupload) {
    //url = removePrefix(url)
  
    return new Promise((resolve, reject) => {
      let request = new window.XMLHttpRequest()
      request.open('POST', `${url}`, true)
      request.setRequestHeader('Authorization', `Bearer ${cookies.get('auth')}`)
      request.setRequestHeader('Content-Type','application/json')
      if (typeof onupload === 'function') {
        request.upload.onprogress = onupload
      }
  
      if (overwrite) {
        request.setRequestHeader('Action', `override`)
      }
  
      request.onload = () => {
        if (request.status === 200) {
          resolve(request.responseText)
        } else if (request.status === 409) {
          reject(request.status)
        } else {
          reject(request.responseText)
        }
      }
  
      request.onerror = (error) => {
        reject(error)
      }
      request.send(content)
    })
}

export function post2 (url, content = '') {
    return new Promise((resolve, reject) => {
      ax('application/json').post(url, content)
      .then(response => {
        if(response.data.errcode!="0"){
          // -100 is expired session
          if (response.data.errcode == -100){
            router.push({ path: '/login', query: { redirect: route.path } })
            return
          }
          reject(response.data)
          return
        }
        resolve(response.data)
      })
      .catch(error => {
        console.log(error)
        if (error.response.data)
          reject(error.response.data)
      })
    })
}

export function put (url, content = '', publish = false, date = '') {
    url = removePrefix(url)
  
    return new Promise((resolve, reject) => {
      let request = new window.XMLHttpRequest()
      request.open('PUT', `${store.state.baseURL}/api/resource${url}`, true)
      request.setRequestHeader('Authorization', `Bearer ${store.state.jwt}`)
      request.setRequestHeader('Publish', publish)
  
      if (date !== '') {
        request.setRequestHeader('Schedule', date)
      }
  
      request.onload = () => {
        if (request.status === 200) {
          resolve(request.responseText)
        } else {
          reject(request.responseText)
        }
      }
  
      request.onerror = (error) => reject(error)
      request.send(content)
    })
}


export function ax (contentType = null) {
    let headers = {'Authorization': `Bearer ${cookies.get('auth')}`}
    if (contentType)
      headers['Content-Type'] = contentType
  
    return axios.create({
      baseURL: 'http://localhost:7080/xedrm',
      headers: headers
    });
}
