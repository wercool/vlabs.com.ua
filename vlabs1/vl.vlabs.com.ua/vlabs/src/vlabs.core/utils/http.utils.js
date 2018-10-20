var CryptoJS = require("crypto-js");

export function getJSONFromURL(url, passphrase) {
    return fetch(url).then(response => {
        if (response.ok) {
            const contentType = response.headers.get('Content-Type') || '';

            if (contentType.includes('application/json')) {
                if (passphrase) {
                    return new Promise((resolve) => {
                        resolve(
                            response.text().then(encryptedResponseBody => {
                                var bytes = CryptoJS.AES.decrypt(encryptedResponseBody.toString(), passphrase);
                                var decryptedResponseBody = bytes.toString(CryptoJS.enc.Utf8);
                                return JSON.parse(decryptedResponseBody);
                            })
                        );
                    });
                } else {
                    return response.json().catch(error => {
                        return Promise.reject('Invalid JSON: ' + error.message);
                    });
                }
            }

            return Promise.reject('Invalid content type: ' + contentType);
        }

        if (response.status == 404) {
            return Promise.reject('JSON file not found: ' + url);
        }

        return Promise.reject('HTTP error: ' + response.status);
    }).catch(error => {
        return Promise.reject(error);
    });
}