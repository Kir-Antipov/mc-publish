export default class SoftError extends Error {
    readonly soft: boolean;

    constructor(soft: boolean, message?: string) {
        super(message);
        this.soft = soft;
    }
}
