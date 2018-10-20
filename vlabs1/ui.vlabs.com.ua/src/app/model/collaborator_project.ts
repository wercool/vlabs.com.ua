export class CollaboratorProject {
    id: number;
    name: string;
    alias: string;
    description: string;

    constructor() {
        this.id = undefined;
        this.name = undefined;
        this.alias = undefined;
        this.description = undefined;
    }

    map(anyCollaboratorProjectItem: any): CollaboratorProject {
        let collaboratorProject: CollaboratorProject = new CollaboratorProject();
        Object.keys(anyCollaboratorProjectItem).forEach(key => {
            if (collaboratorProject.hasOwnProperty(key)) {
                collaboratorProject[key] = anyCollaboratorProjectItem[key];
            }
        });
        return collaboratorProject;
    }
}


export class CollaboratorProjectItem extends CollaboratorProject {
    checked: boolean;
}