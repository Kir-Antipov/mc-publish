## Publish Minecraft Mods - GitHub Action

[![GitHub tag](https://img.shields.io/github/tag/Kir-Antipov/mc-publish.svg?cacheSeconds=3600)](https://github.com/Kir-Antipov/mc-publish/releases/latest)
[![GitHub build status](https://img.shields.io/github/workflow/status/Kir-Antipov/mc-publish/ci/master?cacheSeconds=3600)](https://github.com/Kir-Antipov/mc-publish/actions/workflows/ci.yml)
[![GitHub license](https://img.shields.io/github/license/Kir-Antipov/mc-publish.svg?cacheSeconds=36000)](https://github.com/Kir-Antipov/mc-publish#readme)

The `Publish Minecraft Mods` action helps you upload assets of your Minecraft mods to GitHub Releases, Modrinth and CurseForge. This is a cross-platform action that runs on any environment.

### Usage

```yml
jobs:
  build:
    # ...
    steps:
      - uses: Kir-Antipov/mc-publish@v1.0
        with:
          modrinth-id: AANobbMI
          modrinth-token: ${{ secrets.MODRINTH_TOKEN }}

          curseforge-id: 394468
          curseforge-token: ${{ secrets.CURSEFORGE_TOKEN }}

          github-tag: mc1.17.1-0.3.2
          github-token: ${{ secrets.GITHUB_TOKEN }}

          files-primary: build/libs/!(*-@(dev|sources)).jar
          files-secondary: build/libs/*-@(dev|sources).jar

          name: Sodium 0.3.2 for Minecraft 1.17.1
          version: mc1.17.1-0.3.2
          versionType: release
          changelog-file: CHANGELOG.md

          loaders: |
            fabric
            forge
          gameVersions: |
            1.16.3
            1.17
            1.17.1
            21w37a
          java: |
            8
            16

```

### Inputs

| Name | Description | Default value | Examples |
|------|-------------|---------------|----------|
| modrinth-id | The ID of the Modrinth project to upload to | ❌ | `AANobbMI` |
| modrinth-token | A valid token for the Modrinth API | ❌ | `${{ secrets.MODRINTH_TOKEN }}` |
| curseforge-id | The ID of the CurseForge project to upload to | ❌ | `394468` |
| curseforge-token | A valid token for the CurseForge API | ❌ | `${{ secrets.CURSEFORGE_TOKEN }}` |
| github-tag | The tag name of the release to upload assets to | A tag of the release that triggered the action | `mc1.17.1-0.3.2` |
| github-token | A valid token for the CurseForge API | ❌ | `${{ secrets.GITHUB_TOKEN }}` |
| files | A glob of the files to upload | ❌ | `build/libs/*.jar` |
| files-primary | A glob of the primary files to upload | `build/libs/!(*-@(dev\|sources)).jar` | `build/libs/!(*-@(dev\|sources)).jar` |
| files-secondary | A glob of the secondary files to upload | `build/libs/*-@(dev\|sources).jar` | `build/libs/*-@(dev\|sources).jar` |
| name | The name of the version | A title of the release that triggered the action | `Sodium 0.3.2 for Minecraft 1.17.1` |
| version | The version number | A tag of the release that triggered the action | `mc1.17.1-0.3.2` |
| version-type | The type of the release | Will be parsed from the `version` value (e.g., `0.40.0+1.17-alpha` results in `alpha`) | `alpha` <br> `beta` <br> `release` |
| changelog | The changelog for this version | A body of the release that triggered the action | `This release fixes a few more issues in Sodium 0.3 for Minecraft 1.17.1.` |
| changelog-file | A glob of the changelog file | ❌ | `CHANGELOG.md` |
| loaders | A list of supported mod loaders | `fabric` | `fabric` <br> `forge` <br> `rift` |
| game-versions | A list of supported Minecraft versions | Will be parsed from the `version` value (e.g., `0.40.0+1.18_experimental` results in `21w37a` and `21w38a` at the moment) | `21w37a` <br> `1.17` |
| version-resolver | Determines the way automatic `game-versions` resolvement works | `releasesIfAny` | `exact` - exact game version *(`1.16` -> `1.16`)* <br><br> `latest` - the latest release of the given minor *(`1.16` -> `1.16.5`)* <br><br> `all` - all versions of the given minor starting with the specified build <br><br> `releases` - all releases of the given minor starting with the specified build *(`1.16.3` -> `[1.16.3, 1.16.4, 1.16.5]`)* <br><br> `releasesIfAny` - all releases of the given minor starting with the specified build, if any; otherwise, all versions |
| java | A list of supported Java versions | *empty string* | `Java 8` <br> `Java 1.8` <br> `8` |

### Minimalistic Example

As you can see, most of the values are automatically resolved. Therefore, here's all you really need to publish your Fabric mod:

```yml
jobs:
  build:
    # ...
    steps:
      - uses: Kir-Antipov/mc-publish@v1.0
        with:
          # You don't need this section if you don't want to publish
          # your assets to Modrinth
          modrinth-id: AANobbMI
          modrinth-token: ${{ secrets.MODRINTH_TOKEN }}

          # You don't need this section if you don't want to publish
          # your assets to CurseForge
          curseforge-id: 394468
          curseforge-token: ${{ secrets.CURSEFORGE_TOKEN }}

          # You don't need this section if you don't want to publish
          # your assets to GitHub
          github-token: ${{ secrets.GITHUB_TOKEN }}
```