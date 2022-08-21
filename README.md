## Publish Minecraft Mods - GitHub Action

[![GitHub tag](https://img.shields.io/github/tag/Kir-Antipov/mc-publish.svg?cacheSeconds=3600)](https://github.com/Kir-Antipov/mc-publish/releases/latest)
[![GitHub build status](https://img.shields.io/github/workflow/status/Kir-Antipov/mc-publish/ci/master?cacheSeconds=3600)](https://github.com/Kir-Antipov/mc-publish/actions/workflows/ci.yml)
[![GitHub license](https://img.shields.io/github/license/Kir-Antipov/mc-publish.svg?cacheSeconds=36000)](https://github.com/Kir-Antipov/mc-publish#readme)

The `Publish Minecraft Mods` action helps you upload assets of your Minecraft mods to GitHub Releases, Modrinth and CurseForge. This is a cross-platform action that runs on any environment.

### 📖 Usage

Most of the values are automatically resolved *(read further for more info)*. Therefore, here's all you really need to publish your mod:

```yml
jobs:
  build:
    # ...
    steps:
      - uses: Kir-Antipov/mc-publish@v3.1
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

### 📖🦜 Unnecessary Verbose Example

Please, **do not** consider the following example as something you should use. `mc-publish` was made to be as zero-configy as possible, you just do not need all this. It's here to show you most of the available inputs in the form of an actual configuration. It not only hurts me on a spiritual level to see configurations with hardcoded values that could be automatically resolved, but sometimes people copy-paste inputs that will break their workflows, e.g., I saw someone trying to use `github-discussion: Announcements` in repo that had neither "Announcements" discussion category, nor discussions in general. [Occam's Razor](https://en.wikipedia.org/wiki/Occam%27s_razor) in action - if you don't see a reason to use an input, just don't use it. With all that said, let's get back to our unnecessary verbose example:

```yml
jobs:
  build:
    # ...
    steps:
      - uses: Kir-Antipov/mc-publish@v3.1
        with:
          modrinth-id: AANobbMI
          modrinth-featured: true
          modrinth-unfeature-mode: subset
          modrinth-token: ${{ secrets.MODRINTH_TOKEN }}

          curseforge-id: 394468
          curseforge-token: ${{ secrets.CURSEFORGE_TOKEN }}

          github-tag: mc1.17.1-0.3.2
          github-generate-changelog: true
          github-draft: false
          github-prerelease: false
          github-commitish: dev
          github-discussion: Announcements
          github-token: ${{ secrets.GITHUB_TOKEN }}

          files-primary: build/libs/!(*-@(dev|sources|javadoc)).jar
          files-secondary: build/libs/*-@(dev|sources|javadoc).jar

          name: Sodium 0.3.2 for Minecraft 1.17.1
          version: mc1.17.1-0.3.2
          version-type: release
          changelog-file: CHANGELOG.md

          loaders: |
            fabric
            forge
            quilt
          game-versions: |
            1.18.2
            1.19
            21w37a
          dependencies: |
            required-dependency | depends | *
            optional-dependency | recommends | 0.1.0
            suggested-dependency | suggests | 0.2.0
            included-dependency | includes | 0.3.0
            conflicting-dependency | conflicts | *
            incompatible-dependency | breaks | *
          java: |
            8
            17

          retry-attempts: 2
          retry-delay: 10000
          fail-mode: fail
```

### 📝 Inputs

| Name | Description | Default value | Examples |
|------|-------------|---------------|----------|
| [modrinth-id](#user-content-modrinth-id) | The ID of the Modrinth project to upload to | A value specified in the config file | `AANobbMI` |
| [modrinth-token](#user-content-modrinth-token) | A valid token for the Modrinth API | ❌ | `${{ secrets.MODRINTH_TOKEN }}` |
| [modrinth-featured](#user-content-modrinth-featured) | Indicates whether the version should be featured on Modrinth or not | `true` | `true` <br> `false` |
| [modrinth-unfeature-mode](#user-content-modrinth-unfeature-mode) | Determines the way automatic unfeaturing of older Modrinth versions works | If [`modrinth-featured`](#user-content-modrinth-featured) is set to true, `subset`; otherwise, `none` | `none` <br> `subset` <br> `intersection` <br> `any` |
| [curseforge-id](#user-content-curseforge-id) | The ID of the CurseForge project to upload to | A value specified in the config file | `394468` |
| [curseforge-token](#user-content-curseforge-token) | A valid token for the CurseForge API | ❌ | `${{ secrets.CURSEFORGE_TOKEN }}` |
| [github-tag](#user-content-github-tag) | The tag name of the release to upload assets to | A tag of the release that triggered the action, if any; otherwise it will be inferred from the `GITHUB_REF` environment variable | `mc1.17.1-0.3.2` |
| [github-generate-changelog](#user-content-github-generate-changelog) | Indicates whether to automatically generate the changelog for this release. If changelog is specified, it will be pre-pended to the automatically generated notes. Unused if the GitHub Release already exists [🛈](https://docs.github.com/en/rest/releases/releases#create-a-release) | `true`, if [`changelog`](#user-content-changelog) and [`changelog-file`](#user-content-changelog-file) are not provided; otherwise, `false` | `false` <br> `true` |
| [github-draft](#user-content-github-draft) | `true` to create a draft (unpublished) release, `false` to create a published one. Unused if the GitHub Release already exists [🛈](https://docs.github.com/en/rest/releases/releases#create-a-release) | `false` | `false` <br> `true` |
| [github-prerelease](#user-content-github-prerelease) | `true` to identify the release as a prerelease, `false` to identify the release as a full release. Unused if the GitHub Release already exists [🛈](https://docs.github.com/en/rest/releases/releases#create-a-release) | `false`, if [`version-type`](#user-content-version-type) is `release`; otherwise, `true` | `false` <br> `true` |
| [github-commitish](#user-content-github-commitish) | Specifies the commitish value that determines where the Git tag is created from. Can be any branch or commit SHA. Unused if the Git tag already exists [🛈](https://docs.github.com/en/rest/releases/releases#create-a-release) | The repository's default branch | `dev` <br> `feature/86` |
| [github-discussion](#user-content-github-discussion) | If specified, a discussion of the specified category is created and linked to the release. Unused if the GitHub Release already exists [🛈](https://docs.github.com/en/rest/releases/releases#create-a-release) | ❌ | `Announcements` |
| [github-token](#user-content-github-token) | A valid token for the GitHub API | ❌ | `${{ secrets.GITHUB_TOKEN }}` |
| [files](#user-content-files) | A [glob](https://www.digitalocean.com/community/tools/glob) of the file(s) to upload | ❌ | `build/libs/*.jar` |
| [files-primary](#user-content-files-primary) | A [glob](https://www.digitalocean.com/community/tools/glob) of the primary files to upload | `build/libs/!(*-@(dev\|sources\|javadoc)).jar` | `build/libs/!(*-@(dev\|sources\|javadoc)).jar` |
| [files-secondary](#user-content-files-secondary) | A [glob](https://www.digitalocean.com/community/tools/glob) of the secondary files to upload | `build/libs/*-@(dev\|sources\|javadoc).jar` | `build/libs/*-@(dev\|sources\|javadoc).jar` |
| [name](#user-content-name) | The name of the version | A title of the release that triggered the action | `Sodium 0.3.2 for Minecraft 1.17.1` |
| [version](#user-content-version) | The version number | A tag of the release that triggered the action | `mc1.17.1-0.3.2` |
| [version-type](#user-content-version-type) | The type of the release | Will be parsed from the [`version`](#user-content-version) value | `alpha` <br> `beta` <br> `release` |
| [changelog](#user-content-changelog) | The changelog for this version | A body of the release that triggered the action | `This release fixes a few more issues in Sodium 0.3 for Minecraft 1.17.1.` |
| [changelog-file](#user-content-changelog-file) | A glob of the changelog file | ❌ | `CHANGELOG.md` |
| [loaders](#user-content-loaders) | A list of supported mod loaders | `fabric` for Fabric mods <br> `forge` for Forge mods <br> `quilt` for Quilt mods | `fabric` <br> `forge` <br> `quilt` <br> `rift` |
| [game-versions](#user-content-game-versions) | A list of supported Minecraft versions | A value specified in the config file, if any; otherwise, it will be parsed from the [`version`](#user-content-version) value | `21w37a` <br> `1.17` |
| [version-resolver](#user-content-version-resolver) | Determines the way automatic [`game-versions`](#user-content-game-versions) resolvement works | `releasesIfAny` | `exact` <br> `latest` <br> `all` <br> `releases` <br> `releasesIfAny` |
| [dependencies](#user-content-dependencies) | A list of dependencies | A dependency list specified in the config file  | `fabric \| depends \| 0.40.0` <br> `fabric-api` |
| [java](#user-content-java) | A list of supported Java versions | *empty string* | `Java 8` <br> `Java 1.8` <br> `8` |
| [retry-attempts](#user-content-retry-attempts) | The maximum number of attempts to publish assets | `2` | `2` <br> `10` <br> `-1` |
| [retry-delay](#user-content-retry-delay) | Time delay between attempts to publish assets (in milliseconds) | `10000` | `10000` <br> `60000` <br> `0` |
| [fail-mode](#user-content-fail-mode) | Determines how errors that occur during mod publishing process are handled | `fail` | `fail` <br> `warn` <br> `skip` |

Note, that you can use any top-level property *(`name`, `version`, `dependencies`, `files`, etc.)* as a target-specific one. This can help you fine-tune `mc-publish` to suit your tastes and needs. For example, consider the following configuration:

```yaml
# It is a good idea to share the same primary file among different targets
files-primary: build/libs/!(*-@(dev\|sources\|javadoc)).jar

modrinth-id: aaaAAAaa
modrinth-token: ${{ secrets.MODRINTH_TOKEN }}
# Modrinth-specific name for your mod
modrinth-name: Modrinth Mod
# Modrinth-specific secondary files
modrinth-files-secondary: build/libs/*-@(dev\|sources\|javadoc).jar
# Modrinth-specific dependencies
# It is possible to use project ids instead of slugs
modrinth-dependencies: |
  AANobbMI | depends | *
  sodium

curseforge-id: 0
curseforge-token: ${{ secrets.CURSEFORGE_TOKEN }}
# CurseForge-specific name for your mod
curseforge-name: CurseForge Mod
# CurseForge-specific secondary files
curseforge-files-secondary: ""
# CurseForge-specific dependencies
# It is not possible to use project ids instead of slugs
curseforge-dependencies: |
  sodium | depends | *
```

#### modrinth-id

The ID of the Modrinth project to upload to.

```yaml
modrinth-id: AANobbMI
```

Can be automatically retrieved from the config file of your mod:

- `fabric.mod.json` (Fabric)

  - Custom `mc-publish` field *(recommended)*:
      ```json
      {
        // ...
        "custom": {
          "mc-publish": {
            "modrinth": "AANobbMI"
          }
        },
      }
      ```

  - Custom [`modmanager`](https://github.com/DeathsGun/ModManager) field *(recommended)*:
      ```json
      {
        // ...
        "custom": {
          "modmanager": {
            "modrinth": "AANobbMI"
          }
        },
      }
      ```

  - Custom `projects` field:
      ```json
      {
        // ...
        "custom": {
          "projects": {
            "modrinth": "AANobbMI"
          }
        },
      }
      ```

  - `projects` field:
      ```json
      {
        // ...
        "projects": {
          "modrinth": "AANobbMI"
        },
      }
      ```

- `mods.toml` (Forge)

  - Custom `mc-publish` field *(recommended)*:
      ```toml
      [custom.mc-publish]
          modrinth="AANobbMI"
      ```

  - Custom `projects` field:
      ```toml
      [custom.projects]
          modrinth="AANobbMI"
      ```

  - `projects` field:
      ```toml
      [projects]
          modrinth="AANobbMI"
      ```

- `quilt.mod.json` (Quilt)

  - `mc-publish` field *(recommended)*:
      ```json
      {
        // ...
        "mc-publish": {
          "modrinth": "AANobbMI"
        },
      }
      ```

  - `projects` field:
      ```json
      {
        // ...
        "projects": {
          "modrinth": "AANobbMI"
        },
      }
      ```

#### modrinth-token

A valid token for the Modrinth API. It's required if you want to publish your assets to Modrinth.

```yaml
modrinth-token: ${{ secrets.MODRINTH_TOKEN }}
```

#### modrinth-featured

Indicates whether the version should be featured on Modrinth or not.

```yaml
modrinth-featured: true
```

#### modrinth-unfeature-mode

Determines the way automatic unfeaturing of older Modrinth versions works. Default value is `subset`, if [`modrinth-featured`](#user-content-modrinth-featured) is set to true; otherwise, `none`.

```yaml
modrinth-unfeature-mode: version-intersection | loader-subset
```

Available presets:

 - `none` - no Modrinth versions will be unfeatured
 - `subset` - only those Modrinth versions which are considered a subset of the new one *(i.e., new release suports all of the version's mod loaders **and** game versions)* will be unfeatured
 - `intersection` - only those Modrinth versions which intersects with the new one *(i.e., support at least one of the mod loaders and one of the game versions supported by the new release)* will be unfeatured
 - `any` - all Modrinth versions will be unfeatured

 If none of the given presets suits your needs, you can construct a new one from the following values via bitwise `OR`, like so - `version-intersection | loaders-subset`:

 - `version-subset`
 - `version-intersection`
 - `version-any`
 - `loader-subset`
 - `loader-intersection`
 - `loader-any`

#### curseforge-id

The ID of the CurseForge project to upload to.

```yaml
curseforge-id: 394468
```

Can be automatically retrieved from the config file of your mod:

- `fabric.mod.json` (Fabric)

  - Custom `mc-publish` field *(recommended)*:
      ```json
      {
        // ...
        "custom": {
          "mc-publish": {
            "curseforge": 394468
          }
        },
      }
      ```

  - Custom [`modmanager`](https://github.com/DeathsGun/ModManager) field *(recommended)*:
      ```json
      {
        // ...
        "custom": {
          "modmanager": {
            "curseforge": 394468
          }
        },
      }
      ```

  - Custom `projects` field:
      ```json
      {
        // ...
        "custom": {
          "projects": {
            "curseforge": 394468
          }
        },
      }
      ```

  - `projects` field:
      ```json
      {
        // ...
        "projects": {
          "curseforge": 394468
        },
      }
      ```

- `mods.toml` (Forge)

  - Custom `mc-publish` field *(recommended)*:
      ```toml
      [custom.mc-publish]
          curseforge=394468
      ```

  - Custom `projects` field:
      ```toml
      [custom.projects]
          curseforge=394468
      ```

  - `projects` field:
      ```toml
      [projects]
          curseforge=394468
      ```

- `quilt.mod.json` (Quilt)

  - `mc-publish` field *(recommended)*:
      ```json
      {
        // ...
        "mc-publish": {
          "curseforge": 394468
        },
      }
      ```

  - `projects` field:
      ```json
      {
        // ...
        "projects": {
          "curseforge": 394468
        },
      }
      ```

#### curseforge-token

A valid token for the CurseForge API. It's required if you want to publish your assets to CurseForge.

```yaml
curseforge-token: ${{ secrets.CURSEFORGE_TOKEN }}
```

#### github-tag

The tag name of the release to upload assets to. If no value is provided, a tag of the release that triggered the action will be used, if any; otherwise it will be inferred from the `GITHUB_REF` environment variable.

```yaml
github-tag: mc1.17.1-0.3.2
```

#### github-generate-changelog

Indicates whether to automatically generate the changelog for this release. If changelog is specified, it will be pre-pended to the automatically generated notes. Unused if the GitHub Release already exists. Default value is `true`, if [`changelog`](#user-content-changelog) and [`changelog-file`](#user-content-changelog-file) are not provided; otherwise, `false`. [🛈](https://docs.github.com/en/rest/releases/releases#create-a-release)

```yaml
github-generate-changelog: false
```

#### github-draft

`true` to create a draft (unpublished) release, `false` to create a published one. Unused if the GitHub Release already exists. Default value is `false`. [🛈](https://docs.github.com/en/rest/releases/releases#create-a-release)

```yaml
github-draft: false
```

#### github-prerelease

`true` to identify the release as a prerelease, `false` to identify the release as a full release. Unused if the GitHub Release already exists. Default value is `false`, if [`version-type`](#user-content-version-type) is `release`; otherwise, `true`. [🛈](https://docs.github.com/en/rest/releases/releases#create-a-release)

```yaml
github-prerelease: true
```

#### github-commitish

Specifies the commitish value that determines where the Git tag is created from. Can be any branch or commit SHA. Unused if the Git tag already exists. Default value is the repository's default branch. [🛈](https://docs.github.com/en/rest/releases/releases#create-a-release)

```yaml
github-commitish: 347040cd637363613e56a6b333f09eaa5be3a196
```

#### github-discussion

If specified, a discussion of the specified category is created and linked to the release. Unused if the GitHub Release already exists. [🛈](https://docs.github.com/en/rest/releases/releases#create-a-release)

```yaml
github-discussion: Announcements
```

#### github-token

A valid token for the GitHub API. It's required if you want to publish your assets to GitHub.

```yaml
github-token: ${{ secrets.GITHUB_TOKEN }}
```

#### files

A glob of the file(s) to upload. If you want to publish multiple files, it's recommended to use [`files-primary`](#user-content-files-primary) and [`files-secondary`](#user-content-files-secondary) instead.

```yaml
files: build/libs/*.jar
```

#### files-primary

A glob of the primary files to upload. Default value is `build/libs/!(*-@(dev|sources|javadoc)).jar`.

```yaml
files-primary: build/libs/!(*-@(dev|sources|javadoc)).jar
```

#### files-secondary

A glob of the secondary files to upload. Default value is `build/libs/*-@(dev|source|javadocs).jar`.

```yaml
files-secondary: build/libs/*-@(dev|sources|javadoc).jar
```

#### name

The name of the version. If no value is provided, a title of the release that triggered the action will be used. If you want Modrinth and CurseForge to determine the version name themselves, omit the field with an empty string (`""`).

```yaml
name: Sodium 0.3.2 for Minecraft 1.17.1
```

#### version

The version number. If no value is provided, a tag of the release that triggered the action is used.

```yaml
version: mc1.17.1-0.3.2
```

#### version-type

The type of the release. If no value is provided, it will be parsed from the [`version`](#user-content-version) value (e.g., `0.40.0+1.17-alpha` results in `alpha`).

```yaml
version-type: release
```

#### changelog

The changelog for this version. If no value is provided, a body of the release that triggered the action will be used.

```yaml
changelog: This release fixes a few more issues in Sodium 0.3 for Minecraft 1.17.1.
```

#### changelog-file

A glob of the changelog file.

```yaml
changelog-file: CHANGELOG.md
```

#### loaders

A list of supported mod loaders. If no value is provided, `fabric` will be used for valid Fabric mods, `forge` will be used for valid Forge mods, `quilt` will be used for valid Quilt mods, and `fabric, quilt` will be used for Fabric mods that were marked as Quilt-compatible.

Fabric mods can be marked as Quilt-compatible like so:

- `fabric.mod.json`
  ```json
  {
    // ...
    "custom": {
      "mc-publish": {
        "quilt": true
      }
    },
  }
  ```

<br>

```yaml
loaders: |
  fabric
  forge
  quilt
```

#### game-versions

A list of supported Minecraft versions. If no value is provided, the minimum supported version will be retrieved from the configuration file of your mod, if any, otherwise it will be parsed from the [`version`](#user-content-version) value (e.g., `0.40.0+1.17` results in `1.17`), and then it will be expanded using the specified [`version-resolver`](#user-content-version-resolver).

```yaml
game-versions: |
  1.16.5
  1.17
  1.17.1
  21w37a
```

#### version-resolver

Determines the way automatic `game-versions` resolvement works. Default value is `releasesIfAny`.

```yaml
version-resolver: latest
```

Available values:

 - `exact` - exact game version *(`1.16` -> `1.16`)*
 - `latest` - the latest release of the given minor *(`1.16` -> `1.16.5`)*
 - `all` - all versions of the given minor starting with the specified build *(`1.16.5` -> `[20w45a, 20w46a, 20w48a, 20w49a, 20w51a, 1.16.5-rc1, 1.16.5]`)*
 - `releases` - all releases of the given minor starting with the specified build *(`1.16.3` -> `[1.16.3, 1.16.4, 1.16.5]`)*
 - `releasesIfAny` - all releases of the given minor starting with the specified build, if any; otherwise, all versions

#### dependencies

A list of dependencies.

```yaml
dependencies: |
  required-dependency | depends | *
  required-dependency | depends
  required-dependency
  optional-dependency | recommends | 0.1.0
  suggested-dependency | suggests | 0.2.0
  included-dependency | includes | 0.3.0
  conflicting-dependency | conflicts | *
  incompatible-dependency | breaks | *
```

As you can see, each dependency should be written on a new line using the following format - `{id} | {kind=depends} | {version=*}`.

Available dependency kinds:
 - `depends` - for dependencies required to run. Without them a game will crash.
 - `recommends` - for dependencies not required to run. Without them a game will log a warning.
 - `suggests` - for dependencies not required to run. Can be used as a kind of metadata.
 - `includes` - for dependencies embedded into the mod. Can be used as a kind of metadata.
 - `conflicts` - for mods whose together with yours cause some kind of bugs, etc. With them a game will log a warning.
 - `breaks` - for mods whose together with yours might cause a game crash. With them a game will crash.

Can be automatically retrieved from the config file of your mod:

- `fabric.mod.json` (Fabric)
  ```json
  "depends": {
    "required-dependency": "*"
  },
  "recommends": {
    "optional-dependency": "0.1.0"
  },
  "suggests": {
    "suggested-dependency": "0.2.0"
  },
  "includes": {
    // Check if your version of the Fabric loader supports objects in dependency declarations.
    "included-dependency": {
      "version": "0.3.0",
      "custom": {
        "mc-publish": {
          "ignore": false, // `mc-publish` will ignore this dependency, if `ignore` is set to true
          "modrinth": "included-dependency-fabric", // Modrinth's project slug
          "curseforge": "included-dependency-fabric" // CurseForge's project slug
        }
      }
    }
  },
  "conflicts": {
    "conflicting-dependency": "*"
  },
  "breaks": {
    "incompatible-dependency": "*"
  },
  ```

- `mods.toml` (Forge)
  ```toml
  [[dependencies.mod-id]]
    modId="required-dependency"
    mandatory=true
    versionRange="*"
    ordering="NONE"
    side="BOTH"

  [[dependencies.mod-id]]
    modId="optional-dependency"
    mandatory=false
    versionRange="0.1.0"
    ordering="NONE"
    side="BOTH"

  [[dependencies.mod-id]]
    modId="included-dependency"
    mandatory=false
    embedded=true
    versionRange="0.3.0"
    ordering="NONE"
    side="BOTH"
    [dependencies.mod-id.custom.mc-publish]
        ignore=false # `mc-publish` will ignore this dependency, if `ignore` is set to true
        modrinth="included-dependency-forge" # Modrinth's project slug
        curseforge="included-dependency-forge" # CurseForge's project slug

  [[dependencies.mod-id]]
    modId="incompatible-dependency"
    mandatory=false
    incompatible=true
    versionRange="*"
    ordering="NONE"
    side="BOTH"
  ```

- `quilt.mod.json` (Quilt)
  ```json
  "depends": [
    "required-dependency",
    {
      "id": "optional-dependency",
      "version": "0.1.0",
      "optional": true
    }
  ],
  "provides": [
    {
      "id": "included-dependency",
      "version": "0.3.0",
      "mc-publish": {
        "ignore": false, // `mc-publish` will ignore this dependency, if `ignore` is set to true
        "modrinth": "included-dependency-fabric", // Modrinth's project slug
        "curseforge": "included-dependency-fabric" // CurseForge's project slug
      }
    }
  ],
  "breaks": [
    {
      "id": "incompatible-dependency",
      "version": "*"
    },
    {
      "id": "conflicting-dependency",
      "version": "*",
      "unless": "some-mod-that-fixes-conflict"
    }
  ],
  ```

#### java

A list of supported Java versions. It's omitted by default.

```yaml
java: |
  8
  16
  Java 17
```

#### retry-attempts

The maximum number of attempts to publish assets.

```yaml
retry-attempts: 2
```

#### retry-delay

Time delay between attempts to publish assets (in milliseconds).

```yaml
retry-delay: 10000
```

#### fail-mode

Determines how errors that occur during mod publishing process are handled. Default value is `fail`.

```yaml
fail-mode: fail
```

Available values:

 - `fail` - immediately sets the action status to **failed** and terminates its execution
 - `warn` - warns about errors. The action won't be terminated, nor its status will be set to **failed**
 - `skip` - warns about errors. The action won't be terminated, but its status will be set to **failed** after all specified targets have been processed
