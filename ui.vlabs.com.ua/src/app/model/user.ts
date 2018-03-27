import {
    Authority
} from './authority'

export class User {
    id: number;
    authorities: Authority[];
    enabled: boolean;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    lastPasswordResetDate: number;

    constructor() {
        this.id = undefined;
        this.authorities = undefined;
        this.enabled = undefined;
        this.username = undefined;
        this.firstName = undefined;
        this.lastName = undefined;
        this.email = undefined;
        this.phoneNumber = undefined;
        this.lastPasswordResetDate = undefined;
    }

    map(anyUserItem: any): User {
        let user: User = new User();
        Object.keys(anyUserItem).forEach(key => {
            if (user.hasOwnProperty(key)) {
                user[key] = anyUserItem[key];
            }
        });
        return user;
    }
}

export class UserItem extends User {
    checked: boolean;
}
