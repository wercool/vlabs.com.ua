class AuthService {
    constructor(vLabsRESTClientManager) {
    /**
        * VLabsRESTAuthService constructor
        * @constructor
        * @param {VLabsRESTClientManager}         vLabsRESTClientManager                      - VLabsRESTClientManager instance
        */
       this.manager = vLabsRESTClientManager;

       this.token = undefined;
    }
}
export default AuthService;