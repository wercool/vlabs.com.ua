import AES from 'crypto-js/aes';
import encUtf8 from 'crypto-js/enc-utf8';

export function getJSONFromURL(url, passphrase) {
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.onload = function() {
            if (passphrase.length > 0) {
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