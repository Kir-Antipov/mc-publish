export const ACTION_MODULE_LOADER = (path: string): Promise<Record<string, unknown>> => {
    return Promise.resolve(path ? undefined : null);
};
