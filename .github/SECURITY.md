# Security Notice

This is the security notice for the [mc-publish](https://github.com/Kir-Antipov/mc-publish) repository. The notice explains how and when vulnerabilities should be reported.

This notice is applicable to the latest release of the project. If you are using an outdated version, please upgrade to the latest release before reporting any issues.

## Reporting a Vulnerability

If you believe you have found a security vulnerability in this project, please send an email to [kp.antipov@gmail.com](mailto:kp.antipov@gmail.com) with a detailed description of the issue. We will review and respond to all security reports promptly.

We kindly request that you avoid publicly disclosing any security vulnerabilities until we have had an opportunity to address them. We are committed to addressing and resolving reported issues in a responsible and timely manner. Thus, please, **do not** open a GitHub issue for the found vulnerability.

We strive to maintain a secure codebase, and we appreciate the community's help in identifying and addressing security vulnerabilities. Security updates will be released as needed, and we encourage all users to update to the latest version regularly.

## Scope

The following vulnerabilities are considered **within the scope**:

 - Unauthorized disclosure of authentication tokens
 - Exploitation of authentication tokens by faulty dependencies
 - Insecure data storage
 - Arbitrary Code Execution (ACE) attacks

The following vulnerabilities are **outside the scope**:

 - Outdated dependencies
 - Denial of Service (DoS) attacks, including ReDoS, stemming from faulty user input
 - Security vulnerabilities in the development environment (unless they directly lead to vulnerabilities in the distributed project)

If you are uncertain whether the vulnerability you have found is within the scope or not, you can still reach out to us via email.
