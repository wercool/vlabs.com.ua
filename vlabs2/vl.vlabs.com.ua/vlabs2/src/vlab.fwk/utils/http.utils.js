import AES from 'crypto-js/aes';
import encUtf8 from 'crypto-js/enc-utf8';

export function getJSONFromURL(url, passphrase) {
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.onload = function() {
            if (passphrase && passphrase.length > 0) {
                var bytes = AES.decrypt(xhr.responseText, passphrase);
                var decryptedResponseBody = bytes.toString(encUtf8);
                resolve(JSON.parse(decryptedResponseBody));
            } else {
                resolve(JSON.parse(xhr.responseText));
            }
        }
        xhr.onerror = function() {
            if (xhr.status == 404) {
                reject('JSON file not found: ' + url);
            } else {
                reject('JSON request failed');
            }
        }
        xhr.open('GET', url);
        xhr.send(null);
    });
}

export function getAllUrlParams(url) {
    // get query string from url (optional) or window
    var queryString = url ? url.split('?')[1] : window.location.search.slice(1);
    // we'll store the parameters here
    var obj = {};
    // if query string exists
    if (queryString) {
        // stuff after # is not part of query string, so get rid of it
        queryString = queryString.split('#')[0];
        // split our query string into its component parts
        var arr = queryString.split('&');
        for (var i = 0; i < arr.length; i++) {
            // separate the keys and the values
            var a = arr[i].split('=');

            // in case params look like: list[]=thing1&list[]=thing2
            var paramNum = undefined;
            var paramName = a[0].replace(/\[\d*\]/, function(v) {
                paramNum = v.slice(1,-1);
                return '';
            });

            // set parameter value (use 'true' if empty)
            var paramValue = typeof(a[1]) === 'undefined' ? true : a[1];

            // (optional) keep case consistent
            // paramName = paramName.toLowerCase();
            // paramValue = paramValue.toLowerCase();

            // if parameter name already exists
            if (obj[paramName]) {
                // convert value to array (if still string)
                if (typeof obj[paramName] === 'string') {
                    obj[paramName] = [obj[paramName]];
                }
                // if no array index number specified...
                if (typeof paramNum === 'undefined') {
                    // put the value on the end of the array
                    obj[paramName].push(paramValue);
                }
                // if array index number specified...
                else {
                    // put the value at that index number
                    obj[paramName][paramNum] = paramValue;
                }
            } else {
                // if param name doesn't exist yet, set it
                obj[paramName] = paramValue;
            }
        }
    }
    return obj;
}