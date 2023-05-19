/* ************************************************************************ */
/*               WARNING: AUTO-GENERATED FILE - DO NOT EDIT!                */
/*                                                                          */
/* Please be advised that this is an auto-generated file and should NOT be  */
/*       modified. Any changes made to this file WILL BE OVERWRITTEN.       */
/*                                                                          */
/*     To make changes to the contents of this file, please modify the      */
/* action.template.yml file instead. This will ensure that your changes are */
/*              properly reflected in the auto-generated file.              */
/* ************************************************************************ */
/* eslint-disable */
import * as _08266313cf301b8949a6cedcaa47a6c3e43934d9 from "@/platforms/modrinth/modrinth-unfeature-mode";
import * as _d55dccbfda6518ce241204ddb1a0e427ce862b40 from "@/utils/security/secure-string";
import * as _52f2d2846827ca15dbb2bc99e7396358640a305c from "@/utils/io/file-info";
import * as _cece1ed3512bc9bb742f3472360aea9d482df4ac from "@/utils/versioning/version-type";
import * as _61ccbb54c5e0251e3bf7013ca2e222f64c571674 from "@/dependencies/dependency";
import * as _12c3001b56ab71951504c91b71926343a997a6c2 from "@/games/game-version-filter";
import * as _9f1d8775cb694c12b0f9f4e026b96daf7eca20c3 from "@/utils/java/java-version";
import * as _78525bc7f22a643e04dd785d89dd01e5c9c2f812 from "@/utils/errors/fail-mode";
import * as _6f74c0ca5e9e22747c834103f851654db4509ca8 from "@/platforms/uploaded-file";

export const ACTION_MODULE_LOADER = (path: string): Promise<Record<string, unknown>> => {
    if (path === "platforms/modrinth/modrinth-unfeature-mode") return Promise.resolve(_08266313cf301b8949a6cedcaa47a6c3e43934d9);
    if (path === "utils/security/secure-string") return Promise.resolve(_d55dccbfda6518ce241204ddb1a0e427ce862b40);
    if (path === "utils/io/file-info") return Promise.resolve(_52f2d2846827ca15dbb2bc99e7396358640a305c);
    if (path === "utils/versioning/version-type") return Promise.resolve(_cece1ed3512bc9bb742f3472360aea9d482df4ac);
    if (path === "dependencies/dependency") return Promise.resolve(_61ccbb54c5e0251e3bf7013ca2e222f64c571674);
    if (path === "games/game-version-filter") return Promise.resolve(_12c3001b56ab71951504c91b71926343a997a6c2);
    if (path === "utils/java/java-version") return Promise.resolve(_9f1d8775cb694c12b0f9f4e026b96daf7eca20c3);
    if (path === "utils/errors/fail-mode") return Promise.resolve(_78525bc7f22a643e04dd785d89dd01e5c9c2f812);
    if (path === "platforms/uploaded-file") return Promise.resolve(_6f74c0ca5e9e22747c834103f851654db4509ca8);
    return Promise.resolve(undefined);
};
