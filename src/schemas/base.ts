export class ResponseSchema {
    status?: string = "success";
    message: string;

    constructor(options: { status?: string } = {}) {
        this.status = options.status || "success";
    }
}