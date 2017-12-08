import { EClassFormat } from "./index";

export class EClass {
    id: number;
    title: string;
    description: string;
    active: boolean;
    summary: string;
    format_id: number;
    format: EClassFormat
}
