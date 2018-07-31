## matchmaker-ts

![matchmaker-ts](./docs/img/matchmaker-ts.png)

matchmaker-ts is a tool for designing and analyzing multiplayer matchmaking.  


### Build & Run

```bash
yarn
yarn start
```

### Documentation

[./docs/typedoc/index.html](./docs/typedoc/index.html)

### Getting Started


### Overview and Architecture

matchmaker-ts is a real time multiplayer server written in TypeScript with an Electron/React front-end.  

![matchmaker-ts-architecture](./docs/img/matchmaker-ts-architecture.png)

#### Director
The Director coordinates the subsystem.
- Instantiates the ConnectionManager
- Manages the lifecycle of Lobbies
