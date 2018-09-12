export function getRandomString(length) {

    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var rndStr = "";
    for (var i = 0; i < length; i++)
        rndStr += possible.charAt(Math.floor(Math.random() * possible.length));

    return rndStr;
}