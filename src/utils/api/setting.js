
export function getSettings () {
    return new Promise((resolve, reject) => {
      let request = new window.XMLHttpRequest()
      request.open('GET', `${store.state.baseURL}/api/settings/`, true)
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
  
  export function updateSettings (param, which) {
    return new Promise((resolve, reject) => {
      let data = {
        what: 'settings',
        which: which,
        data: {}
      }
  
      data.data[which] = param
  
      let request = new window.XMLHttpRequest()
      request.open('PUT', `${store.state.baseURL}/api/settings/`, true)
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
      request.onerror = (error) => { reject(error) }
      request.send(JSON.stringify(data))
    })
  }
  
  