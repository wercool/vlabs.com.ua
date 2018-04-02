import { User } from ".";

export class Collaborator {
    id: number;
    user_id: number;
    user: User;
    alias: string;

    constructor() {
        this.id = undefined;
        this.user_id = undefined;
        this.user = undefined;
        this.alias = undefined;
    }
}
