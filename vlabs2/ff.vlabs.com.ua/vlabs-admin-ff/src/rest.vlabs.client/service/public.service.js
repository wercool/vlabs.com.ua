class PublicService {
    constructor(vLabsRESTClientManager) {
    /**
        * VLabsRESTAuthService constructor
        * @constructor
        * @param {VLabsRESTClientManager}         vLabsRESTClientManager                      - VLabsRESTClientManager instance
        */
       this.manager = vLabsRESTClientManager;
    }

    ping() {
        return new Promise((resolve, reject) => {
            let apiEndPoint = this.manager.APIEndpoints.getFullyQualifiedURL('public', 'ping');
            this.manager.get(apiEndPoint)
            .then((result) => {
                resolve(result);
            })
            .catch((error) => {
                console.error(error.status);
                reject(error);
            });
        });
    }
}
export default PublicService;