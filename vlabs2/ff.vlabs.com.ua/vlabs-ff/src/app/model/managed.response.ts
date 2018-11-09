export enum ManagedResponseStatus
{
    OK,
    ALREADY_DONE
}

export class ManagedResponse {
    status: string;
    message: string;
}