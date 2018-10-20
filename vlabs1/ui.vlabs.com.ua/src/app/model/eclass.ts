import { EClassFormat } from "./index";

export class EClass {
    id: number;
    title: string;
    description: string;
    active: boolean;
    summary: string;
    formatId: number;
    format: EClassFormat;

    constructor() {
        this.id = undefined;
        this.title = undefined;
        this.description = undefined;
        this.active = undefined;
        this.summary = undefined;
        this.formatId = undefined;
        this.format = undefined;
    }

    map(anyEClassItem: any): EClass {
        let eclass: EClass = new EClass();
        Object.keys(anyEClassItem).forEach(key => {
            if (eclass.hasOwnProperty(key)) {
                eclass[key] = anyEClassItem[key];
            }
        });
        return eclass;
    }
}

export class EClassItem extends EClass {
    checked: boolean;
}