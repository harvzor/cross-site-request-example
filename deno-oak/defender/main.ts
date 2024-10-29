import { Application, Router } from "@oak/oak";
import { oakCors } from "@tajpouria/cors";

const router = new Router();

router.get("/", async (context) => {
  await context.cookies.set("secure-cookie", "secure-cookie-value", {
    // Only 'none' seems to work with synchronous POST
    // Also, the Fetch docs say:
    // > Note that if a cookie's SameSite attribute is set to Strict or Lax, then the cookie will not be sent cross-site, even if credentials is set to include.
    sameSite: 'none',
    secure: true,
    maxAge: 86400000,
    domain: `.${hostname}`, // Does not seem to matter.
    // https://stackoverflow.com/a/67001424 claims that this is important, but in my testing, it did not make a difference.
    httpOnly: false,
  });
  context.response.body = "Cookie set!";
});

router.get("/get", async (context) => {
  context.response.type = "application/json";
  context.response.body = {
    cookies: {
      'secure-cookie': await context.cookies.get('secure-cookie'),
    },
    requestQuery: {
      get_content: context.request.url.searchParams.get('get_content'),
    },
  }
});

router.post("/post", async (context) => {
  context.response.type = "application/json";
  context.response.body = {
    cookies: {
      'secure-cookie': await context.cookies.get('secure-cookie'),
    },
    requestBody: {
      post_content: (await context.request.body.form()).get('post_content'),
    },
  };
});

const app = new Application();
const port = 3000;
const hostname = 'defender.local';

app.use(
    oakCors({
      // Sets `Access-Control-Allow-Credentials: true` header
      credentials: true,
      // Otherwise error: Response body is not available to scripts (Reason: CORS No Allow Credentials)
      // Because * is not allowed to send cookies with requests cross origin.
      origin: 'https://attacker.local',
      allowedHeaders: 'Content-Type,custom-header'
    })
);
app.use(router.routes());
app.use(router.allowedMethods());
console.log(`Server running on https://${hostname}:${port}`);

app.listen({
  port: port,
  hostname: hostname,
  secure: true,
  cert: Deno.readTextFileSync("./certs/cert.pem"),
  key: Deno.readTextFileSync("./certs/key.pem"),
});
