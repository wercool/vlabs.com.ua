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
}
