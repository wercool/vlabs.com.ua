import { Injectable } from "@angular/core";
import { ApiService } from "./api.service";

@Injectable()
export class AuthService {

    constructor(
        private apiService: ApiService,
    ) { }

    authAttempt(credentials) {
        let apiEndPoint = this.apiService.APIEndpoints.getFullyQualifiedURL('auth', 'attempt');
        return this.apiService.post(apiEndPoint, credentials);
    }
}