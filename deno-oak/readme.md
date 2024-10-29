## How to run

### Setup

The hosts file needs these inputs:

```
127.0.0.1 attacker.local
127.0.0.1 defender.local
```

Requirements:

- deno 2.0.0

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
