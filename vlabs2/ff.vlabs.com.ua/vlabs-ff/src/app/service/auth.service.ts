import { Injectable } from "@angular/core";
import { ApiService } from "./api.service";

@Injectable()
export class AuthService {

    constructor(
        private apiService: ApiService,
    ) { }

    getAuthToken(credentials) {
        let endPoint = this.apiService.APIEndpoints.getFullyQualifiedURL('auth', 'token');
        let authorizationHeader = this.apiService.jsonHeaders;
        authorizationHeader.set('Authorization', 'true');
        console.log(authorizationHeader);
        return this.apiService.post(endPoint, credentials, authorizationHeader);
    }
}