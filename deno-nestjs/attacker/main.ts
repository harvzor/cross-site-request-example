import { NestFactory } from "@nestjs/core";
import { Controller, Get, Module } from "@nestjs/common";
import "@nestjs/platform-express";

const port = 443;
const hostname = "attacker.local";

@Controller()
class RootController {
  @Get("/")
  Get() {
    return Deno.readTextFileSync("./index.html");
  }
}

@Module({ controllers: [RootController] })
class AppModule {}
const app = await NestFactory.create(AppModule, {
  httpsOptions: {
    key: Deno.readTextFileSync("./certs/key.pem"),
    cert: Deno.readTextFileSync("./certs/cert.pem"),
  },
});

app.listen(port, hostname);
