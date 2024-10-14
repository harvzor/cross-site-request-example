## What is this?

This repo shows how simple and complex cross domain requests can be made to include the target domain's cookies.

There are two websites run from this repo:

- attacker.local
- defender.local:3000

attacker.local is making a cross domain scripting request to defender.local and is trying to include a cookie that is set on defender.local

Requirements for that are:

- the cookie on defender.local must be set with `SameSite: none` and `Secure` in order for simple requests to work

Simple AJAX request with cookies, but blocked by the browser:

- the requesting domain must specify `credentials: 'include'` (if using the Fetch API)

Note that simple AJAX requests will still be performed even if the responding domain doesn't have the headers set. However, because the simple request occurs without CORS preflight, the receiving server will still receive the request, but the user's browser will block the request after it has seen that the headers are missing.

Simple AJAX request with cookies, not blocked:

- the responding domain must respond the headers `Access-Control-Allow-Origin: https://attacker.local` and `Access-Control-Allow-Credentials: true`

Complex AJAX requests with cookies, but blocked with the browser:

- the requesting domain should force a complex request with a non-standard header, e.g. ` 'custom-header': 'value'`

Complex AJAX requests with cookies, not blocked:

- same as a simple AJAX request (not blocked)
- the responding domain must respond the header `Access-Control-Allow-Headers: custom-header`


## How to run

### Setup

The hosts file needs these inputs:

```
127.0.0.1 attacker.local
127.0.0.1 defender.local
```

Requirements:

- deno 2.0.0-rc.5

### The attacker

```
deno task --config .\attacker\deno.json dev
```

### The defender

```
deno task --config .\defender\deno.json dev
```

## Testing

There are integration tests which require the server to be running, so run first.

Then:

```
deno task --config .\defender\deno.json test
```
