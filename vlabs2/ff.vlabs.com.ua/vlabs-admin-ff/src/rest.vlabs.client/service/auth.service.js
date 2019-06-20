class AuthService {
    constructor(vLabsRESTClientManager) {
    /**
        * VLabsRESTAuthService constructor
        * @constructor
        * @param {VLabsRESTClientManager}         vLabsRESTClientManager                      - VLabsRESTClientManager instance
        */
       this.manager = vLabsRESTClientManager;

       this.token = localStorage.getItem('token');

       this.userDetails = JSON.parse(localStorage.getItem('userDetails'));
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('userDetails');
        this.token = null;
        this.userDetails = null;
    }

    authenticate(email, password) {
        return new Promise((resolve, reject) => {
            let endPointPath = this.manager.APIEndpoints.getFullyQualifiedURL('auth', 'token');
            let body = {
                username: email,
                password: btoa(password)
            };
            this.manager.post(endPointPath, body)
            .then((authResponse) => {
                this.token = authResponse.token;
                localStorage.setItem('token', this.token);

                this.updateUserDetails()
                .then((userDetails) => {

                    resolve();

                })
                .catch((error) => {
                    reject(error);
                });
            })
            .catch((error) => {
                reject(error);
            });
        });
    }

    isAuthenticated() {
        return this.userDetails !== null;
    }

    updateUserDetails() {
        return new Promise((resolve, reject) => {
            this.getUserDetails()
            .then((userDetails) => {
                this.userDetails = userDetails;
                localStorage.setItem('userDetails', JSON.stringify(this.userDetails));

                resolve(userDetails);
            })
            .catch((error) => {
                reject(error);
            });
        });
    }

    getUserDetails() {
        return new Promise((resolve, reject) => {
            let endPointPath = this.manager.APIEndpoints.getFullyQualifiedURL('auth', 'details');
            this.manager.get(endPointPath)
            .then((userDetails) => {
                resolve(userDetails);
            })
            .catch((error) => {
                reject(error);
            });
        });
    }
}
export default AuthService;