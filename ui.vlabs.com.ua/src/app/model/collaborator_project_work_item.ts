import { VLabsFileItem } from ".";

export class CollaboratorProjectWorkItem {
    id: number;
    collaborator_id: number;
    project_id: number;
    type: string;
    title: string;
    alias: string;
    notes: string;
    lastUpdateDate: number;
    fileItems: VLabsFileItem[];

    constructor() {
        this.id = undefined;
        this.collaborator_id = undefined;
        this.project_id = undefined;
        this.type = undefined;
        this.title = undefined;
        this.alias = undefined;
        this.notes = undefined;
        this.lastUpdateDate = undefined;
        this.fileItems = undefined;
    }

    map(anyCollaboratorProjectWorkItemViewItem: any): CollaboratorProjectWorkItem {
        let collaboratorProjectWorkItem: CollaboratorProjectWorkItem = new CollaboratorProjectWorkItem();
        Object.keys(anyCollaboratorProjectWorkItemViewItem).forEach(key => {
            if (collaboratorProjectWorkItem.hasOwnProperty(key)) {
                collaboratorProjectWorkItem[key] = anyCollaboratorProjectWorkItemViewItem[key];
            }
        });
        return collaboratorProjectWorkItem;
    }
}


export class CollaboratorProjectWorkItemViewItem extends CollaboratorProjectWorkItem {
    checked: boolean;
}