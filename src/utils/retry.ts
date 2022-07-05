import sleep from "./sleep";

export default async function retry<T>({ func, delay = 0, maxAttempts = -1, softErrorPredicate, errorCallback }: { func: () => T | Promise<T>, delay?: number, maxAttempts?: number, softErrorPredicate?: (error: unknown) => boolean, errorCallback?: (error: unknown) => void }): Promise<T> {
    let attempts = 0;
    while (true) {
        try {
            return await func();
        } catch (e) {
            const isSoft = softErrorPredicate ? softErrorPredicate(e) : e?.soft;
            if (!isSoft || maxAttempts >= 0 && ++attempts >= maxAttempts ) {
                throw e;
            }
            if (errorCallback) {
                errorCallback(e);
            }
        }
        await sleep(delay);
    }
}
