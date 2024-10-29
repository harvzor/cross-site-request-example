import {Application, Router} from "@oak/oak";

const router = new Router();

router.get("/", (context) => {
  context.response.body = Deno.readTextFileSync("./index.html");
});

const app = new Application();
const port = 443;
const hostname = 'attacker.local';

app.use(router.routes());
app.use(router.allowedMethods());
console.log(`Server running on https://${hostname}`);

app.listen({
  port: port,
  hostname: hostname,
  secure: true,
  cert: Deno.readTextFileSync("./certs/cert.pem"),
  key: Deno.readTextFileSync("./certs/key.pem"),
});
