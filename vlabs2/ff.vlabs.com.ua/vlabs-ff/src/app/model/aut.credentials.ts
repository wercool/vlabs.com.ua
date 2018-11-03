export class AuthCredentials {
    username: number;
    password: string;

    constructor(credentials: any) {
        this.username = credentials.username;
        this.password = btoa(credentials.password);
    }
}