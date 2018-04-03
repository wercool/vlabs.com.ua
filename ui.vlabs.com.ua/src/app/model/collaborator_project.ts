export class CollaboratorProject {
    id: number;
    name: string;
    alias: string;

    constructor() {
        this.id = undefined;
        this.name = undefined;
        this.alias = undefined;
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