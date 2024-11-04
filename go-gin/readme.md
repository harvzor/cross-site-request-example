## How to run

### Setup

The hosts file needs these inputs:

```
127.0.0.1 attacker.local
127.0.0.1 defender.local
```

Requirements:

- go 1.23.2

### The attacker

```
cd attacker
go run main.go
```

### The defender

```
cd defender
go run main.go
```
