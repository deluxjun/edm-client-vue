import {get} from './request'

export const URLS = {
    INDEX_SEARCH : '/json/searchDoc',
    FULL_SEARCH : '/json/searchFullDoc',
}

export function searchIndex(data, page, pageSize) {
    return searchService(URLS.INDEX_SEARCH, data, page, pageSize)
}
  
export function searchFull(data, page, pageSize) {
    return searchService(URLS.FULL_SEARCH, data, page, pageSize)
}
  
  
export function searchService(url, data, page, pageSize) {
    // return get(`${store.state.baseURL}/json/searchDoc?param=${data}&page=${page}&pageSize=${pageSize}`)
    let content = new Object()
    content.param = JSON.stringify(data)
    content.page = page
    content.pageSize = pageSize
    return get(getFullUrl(url), content)
}
  