export class HelpClip {
    id: number;
    title: string;
    alias: string;
    path: string;
    shortdesc: string;
    description: string;

    constructor() {
        this.id = undefined;
        this.title = undefined;
        this.alias = undefined;
        this.path = undefined;
        this.shortdesc = undefined;
        this.description = undefined;
    }

    map(anyHelpClipItem: any): HelpClip {
        let helpClip: HelpClip = new HelpClip();
        Object.keys(anyHelpClipItem).forEach(key => {
            if (helpClip.hasOwnProperty(key)) {
                helpClip[key] = anyHelpClipItem[key];
            }
        });
        return helpClip;
    }
}