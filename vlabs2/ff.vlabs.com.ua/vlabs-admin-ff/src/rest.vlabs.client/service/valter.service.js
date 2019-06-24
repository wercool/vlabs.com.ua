class ValterService {
    constructor(vLabsRESTClientManager) {
    /**
        * ValterService constructor
        * @constructor
        * @param {VLabsRESTClientManager}         vLabsRESTClientManager                      - VLabsRESTClientManager instance
        */
       this.manager = vLabsRESTClientManager;
    }

    getTuplesNum() {
        return new Promise((resolve, reject) => {
            let apiEndPoint = this.manager.APIEndpoints.getFullyQualifiedURL('valter', 'tuplesNum');
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
export default ValterService;