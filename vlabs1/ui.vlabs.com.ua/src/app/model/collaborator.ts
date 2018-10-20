import { User, CollaboratorProject } from ".";

export class Collaborator {
    id: number;
    user_id: number;
    user: User;
    alias: string;
    projects: CollaboratorProject[] = [];

    constructor() {
        this.id = undefined;
        this.user_id = undefined;
        this.user = undefined;
        this.alias = undefined;
        this.projects = undefined;
    }
}
