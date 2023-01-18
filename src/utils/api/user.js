import {get} from './request'

export function Login(userid,password){
  return get(`${store.state.baseURL}/json/login?userId=${userid}&password=${password}`)
}

export function Logout(){
  return get(`${store.state.baseURL}/json/logout`)
}
export function Validation(sid){
  return get(`${store.state.baseURL}/json/validation?sid=${sid}`);
}
export function getUsers () {
    return new Promise((resolve, reject) => {
      let request = new window.XMLHttpRequest()
      request.open('GET', `${store.state.baseURL}/api/users/`, true)
      request.setRequestHeader('Authorization', `Bearer ${store.state.jwt}`)
  
      request.onload = () => {
        switch (request.status) {
          case 200:
            resolve(JSON.parse(request.responseText))
            break
          default:
            reject(request.responseText)
            break
        }
      }
      request.onerror = (error) => reject(error)
      request.send()
    })
  }
  
  export function getUser (id) {
    return new Promise((resolve, reject) => {
      let request = new window.XMLHttpRequest()
      request.open('GET', `${store.state.baseURL}/api/users/${id}`, true)
      request.setRequestHeader('Authorization', `Bearer ${store.state.jwt}`)
  
      request.onload = () => {
        switch (request.status) {
          case 200:
            resolve(JSON.parse(request.responseText))
            break
          default:
            reject(request.responseText)
            break
        }
      }
      request.onerror = (error) => reject(error)
      request.send()
    })
  }
  
  export function newUser (user) {
    return new Promise((resolve, reject) => {
      let request = new window.XMLHttpRequest()
      request.open('POST', `${store.state.baseURL}/api/users/`, true)
      request.setRequestHeader('Authorization', `Bearer ${store.state.jwt}`)
  
      request.onload = () => {
        switch (request.status) {
          case 201:
            resolve(request.getResponseHeader('Location'))
            break
          default:
            reject(request.responseText)
            break
        }
      }
      request.onerror = (error) => reject(error)
      request.send(JSON.stringify({
        what: 'user',
        which: 'new',
        data: user
      }))
    })
  }
  
  export function updateUser (user, which) {
    return new Promise((resolve, reject) => {
      let request = new window.XMLHttpRequest()
      request.open('PUT', `${store.state.baseURL}/api/users/${user.ID}`, true)
      request.setRequestHeader('Authorization', `Bearer ${store.state.jwt}`)
  
      request.onload = () => {
        switch (request.status) {
          case 200:
            resolve(request.getResponseHeader('Location'))
            break
          default:
            reject(request.responseText)
            break
        }
      }
      request.onerror = (error) => reject(error)
      request.send(JSON.stringify({
        what: 'user',
        which: (typeof which === 'string') ? which : 'all',
        data: user
      }))
    })
  }
  
  export function deleteUser (id) {
    return new Promise((resolve, reject) => {
      let request = new window.XMLHttpRequest()
      request.open('DELETE', `${store.state.baseURL}/api/users/${id}`, true)
      request.setRequestHeader('Authorization', `Bearer ${store.state.jwt}`)
  
      request.onload = () => {
        switch (request.status) {
          case 200:
            resolve()
            break
          default:
            reject(request.responseText)
            break
        }
      }
      request.onerror = (error) => reject(error)
      request.send()
    })
  }
  