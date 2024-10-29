## How to run

### Setup

The hosts file needs these inputs:

```
127.0.0.1 attacker.local
127.0.0.1 defender.local
```

Requirements:

- Node v18.20.2

### The attacker

```
npm install http-server -g
http-server -p 443 -a attacker.local --ssl
```

### The defender

```
node index.mjs
```
