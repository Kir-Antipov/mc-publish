// _ TODO: Drop support for the legacy format completely.

import { FabricDependencyType } from "@/loaders/fabric/fabric-dependency-type";
import { deprecate } from "node:util";
import { DependencyInfo } from "./dependency";

/**
 * Checks if the provided dependency string is in the legacy format.
 *
 * @param dependency - The dependency string to check.
 *
 * @returns A boolean indicating if the string is in the legacy format.
 */
export function isLegacyDependencyFormat(dependency: string): boolean {
    return !!dependency?.includes("|") && !dependency.includes("@");
}

/**
 * Parses the legacy dependency format.
 *
 * @param dependencyFormat - The dependency string in the legacy format.
 *
 * @returns An object containing the parsed dependency info.
 *
 * @remarks
 *
 * The legacy format is: `[dependency-id] | [type]? | [version-range]?`
 */
function _parseLegacyDependencyFormat(dependencyFormat: string): DependencyInfo {
    const [id, fabricType, versions] = dependencyFormat.split("|").map(x => x.trim());
    const type = fabricType && FabricDependencyType.toDependencyType(FabricDependencyType.parse(fabricType));
    return { id, type, versions };
}

/**
 * Parses the legacy dependency format with a deprecation warning.
 *
 * @param dependencyFormat - The dependency string in the legacy format.
 *
 * @returns An object containing the parsed dependency info.
 *
 * @remarks
 *
 * The legacy format is: `[dependency-id] | [type]? | [version-range]?`
 *
 * @deprecated
 *
 * The old dependency string format is deprecated. Please use the new format.
 *
 * Example: `foo@1.0.0-2.0.0(required){modrinth:foo-fabric}#(ignore:curseforge)`.
 */
export const parseLegacyDependencyFormat = deprecate(
    _parseLegacyDependencyFormat,
    "The old dependency string format is deprecated. " +
    "Please use the new format. " +
    "Example: foo@1.0.0-2.0.0(required){modrinth:foo-fabric}#(ignore:curseforge)",
);
