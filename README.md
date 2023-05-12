## mc-publish

[![GitHub tag](https://img.shields.io/github/tag/Kir-Antipov/mc-publish.svg)](https://github.com/Kir-Antipov/mc-publish/releases/latest)
[![GitHub build status](https://img.shields.io/github/actions/workflow/status/Kir-Antipov/mc-publish/ci.yml?branch=master)](https://github.com/Kir-Antipov/mc-publish/actions/workflows/ci.yml)
[![GitHub license](https://img.shields.io/github/license/Kir-Antipov/mc-publish.svg?cacheSeconds=36000)](https://github.com/Kir-Antipov/mc-publish#readme)

A versatile GitHub Action to streamline the publication of Minecraft projects.

Supports mods, plugins, resource packs, and more, across various platforms such as Modrinth, GitHub Releases, and CurseForge. Features automatic value resolution and minimal configuration requirements for effortless setup and use.

### 📖 Usage

Most values are resolved automatically, so to publish your project, you only need a minimal amount of configuration.

```yaml
jobs:
  build:
    # ...
    steps:
      - uses: Kir-Antipov/mc-publish@v3.2
        with:
          # Only include this section if you wish to publish
          # your assets on Modrinth.
          modrinth-id: AANobbMI
          modrinth-token: ${{ secrets.MODRINTH_TOKEN }}

          # Only include this section if you wish to publish
          # your assets on CurseForge.
          curseforge-id: 394468
          curseforge-token: ${{ secrets.CURSEFORGE_TOKEN }}

          # Only include this section if you wish to publish
          # your assets on GitHub.
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

### 📘 Advanced Usage

The following verbose example is for illustrative purposes only and is not recommended for regular use. `mc-publish` was designed to require minimal configuration, so there's no need for all of these settings.

Overly complex configurations with hardcoded values that could be resolved automatically not only complicate your workflow but can also introduce errors. For example, attempting to use `github-discussion: Announcements` in a repository that doesn't have a "Announcements" discussion category or discussions in general would lead to problems.

As a rule of thumb, if you don't see a clear reason to use an input, it's best not to include it.

```yml
jobs:
  build:
    # ...
    steps:
      - uses: Kir-Antipov/mc-publish@v3.2
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

          files: |
            build/libs/!(*-@(dev|sources|javadoc)).jar
            build/libs/*-@(dev|sources|javadoc).jar

          name: Sodium 0.3.2 for Minecraft 1.17.1
          version: mc1.17.1-0.3.2
          version-type: release
          changelog-file: CHANGELOG.*

          loaders: |
            fabric
            forge
            quilt
          game-versions: |
            [1.16,1.16.5)
            >=21w37a <1.18.2
            1.19
          game-version-filter: none
          dependencies: |
            required-dependency
            optional-dependency@0.1.0(optional)
            recommended-dependency@0.2.0(recommended)
            embedded-dependency@0.3.0(embedded)
            conflicting-dependency(conflicting)
            incompatible-dependency(incompatible)
            fabric@0.81.1+1.19.4(required){modrinth:P7dR8mSH}{curseforge:306612}#(ignore:github)
          java: |
            Java 1.8
            17

          retry-attempts: 2
          retry-delay: 10000
          fail-mode: fail
```

### 📝 Inputs

| Name                                                                 | Description                                                                                                                                       | Default                                                                                         | Examples                                                                   |
|----------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------|
| [modrinth-id](#modrinth-id)                             | The unique identifier of your Modrinth project.                                                                                                   | A value specified in the metadata file.                                                         | `AANobbMI`                                                                 |
| [modrinth-featured](#modrinth-featured)                 | Set to `true` to feature the version on Modrinth.                                                                                                 | `true`                                                                                          | `true` <br> `false`                                                        |
| [modrinth-unfeature-mode](#modrinth-unfeature-mode)     | Sets the behavior for unfeaturing older Modrinth versions.                                                                                        | If `modrinth-featured` is set to `true`, `subset`; otherwise, `none`.                           | `none` <br> `subset` <br> `intersection` <br> `any`                        |
| [modrinth-token](#modrinth-token)                       | Your Modrinth API token.                                                                                                                          | -                                                                                               | `${{ secrets.MODRINTH_TOKEN }}`                                            |
| [curseforge-id](#curseforge-id)                         | The unique identifier of your CurseForge project.                                                                                                 | A value specified in the metadata file.                                                         | `394468`                                                                   |
| [curseforge-token](#curseforge-token)                   | Your CurseForge API token.                                                                                                                        | -                                                                                               | `${{ secrets.CURSEFORGE_TOKEN }}`                                          |
| [github-tag](#github-tag)                               | The tag name for the release where assets will be uploaded.                                                                                       | If a release triggered the action, its tag is used. Otherwise, inferred from `GITHUB_REF`.      | `mc1.17.1-0.3.2`                                                           |
| [github-generate-changelog](#github-generate-changelog) | Set to `true` to generate a changelog automatically for this release. Ignored if the GitHub Release already exists.                               | `true`, if `changelog` and `changelog-file` are not provided; otherwise, `false`.               | `true` <br> `false`                                                        |
| [github-draft](#github-draft)                           | Set to `true` to create a draft release. Ignored if the GitHub Release already exists.                                                            | `false`                                                                                         | `true` <br> `false`                                                        |
| [github-prerelease](#github-prerelease)                 | Set to `true` to mark the release as a prerelease. Ignored if the GitHub Release already exists.                                                  | `false`, if `version-type` is `release`; otherwise, `true`.                                     | `true` <br> `false`                                                        |
| [github-commitish](#github-commitish)                   | Defines the commitish value that determines where the Git tag is created from. Ignored if the Git tag already exists.                             | The repository's default branch.                                                                | `dev` <br> `feature/86`                                                    |
| [github-discussion](#github-discussion)                 | If specified, creates and links a discussion of the specified **EXISTING** category to the release. Ignored if the GitHub Release already exists. | -                                                                                               | `Announcements`                                                            |
| [github-token](#github-token)                           | Your GitHub API token.                                                                                                                            | -                                                                                               | `${{ secrets.GITHUB_TOKEN }}`                                              |
| [files](#files)                                         | An array of [globs](https://www.digitalocean.com/community/tools/glob) determining which files to upload.                                         | `build/libs/!(*-@(dev\|sources\|javadoc)).jar` <br> `build/libs/*-@(dev\|sources\|javadoc).jar` | `build/libs/*.jar`                                                         |
| [name](#name)                                           | The name of the version.                                                                                                                          | A title of the release that triggered the action.                                               | `Sodium 0.3.2 for Minecraft 1.17.1`                                        |
| [version](#version)                                     | The version number.                                                                                                                               | A tag of the release that triggered the action.                                                 | `mc1.17.1-0.3.2`                                                           |
| [version-type](#version-type)                           | The version type.                                                                                                                                 | Will be parsed from the `version` value.                                                        | `alpha` <br> `beta` <br> `release`                                         |
| [changelog](#changelog)                                 | The changelog for this version.                                                                                                                   | A body of the release that triggered the action.                                                | `This release fixes a few more issues in Sodium 0.3 for Minecraft 1.17.1.` |
| [changelog-file](#changelog-file)                       | A [glob](https://www.digitalocean.com/community/tools/glob) pointing to the changelog file.                                                       | -                                                                                               | `CHANGELOG.md`                                                             |
| [loaders](#loaders)                                     | An array of supported loaders.                                                                                                                    | A value specified in the metadata file.                                                         | `fabric` <br> `forge` <br> `quilt` <br> `rift`                             |
| [game-versions](#game-versions)                         | An array of supported Minecraft versions.                                                                                                         | A value specified in the metadata file.                                                         | `21w37a` <br> `>=1.17` <br> `[1.17,)`                                      |
| [dependencies](#dependencies)                           | An array of dependencies required by your project.                                                                                                | A value specified in the metadata file.                                                         | `fabric@0.40.0(required)`                                                  |
| [game-version-filter](#game-version-filter)             | Controls the method used to filter game versions.                                                                                                 | `releases \| min-major \| min-minor`                                                            | `releases` <br> `min` <br> `max` <br> `none`                               |
| [java](#java)                                           | An array of Java versions compatible with your project.                                                                                           | -                                                                                               | `Java 8` <br> `Java 1.8` <br> `8`                                          |
| [retry-attempts](#retry-attempts)                       | Defines the maximum number of asset publishing attempts.                                                                                          | `2`                                                                                             | `2` <br> `10` <br> `-1`                                                    |
| [retry-delay](#retry-delay)                             | Specifies the delay (in milliseconds) between asset publishing attempts.                                                                          | `10000`                                                                                         | `1000` <br> `60000` <br> `0`                                               |
| [fail-mode](#fail-mode)                                 | Controls how the action responds to errors during the mod publishing process.                                                                     | `fail`                                                                                          | `fail` <br> `warn` <br> `skip`                                             |

Please note that any top-level property *(`name`, `version`, `dependencies`, `files`, etc.)* can be used as a target-specific one. This allows you to customize `mc-publish` to better meet your individual preferences and requirements. To illustrate, let's take a look at the following configuration:

```yaml
# Shared top-level properties
files: build/libs/!(*-@(dev\|sources\|javadoc)).jar
dependencies: |
  sodium@0.4.10(required){modrinth:AANobbMI}{curseforge:394468}#(ignore:curseforge)

modrinth-id: AAAAAAAA
modrinth-token: ${{ secrets.MODRINTH_TOKEN }}
# The name of your mod, specific to Modrinth
modrinth-name: Modrinth Mod
# The files for your mod, specific to Modrinth
modrinth-files: build/libs/*.jar
# The dependencies for your mod, specific to Modrinth
# Note that it's possible to use project ids instead of slugs
modrinth-dependencies: |
  AANobbMI@0.4.10(required)

curseforge-id: 0
curseforge-token: ${{ secrets.CURSEFORGE_TOKEN }}
# The name of your mod, specific to CurseForge
curseforge-name: CurseForge Mod
# The dependencies for your mod, specific to CurseForge
# Note that it's possible to use project ids instead of slugs
curseforge-dependencies: |
  394468@0.4.10(required)
```

#### modrinth-id

The unique identifier of your Modrinth project.

```yaml
modrinth-id: AANobbMI
```

Can be automatically retrieved from the metadata file of your project:

- `fabric.mod.json` (Fabric)

  - Custom `mc-publish` field:
      ```json
      {
        // ...
        "custom": {
          "mc-publish": {
            "modrinth": "AANobbMI"
          }
        }
      }
      ```

- `mods.toml` (Forge)

  - Custom `mc-publish` field:
      ```toml
      # ...
      [mc-publish]
          modrinth="AANobbMI"
      ```

- `quilt.mod.json` (Quilt)

  - Custom `mc-publish` field:
      ```json
      {
        // ...
        "mc-publish": {
          "modrinth": "AANobbMI"
        }
      }
      ```

#### modrinth-token

Your Modrinth API token. It's required if you want to publish your assets to Modrinth.

```yaml
modrinth-token: ${{ secrets.MODRINTH_TOKEN }}
```

#### modrinth-featured

Set to `true` to feature the version on Modrinth; `false` otherwise. Default value is:

```yaml
modrinth-featured: true
```

#### modrinth-unfeature-mode

Sets the behavior for unfeaturing older Modrinth versions. Default value is `subset`, if [`modrinth-featured`](#modrinth-featured) is set to `true`; otherwise, `none`.

```yaml
modrinth-unfeature-mode: version-intersection | loader-subset
```

Available presets:

 - `none` - no Modrinth versions will be unfeatured.
 - `subset` - only those Modrinth versions which are considered a subset of the new one *(i.e., new release supports all of the version's mod loaders **and** game versions)* will be unfeatured.
 - `intersection` - only those Modrinth versions which intersects with the new one *(i.e., support at least one of the mod loaders and one of the game versions supported by the new release)* will be unfeatured.
 - `any` - all Modrinth versions will be unfeatured.

 If none of the given presets suits your needs, you can construct a new one from the following values via bitwise `OR`, like so - `game-version-intersection | loaders-subset`:

 - `game-version-subset`
 - `game-version-intersection`
 - `game-version-any`
 - `version-subset`
 - `version-intersection`
 - `version-any`
 - `loader-subset`
 - `loader-intersection`
 - `loader-any`

#### curseforge-id

The unique identifier of your CurseForge project.

```yaml
curseforge-id: 394468
```

Can be automatically retrieved from the metadata file of your project:

- `fabric.mod.json` (Fabric)

  - Custom `mc-publish` field:
      ```json
      {
        // ...
        "custom": {
          "mc-publish": {
            "curseforge": 394468
          }
        }
      }
      ```

- `mods.toml` (Forge)

  - Custom `mc-publish` field:
      ```toml
      # ...
      [mc-publish]
          curseforge=394468
      ```

- `quilt.mod.json` (Quilt)

  - Custom `mc-publish` field:
      ```json
      {
        // ...
        "mc-publish": {
          "curseforge": 394468
        }
      }
      ```

#### curseforge-token

Your CurseForge API token. It's required if you want to publish your assets to CurseForge.

```yaml
curseforge-token: ${{ secrets.CURSEFORGE_TOKEN }}
```

#### github-tag

The tag name for the release where assets will be uploaded. If a release triggered the action, its tag is used. Otherwise, inferred from `GITHUB_REF`.

```yaml
github-tag: mc1.17.1-0.3.2
```

#### github-generate-changelog

Set to `true` to generate a changelog automatically for this release; `false` otherwise. Ignored if the GitHub Release already exists. Default value is `true`, if `changelog` and `changelog-file` are not provided; otherwise, `false`.

```yaml
github-generate-changelog: false
```

#### github-draft

Set to `true` to create a draft release; `false` otherwise. Ignored if the GitHub Release already exists. Default value is `false`.

```yaml
github-draft: false
```

#### github-prerelease

Set to `true` to mark the release as a prerelease; `false` otherwise. Ignored if the GitHub Release already exists. Default value is `false`, if [`version-type`](version-type) is `release`; otherwise, `true`.

```yaml
github-prerelease: true
```

#### github-commitish

Defines the commitish value that determines where the Git tag is created from. Can be any branch or commit SHA. Ignored if the Git tag already exists. Default value is the repository's default branch.

```yaml
github-commitish: 347040cd637363613e56a6b333f09eaa5be3a196
```

#### github-discussion

If specified, creates and links a discussion of the specified **EXISTING** category to the release. Ignored if the GitHub Release already exists.

```yaml
github-discussion: Announcements
```

#### github-token

Your GitHub API token. It's required if you want to publish your assets to GitHub.

```yaml
github-token: ${{ secrets.GITHUB_TOKEN }}
```

#### files

An array of [globs](https://www.digitalocean.com/community/tools/glob) determining which files to upload. Default value is:

```yaml
files: |
  build/libs/!(*-@(dev|sources|javadoc)).jar
  build/libs/*-@(dev|sources|javadocs).jar
```

#### name

The name of the version. Defaults to a title of the release that triggered the action. If you want Modrinth and CurseForge to determine the version name themselves, omit the field with an empty string (`""`).

```yaml
name: Sodium 0.3.2 for Minecraft 1.17.1
```

#### version

The version number. Defaults to a tag of the release that triggered the action.

```yaml
version: mc1.17.1-0.3.2
```

#### version-type

The version type - alpha, beta, or release. By default, it will be parsed from the [`version`](#version) value. If no value is provided, it will be parsed from the [`version`](#version) value (e.g., `0.40.0+1.17-alpha` results in `alpha`).

```yaml
version-type: release
```

#### changelog

The changelog for this version. Defaults to a body of the release that triggered the action.

```yaml
changelog: This release fixes a few more issues in Sodium 0.3 for Minecraft 1.17.1.
```

#### changelog-file

A [glob](https://www.digitalocean.com/community/tools/glob) pointing to the changelog file.

```yaml
changelog-file: CHANGELOG.*
```

#### loaders

An array of supported mod loaders. By default, it will be automatically determined from your project's metadata file (e.g., `fabric.mod.json`, `mods.toml`, `quilt.mod.json`, etc.).

Fabric mods can be marked as Quilt-compatible like so:

- `fabric.mod.json`
  ```json
  {
    // ...
    "custom": {
      "mc-publish": {
        "loaders": ["fabric", "quilt"]
      }
    }
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

An array of supported Minecraft versions. By default, `mc-publish` will look for `minecraft` dependency in your project's metadata file (e.g., `fabric.mod.json`, `mods.toml`, `quilt.mod.json`, etc.).

```yaml
game-versions: |
  [1.16,1.16.5)
  >=21w37a <1.18.2
  1.19
```

#### game-version-filter

Controls the method used to filter game versions. Default value is:

```yaml
game-version-filter: releases | min-major | min-minor
```

Available filters (note that they can be combined to achieve the desired outcome):

 - `none` - no filter is applied.
 - `releases` - only include release versions.
 - `betas` - only include beta versions of the game.
 - `alphas` - only include alpha versions of the game.
 - `snapshots` - include both alpha and beta versions.
 - `any` - include any version types (release, beta, or alpha).
 - `min-patch` - include versions with the minimum patch number.
 - `max-patch` - include versions with the maximum patch number.
 - `min-minor` - include versions with the minimum minor number.
 - `max-minor` - include versions with the maximum minor number.
 - `min-major` - include versions with the minimum major number.
 - `max-major` - include versions with the maximum major number.
 - `min` - include the earliest versions in a range, considering major, minor, and patch values.
 - `max` - include the lates versions in a range, considering major, minor, and patch values.

Example of work of each individual filter for `>=1.17 <=1.18` version range:

 - `none` - `[1.17, 1.17.1-pre1, 1.17.1-pre2, 1.17.1-pre3, 1.17.1-rc1, 1.17.1-rc2, 1.17.1, 21w37a, 21w38a, 21w39a, 21w40a, 21w41a, 21w42a, 21w43a, 21w44a, 1.18-pre1, 1.18-pre2, 1.18-pre3, 1.18-pre4, 1.18-pre5, 1.18-pre6, 1.18-pre7, 1.18-pre8, 1.18-rc1, 1.18-rc2, 1.18-rc3, 1.18-rc4, 1.18]`
 - `releases` - `[1.17, 1.17.1, 1.18]`
 - `betas` - `[1.17.1-pre1, 1.17.1-pre2, 1.17.1-pre3, 1.17.1-rc1, 1.17.1-rc2, 1.18-pre1, 1.18-pre2, 1.18-pre3, 1.18-pre4, 1.18-pre5, 1.18-pre6, 1.18-pre7, 1.18-pre8, 1.18-rc1, 1.18-rc2, 1.18-rc3, 1.18-rc4]`
 - `alphas` - `[21w37a, 21w38a, 21w39a, 21w40a, 21w41a, 21w42a, 21w43a, 21w44a]`
 - `snapshots` - `[1.17.1-pre1, 1.17.1-pre2, 1.17.1-pre3, 1.17.1-rc1, 1.17.1-rc2, 21w37a, 21w38a, 21w39a, 21w40a, 21w41a, 21w42a, 21w43a, 21w44a, 1.18-pre1, 1.18-pre2, 1.18-pre3, 1.18-pre4, 1.18-pre5, 1.18-pre6, 1.18-pre7, 1.18-pre8, 1.18-rc1, 1.18-rc2, 1.18-rc3, 1.18-rc4]`
 - `any` - `[1.17, 1.17.1-pre1, 1.17.1-pre2, 1.17.1-pre3, 1.17.1-rc1, 1.17.1-rc2, 1.17.1, 21w37a, 21w38a, 21w39a, 21w40a, 21w41a, 21w42a, 21w43a, 21w44a, 1.18-pre1, 1.18-pre2, 1.18-pre3, 1.18-pre4, 1.18-pre5, 1.18-pre6, 1.18-pre7, 1.18-pre8, 1.18-rc1, 1.18-rc2, 1.18-rc3, 1.18-rc4, 1.18]`
 - `min-patch` - `[1.17, 21w37a, 21w38a, 21w39a, 21w40a, 21w41a, 21w42a, 21w43a, 21w44a, 1.18-pre1, 1.18-pre2, 1.18-pre3, 1.18-pre4, 1.18-pre5, 1.18-pre6, 1.18-pre7, 1.18-pre8, 1.18-rc1, 1.18-rc2, 1.18-rc3, 1.18-rc4, 1.18]`
 - `max-patch` - `[1.17.1-pre1, 1.17.1-pre2, 1.17.1-pre3, 1.17.1-rc1, 1.17.1-rc2, 1.17.1]`
 - `min-minor` - `[1.17, 1.17.1-pre1, 1.17.1-pre2, 1.17.1-pre3, 1.17.1-rc1, 1.17.1-rc2, 1.17.1]`
 - `max-minor` - `[21w37a, 21w38a, 21w39a, 21w40a, 21w41a, 21w42a, 21w43a, 21w44a, 1.18-pre1, 1.18-pre2, 1.18-pre3, 1.18-pre4, 1.18-pre5, 1.18-pre6, 1.18-pre7, 1.18-pre8, 1.18-rc1, 1.18-rc2, 1.18-rc3, 1.18-rc4, 1.18]`
 - `min-major` - the same one as for `none`. I don't think we will ever see Minecraft 2.0 *(except that one April Fool's snapshot)*.
 - `max-major` - the same one as for `none`. I don't think we will ever see Minecraft 2.0 *(except that one April Fool's snapshot)*.
 - `min` - `[1.17]`
 - `max` - `[21w37a, 21w38a, 21w39a, 21w40a, 21w41a, 21w42a, 21w43a, 21w44a, 1.18-pre1, 1.18-pre2, 1.18-pre3, 1.18-pre4, 1.18-pre5, 1.18-pre6, 1.18-pre7, 1.18-pre8, 1.18-rc1, 1.18-rc2, 1.18-rc3, 1.18-rc4, 1.18]`

#### dependencies

An array of dependencies required by your project. By default, `mc-publish` will take them from your project's metadata file.

```yaml
dependencies: |
  required-dependency(required)
  optional-dependency@0.1.0(optional)
  recommended-dependency@0.2.0(recommended)
  embedded-dependency@0.3.0(embedded)
  conflicting-dependency(conflicting)
  incompatible-dependency(incompatible)
  fabric@0.81.1+1.19.4(required){modrinth:P7dR8mSH}{curseforge:306612}#(ignore:github)
```

The format for dependencies can be described as follows: `id@version(type){platform:alias}#(ignore:ignored-platform)`. Each component of this format, with the exception of the `id`, is optional.

Available dependency types:

 - `required` - for dependencies required to run. Without them a game will crash.
 - `recommended` - for dependencies not required to run. Without them a game will log a warning.
 - `optional` - for dependencies not required to run. Can be used as a kind of metadata.
 - `embedded` - for dependencies embedded into the mod. Can be used as a kind of metadata.
 - `conflicting` - for mods whose together with yours cause some kind of bugs, etc. With them a game will log a warning.
 - `incompatible` - for mods whose together with yours might cause a game crash. With them a game will crash.

Can be automatically retrieved from your project's metadata file:

- `fabric.mod.json` (Fabric)
  ```json
  "depends": {
    "required-dependency": "*"
  },
  "recommends": {
    "recommended-dependency": "0.1.0"
  },
  "suggests": {
    "optional-dependency": "0.2.0"
  },
  "conflicts": {
    "conflicting-dependency": "*"
  },
  "breaks": {
    "incompatible-dependency": "*"
  },
  "custom": {
    "mc-publish": {
      // This dependency declaration will be merged with everything written above.
      // It's useful if you want to provide information about dependency types not supported by Fabric.
      // Or if you want to attach platform-specific aliases to one of the dependencies above.
      "dependencies": [
        "embedded-dependency@0.3.0(embedded)#(ignore:curseforge)",
        "recommended-dependency@0.1.0(recommended){modrinth:recommended-dependency-fabric}"
      ]
    }
  }
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
    modId="embedded-dependency"
    mandatory=false
    embedded=true
    versionRange="0.3.0"
    ordering="NONE"
    side="BOTH"
    [dependencies.mod-id.mc-publish]
        ignore=false # `mc-publish` will ignore this dependency, if `ignore` is set to true
        modrinth="embedded-dependency-forge" # Modrinth's project slug
        curseforge="embedded-dependency-forge" # CurseForge's project slug

  [[dependencies.mod-id]]
    modId="incompatible-dependency"
    mandatory=false
    incompatible=true
    versionRange="*"
    ordering="NONE"
    side="BOTH"

  [mc-publish]
    # This dependency declaration will be merged with everything written above.
    # It's useful if you want to provide information about dependency types not supported by Forge.
    # Or if you want to attach platform-specific aliases to one of the dependencies above.
    dependencies=[
      "recommended-mod@0.2.0(recommended){modrinth:recommended-dependency-forge}",
      "conflicting-mod@<0.40.0(conflicting)#(ignore:curseforge)",
    ]
  ```

- `quilt.mod.json` (Quilt)
  ```json
  // ./quilt_loader
  "depends": [
    "required-dependency",
    {
      "id": "optional-dependency",
      "versions": "0.1.0",
      "optional": true
    }
  ],
  "provides": [
    {
      "id": "embedded-dependency",
      "version": "0.3.0",
      "mc-publish": {
        "ignore": false, // `mc-publish` will ignore this dependency, if `ignore` is set to true
        "modrinth": "embedded-dependency-quilt", // Modrinth's project slug
        "curseforge": "embedded-dependency-quilt" // CurseForge's project slug
      }
    }
  ],
  "breaks": [
    {
      "id": "incompatible-dependency",
      "versions": "*"
    },
    {
      "id": "conflicting-dependency",
      "versions": "*",
      "unless": "some-mod-that-fixes-conflict"
    }
  ],

  // ...
  // Back to top-level ./
  "mc-publish": {
    // This dependency declaration will be merged with everything written above.
    // It's useful if you want to provide information about dependency types not supported by Quilt.
    // Or if you want to attach platform-specific aliases to one of the dependencies above.
    "dependencies": [
      "embedded-dependency@0.3.0(embedded)#(ignore:curseforge)",
      "recommended-dependency@0.1.0(recommended){modrinth:recommended-dependency-quilt}"
    ]
  }
  ```

#### java

An array of Java versions compatible with your project.

```yaml
java: |
  Java 1.8
  16
  Java 17
```

#### retry-attempts

Defines the maximum number of asset publishing attempts. Default value is:

```yaml
retry-attempts: 2
```

#### retry-delay

Specifies the delay (in milliseconds) between asset publishing attempts. Default values is:

```yaml
retry-delay: 10000
```

#### fail-mode

Controls how the action responds to errors during the mod publishing process. Default value is:

```yaml
fail-mode: fail
```

Available values:

 - `fail` - immediately sets the action status to **failed** and terminates its execution.
 - `warn` - warns about errors. The action won't be terminated, nor its status will be set to **failed**.
 - `skip` - warns about errors. The action won't be terminated, but its status will be set to **failed** after all specified targets have been processed.

### 📤 Outputs

| Name                                      | Description                                                                                            | Examples                                                                    |
|-------------------------------------------|--------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------|
| [modrinth-id](#modrinth-id-1)             | The unique identifier of your Modrinth project.                                                        | `"AANobbMI"`                                                                |
| [modrinth-version](#modrinth-version)     | The unique identifier of the version published on Modrinth by this action.                             | `"Fz37KqRh"`                                                                |
| [modrinth-url](#modrinth-url)             | The URL directing to the newly published version on Modrinth.                                          | `"https://modrinth.com/mod/sodium/version/mc1.17.1-0.3.4"`                  |
| [modrinth-files](#modrinth-files)         | Array of objects, each containing details about the files published for the new version on Modrinth.   | `"[]"`                                                                      |
| [curseforge-id](#curseforge-id-1)         | The unique identifier of your CurseForge project.                                                      | `"394468"`                                                                  |
| [curseforge-version](#curseforge-version) | The unique identifier of the version published on CurseForge by this action.                           | `"3488820"`                                                                 |
| [curseforge-url](#curseforge-url)         | The URL directing to the newly published version on CurseForge.                                        | `https://www.curseforge.com/api/v1/mods/394468/files/3488820/download`      |
| [curseforge-files](#curseforge-files)     | Array of objects, each containing details about the files published for the new version on CurseForge. | `"[]"`                                                                      |
| [github-repo](#github-repo)               | The full repository name on GitHub, formatted as 'username/repository'.                                | `"CaffeineMC/sodium-fabric"`                                                |
| [github-tag](#github-tag-1)               | The Git tag associated with the new or updated release published on GitHub.                            | `"mc1.17.1-0.3.4"`                                                          |
| [github-url](#github-url)                 | The URL directing to the newly published version on GitHub.                                            | `"https://github.com/CaffeineMC/sodium-fabric/releases/tag/mc1.17.1-0.3.4"` |
| [github-files](#github-files)             | Array of objects, each containing details about the files published for the new version on GitHub.     | `"[]"`                                                                      |

#### modrinth-id

The unique identifier of your Modrinth project.

```json
"AANobbMI"
```

#### modrinth-version

The unique identifier of the version published on Modrinth by this action.

```json
"Fz37KqRh"
```

#### modrinth-url

The URL directing to the newly published version on Modrinth.

```json
"https://modrinth.com/mod/sodium/version/mc1.17.1-0.3.4"
```

#### modrinth-files

Array of objects, each containing details about the files published for the new version on Modrinth.

```json5
"[
  {
    \"name\": \"sodium-fabric-mc1.17.1-0.3.4+build.13.jar\",
    \"id\": \"85f5d67f0ce9e995e738eb6b60034bc919a1859d\",
    \"url\": \"https://cdn.modrinth.com/data/AANobbMI/versions/mc1.17.1-0.3.4/sodium-fabric-mc1.17.1-0.3.4%2Bbuild.13.jar\"
  }
]"
```

#### curseforge-id

The unique identifier of your CurseForge project.

```json
"394468"
```

#### curseforge-version

The unique identifier of the version published on CurseForge by this action.

```json
"3488820"
```

#### curseforge-url

The URL directing to the newly published version on CurseForge.

```json
"https://www.curseforge.com/minecraft/mc-mods/sodium/files/3488820"
```

#### curseforge-files

Array of objects, each containing details about the files published for the new version on CurseForge.

```json5
"[
  {
    \"name\": \"sodium-fabric-mc1.17.1-0.3.4+build.13.jar\",
    \"id\": 394468,
    \"url\": \"https://www.curseforge.com/api/v1/mods/394468/files/3488820/download\"
  }
]"
```

#### github-repo

The full repository name on GitHub, formatted as 'username/repository'.

```json
"CaffeineMC/sodium-fabric"
```

#### github-tag

The Git tag associated with the new or updated release published on GitHub.

```json
"mc1.17.1-0.3.4"
```

#### github-url

The URL directing to the newly published version on GitHub.

```json
"https://github.com/CaffeineMC/sodium-fabric/releases/tag/mc1.17.1-0.3.4"
```

#### github-files

Array of objects, each containing details about the files published for the new version on GitHub.

```json5
"[
  {
    \"name\": \"sodium-fabric-mc1.17.1-0.3.4+build.13.jar\",
    \"id\": 53929869,
    \"url\": \"https://github.com/CaffeineMC/sodium-fabric/releases/download/mc1.17.1-0.3.4/sodium-fabric-mc1.17.1-0.3.4%2Bbuild.13.jar\"
  }
]"
```
