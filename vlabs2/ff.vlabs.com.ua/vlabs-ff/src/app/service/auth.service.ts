import { Injectable } from "@angular/core";
import { ApiService } from "./api.service";

@Injectable()
export class AuthService {

    constructor(
        private apiService: ApiService,
    ) { }

    authAttempt(credentials) {
        credentials.password = btoa(credentials.password);
        let apiEndPoint = this.apiService.APIEndpoints.getFullyQualifiedURL('auth', 'token');
        return this.apiService.post(apiEndPoint, credentials);
    }
}