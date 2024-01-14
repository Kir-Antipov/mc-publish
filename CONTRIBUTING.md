# Contributing to mc-publish

Thank you for considering contributing to mc-publish! We value and appreciate any contributions from the community.

Simply filing issues for problems you encounter is already a great way to contribute. Further contributions in the form of implementing solutions or fixes via PRs are even more greatly appreciated.

## Reporting Issues

We always welcome bug reports, enhancement proposals, and overall feedback. Here are some tips to make your issue reporting as effective as possible.

### Finding Existing Issues

Before filing a new issue, please search our [open issues](https://github.com/Kir-Antipov/mc-publish/issues) to see if it already exists.

If you come across an existing issue, please provide your own feedback in the discussion. Consider upvoting *(👍 reaction)* the original post, so we can quickly identify which problems and proposals are most urgent to address.

### Writing a Good Proposal

Firstly, think through all the pros and cons of your idea and whether it's viable for the project. Ideally, a proposal should align with the following criteria:

 - The proposed changes should not stray from the project's original goal - automated publishing of prepared Minecraft-related assets to different platforms. While it might seem enticing to enable mc-publish to automatically build your mod or plugin for you, or to have it send a message in a Discord chat announcing that your project has been updated, such functionalities are best handled by other tools.
 - New input suggestions are generally discouraged. Like the previous point, this one aims to maintain the project's complexity at a balanced level, so users don't require immense understanding to navigate a GitHub Action stuffed with countless options. However, this is not a hard and fast rule and should be evaluated on a per-scenario basis.
 - The proposed changes shouldn't alter the current behavior of the action. Thousands of different projects rely on mc-publish, and we don't want to accidentally break anything they heavily depend on. Nevertheless, some breaking changes may actually enhance the project, so if you believe your suggestion falls under this category, don't hesitate to suggest it. We can then discuss how to transition our users to the new behavior as smoothly and painlessly as possible.

When you are ready to submit a proposal, please use the [Enhancement issue template](https://github.com/Kir-Antipov/mc-publish/issues/new?template=02_enhancement.yml) if you are suggesting an enhancement to pre-existing features, or the [Feature Request issue template](https://github.com/Kir-Antipov/mc-publish/issues/new?template=03_feature_request.yml) if you are proposing a new one.

### Writing a Good Bug Report

Good bug reports make it easier for maintainers to quickly verify and find the root cause of the problem. The higher the quality of a bug report, the sooner the problem will be resolved. Ideally, a bug report should contain the following information:

 - A detailed high-level description of the problem.
 - A *minimal reproduction*, i.e., the smallest configuration needed to reproduce the incorrect behavior.
 - A description of the *expected behavior*, contrasted with the *actual behavior* observed.
 - Information about the environment: mc-publish version, the operating system on which it was run, etc.
 - Any additional information, e.g., is the issue a regression from previous versions? Are there any known workarounds? Etc.

When you are ready to submit a bug report, please use the [Bug Report issue template](https://github.com/Kir-Antipov/mc-publish/issues/new?template=01_bug_report.yml).

## Contributing Changes

The maintainers will merge changes that significantly improve the project.

### DOs and DON'Ts

Please do:

 - **DO** follow our coding style. While there's no style guide *(at least one that we are aware of)* that we can reference, ensure you adhere to ESLint rules by periodically running `npm run test:lint`.
 - **DO** give priority to the current style of the file you are changing, even if it diverges from the general style.
 - **DO** add JSDoc to newly created functions and classes.
 - **DO** include tests when adding new features. When fixing bugs, start by adding a test that highlights how the current behavior is flawed.
 - **DO** keep the discussions focused. When a new or related topic arises, it's often better to create a new issue than to sidetrack the discussion.
 - **DO** clearly state in an issue if you intend to take on implementing it.

Please do not:

 - **DO NOT** make PRs for style changes.
 - **DO NOT** add new features without submitting an issue and discussing it with us first.
 - **DO NOT** surprise us with large pull requests. Instead, file an issue and engage in a discussion, so we can agree on a direction before you invest a substantial amount of time.
 - **DO NOT** commit code you didn't write. If you find code that could be a good fit for the project, submit an issue and start a discussion before proceeding.
 - **DO NOT** commit code written entirely by LLMs. Such code is prone to errors and vulnerabilities, often exhibiting poor quality due to the models' lack of awareness regarding all the nuances of a project of this scale.

### Suggested Workflow

We recommend the following workflow:

1. Create an issue for your task.
    - You can skip this step for trivial changes.
    - Reuse an existing issue on the subject if one exists.
    - Obtain an agreement from the maintainers that your proposed change is a good one.
    - Clearly state your intent to implement it if that's the case. You can also ask for the issue to be assigned to you. Note: The issue filer and the implementer do not have to be the same person.
2. Create a personal fork of the repository on GitHub *(if you haven't already created one)*.
3. Within your fork, create a branch off of `dev` (`git checkout -b fix/42 dev`).
    - Name the branch in a way that clearly communicates your intentions, such as `fix/42` or `feature/project-environment`.
    - Branches are useful as they isolate your changes from incoming updates from upstream. Additionally, they allow you to create multiple PRs from the same fork.
4. Install the same [Node.js](https://nodejs.org/en/about/previous-releases) version that the project runs on, and fetch all the dependencies *(if you haven't already done so)*.
    - You can find the required Node.js version at the very bottom of the `action.yml` file in the `using` field.
    - To install dependencies, simply run `npm ci` in the project's root.
5. Make and commit your changes to your branch.
    - Please adhere to our [Commit Messages](#commit-messages) guidelines.
6. Add new tests corresponding to your change, if applicable.
7. Build the repository with your changes.
    - Run `npm run build` and ensure the build process is successful.
    - Run `npm run test` and verify that all tests, including your new ones, pass.
8. Create a pull request (PR) against the `Kir-Antipov/mc-publish` repository's `dev` branch.
    - Clearly state in the description what issue or improvement your change addresses.
    - Ensure all Continuous Integration checks are passing.
9. Await feedback or approval of your changes from the maintainers.
10. Once maintainers have signed off and all checks are green, your PR will be merged.
    - The next official build will automatically include your changes.
    - You can then delete the branch you used for making the said changes.

### Commit Messages

Please format your commit messages as follows *(based on [A Note About Git Commit Messages](http://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html))*:

```
Summarize the change in 50 characters or less

Provide more detail after the first line. Leave one blank line below the
summary and wrap all lines at 72 characters or less.

If the change fixes an issue, leave another blank line after the final
paragraph and indicate which issue is fixed in the specific format
below.

Fixes #42
```

Also do try your best to appropriately structure the commits. Avoid making them too large with unrelated things in the same commit, and try not to make them too small with the same minor change applied numerous times in different commits.
