/**
 * Represents a plugin which can be loaded by the Quilt loader.
 */
export interface QuiltPlugin {
    /**
     * Language adapter to use for this plugin.
     */
    adapter?: string;

    /**
     * Points to an implementation of the plugin.
     */
    value: string;
}
