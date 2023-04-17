## Title

[example.org] DOM XSS via test parameter

## Severity

Medium

## Summary:

Hi team,

I hope you are well. I found that there is a DOM XSS on https://example.org. This allows attackers to execute arbitrary JS in the context of `example.org` and access all related cookies.

## Steps To Reproduce:

1. Visit <https://example.org/?test=alert(1)>

{F1811743}

Kind regards,

## Recommended solution

It is recommended review all input parameters that do not incorporate protection mechanisms

Properly encode data output. It mainly consists of applying HTML encoding to any output that reproduces data entered by the user to the input, so that it cannot be interpreted as code by the browser. This measure is very important for this type of attacks on the client side.

Filtering potentially dangerous meta-characters on vulnerable entries. For example, the characters `<`, `>`, `;`, `/` or `\` and all nonprinting characters should be properly filtered at the entry in the application.

## Impact

An attacker that can control the code executed in a victim browser can usually fully compromise this victim. This includes :

-   Perform any action within the application that the user can perform
-   Modify any information that the user is able to modify
-   Steal user cookies
-   Redirect to phishing site
-   Denial of service via cookie bomb

