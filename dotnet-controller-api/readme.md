## How to run

### Setup

The hosts file needs these inputs:

```
127.0.0.1 attacker.local
127.0.0.1 defender.local
```

Requirements:

- dotnet 9.0.100-rc.2.24474.11

### The attacker

```
dotnet run --project .\CrossSiteRequestExample.Attacker\
```

### The defender

```
dotnet run --project .\CrossSiteRequestExample.Defender\
```
