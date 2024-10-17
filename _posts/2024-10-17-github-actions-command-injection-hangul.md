---
title: Command Injection In es-hangul Github Actions Workflow 
date: '2024-10-17 18:00:00 +1200'
categories:
  - blog
tags:
  - Appsec
  - Hacking
  - Vulnerabilities

---

# Command Injection In `es-hangul` Github Actions Workflow 

## Overview

GitHub Actions is a powerful tool for automating software workflows. However, improper configuration can lead to severe security vulnerabilities. In this blog post, I will go through a command injection vulnerability I recently discovered in the `es-hangul` GitHub workflow, specifically within the **broken-link-checker.yml** file. The vulnerability would have allowed attackers to execute arbitrary OS commands during the workflow process. 

This issue was reported to the repository maintainers along with a pull request to resolve the vulnerability.

## What is Command Injection?

Command injection is a critical security flaw that occurs when untrusted user input is executed as part of a system shell command. This vulnerability can allow attackers to run arbitrary commands, leading to a range of potential security risks, including data exfiltration, unauthorized access, or full system compromise.

## Vulnerable Workflow: `broken-link-checker.yml`

The vulnerability resided in the `broken-link-checker.yml` workflow file, which is responsible for checking broken links on scheduled runs and via manual dispatch. Below is the contents of the affected file at the time:


```yaml
name: Broken link checker

on:
  schedule:
    - cron: '0 5 * * 1-5'
  workflow_dispatch:
    inputs: 
      url: 
        description: 'URL to check'
        required: false
        default: 'https://es-hangul.slash.page'

jobs:
  broken-link-checker:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: corepack enable
      - uses: actions/setup-node@v4
        with:
          cache: 'yarn'
          cache-dependency-path: 'yarn.lock'
          node-version-file: '.nvmrc'
      - run: yarn install
      - run: yarn blc ${{ github.event.inputs.url }} --ro

```
| ![Dora](/images/doraVulnerability.png) |
|:--:|
| Can You See The Vulnerability? 👀 |

### The Problem

If you said

```yaml
run: yarn blc ${{ github.event.inputs.url }} --ro
```

then you are correct!

The script interpolates the user-supplied `url` directly into a shell command. If an attacker gains control over the value of `github.event.inputs.url`, such as by submitting a malicious pull request or triggering a manual workflow dispatch, they can inject arbitrary OS commands.

## Proof of Concept (PoC)

To demonstrate the issue, I created a custom event file (`vulntest.event`) to inject commands directly through the `url` input. Here’s the malicious event:

```json
{
  "action": "broken-link-checker",
  "inputs": {
    "url": "https://example.com; ls; whoami; echo 'Command Injection Successful'"
  }
}
```

In this example, the `url` input includes the following commands:

- `ls`: Lists the files in the current directory.
- `whoami`: Prints the username of the running process.
- `echo 'Command Injection Successful'`: Confirms the successful execution of the command.

### Exploiting the Vulnerability

Using [act](https://github.com/nektos/act), a tool that allows you to run GitHub Actions locally, I was able to simulate the workflow and inject the malicious commands:

```bash
act --job broken-link-checker --eventpath .github/workflows/vulntest.event
```

This resulted in the following output, confirming that the injected commands were successfully executed:

| ![Command Injection Proof](/images/workflowInjection.png) |
|:--:|
| The Injected Commands Executed Succesfully |

### Root Cause

The core issue stems from the way user input (`github.event.inputs.url`) is directly passed into the shell command without validation or sanitisation. When the `run` step is executed, the untrusted input is evaluated as part of the shell command, allowing arbitrary commands to be executed.

## Mitigation Strategies

To fix this vulnerability, it is critical to follow secure coding practices, especially when dealing with user-supplied inputs in workflows. Here are some recommended mitigations:

### 1. Avoid Direct Command Interpolation

Instead of directly interpolating user inputs into a shell command, assign the input to an environment variable, which provides some level of protection against injection attacks:

```yaml
 env:
    url: ${{ github.event.inputs.url || 'https://es-hangul.slash.page' }}
 run: yarn blc $url --ro
```

### 2. Sanitize User Input

Validate and sanitise all inputs before passing them into shell commands. For example, ensure that the `url` input is a valid URL and doesn't contain any characters that could allow command injection.

### 3. Use GitHub Actions Best Practices

GitHub provides comprehensive [security hardening guidelines](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions) for workflows. Adopting these practices, such as restricting permissions, controlling access, and using safe command execution patterns, can significantly reduce the risk of vulnerabilities.

## Conclusion

This case study demonstrates how improper handling of user input in GitHub Actions workflows can lead to serious security vulnerabilities like command injection. By following secure coding practices and GitHub's security guidelines, developers can mitigate these risks and ensure the safety of their workflows.

**References:**

- [GitHub Actions: Security Hardening for GitHub Actions](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
- [How to Run GitHub Actions Locally with Act](https://www.freecodecamp.org/news/how-to-run-github-actions-locally/)