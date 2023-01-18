function setCookie(cName, cValue, path) {
    if (path === '') path = '/'
    let expire = new Date();
    expire.setDate(expire.getDate() + 10000);
    let cookies = cName + '=' + escape(cValue) + '; path=' + path + '; expires=' + expire.toGMTString() + ';';
    document.cookie = cookies;
}

function deleteCookie(cookieName, path) {
    let expireDate = new Date();
    if (path === "") path = "/";

    expireDate.setDate(expireDate.getDate() - 1);
    document.cookie =
        cookieName +
        "= " +
        "; expires=" +
        expireDate.toGMTString() +
        "; path=" +
        path;
}