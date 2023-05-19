import { GameVersionProvider } from "@/games/game-version-provider";
import { MojangApiClient } from "./mojang-api-client";

/**
 * A {@link GameVersionProvider} implementation that uses the Mojang API client to fetch Minecraft versions.
 */
export const MINECRAFT_VERSION_PROVIDER: GameVersionProvider = MojangApiClient.prototype.getMinecraftVersions.bind(new MojangApiClient());
