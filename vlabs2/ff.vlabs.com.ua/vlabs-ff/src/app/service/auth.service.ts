import { Injectable } from "@angular/core";
import { ApiService } from "./api.service";
import { AuthCredentials } from "../model/aut.credentials";

@Injectable()
export class AuthService {

    token: string = undefined;
    authenticated: boolean = false;

    constructor(
        private apiService: ApiService,
    ) {
        this.token = undefined;
    }

    isAuthenticated() {
        return this.authenticated;
    }

    persistToken(token: string) {
        this.token = token;
        localStorage.setItem('token', token);
        this.apiService.modifyHeaders({name: 'Authorization', value: 'Bearer ' + this.token});
    }

    getToken() {
        return this.token;
    }

    getPersistedToken() {
        return localStorage.getItem('token');
    }

    authenticate(credentials) {
        let authCredentials = new AuthCredentials(credentials);
        let apiEndPoint = this.apiService.APIEndpoints.getFullyQualifiedURL('auth', 'token');
        return new Promise((resolve, reject) => {
            this.apiService
            .post(apiEndPoint, authCredentials)
            .delay(500)
            .toPromise()
            .then(result => {
                this.authenticated = true;
                this.persistToken(result.token);
                resolve(result);
            })
            .catch((error) => {
                reject(error);
            });
        });
    }

    details() {
        let apiEndPoint = this.apiService.APIEndpoints.getFullyQualifiedURL('auth', 'details');
        return new Promise((resolve, reject) => {
            this.apiService
            .get(apiEndPoint)
            .delay(500)
            .toPromise()
            .then(result => {
                resolve(result);
            })
            .catch((error) => {
                reject(error);
            });
        });
    }
}