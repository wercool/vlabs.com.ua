import { User } from ".";

export class Group {
    id: number;
    name: string;
    members: User[];

    constructor() {
        this.id = undefined;
        this.name = undefined;
        this.members = undefined;
    }

    map(anyGroupItem: any): Group {
        let group: Group = new Group();
        Object.keys(anyGroupItem).forEach(key => {
            if (group.hasOwnProperty(key)) {
                group[key] = anyGroupItem[key];
            }
        });
        return group;
    }
}

export class GroupItem extends Group {
    checked: boolean;
    membersNum: number;
}

