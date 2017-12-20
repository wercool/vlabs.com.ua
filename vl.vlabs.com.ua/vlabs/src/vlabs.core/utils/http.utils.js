export function getJSONFromURL(url) {
    return fetch(url).then(response => {
        if (response.ok) {
            const contentType = response.headers.get('Content-Type') || '';

            if (contentType.includes('application/json')) {
                return response.json().catch(error => {
                    return Promise.reject('Invalid JSON: ' + error.message);
                });
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