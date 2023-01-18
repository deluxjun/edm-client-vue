export function getContextPath() {
  var hostIndex = location.href.indexOf( location.host ) + location.host.length;
  return location.href.substring( hostIndex, location.href.indexOf('/', hostIndex + 1) );
}

export function removeLastDir (url) {
  var arr = url.split('/')
  if (arr.pop() === '') {
    arr.pop()
  }

  return arr.join('/')
}

export default {
  removeLastDir
}