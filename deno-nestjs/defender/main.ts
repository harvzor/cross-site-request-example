import { NestFactory } from "@nestjs/core";
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Module,
  Post,
  Query,
  Req,
  Res,
} from "@nestjs/common";
import "@nestjs/platform-express";
import cookieParser from "cookie-parser";

const port = 3000;
const hostname = "defender.local";

@Controller()
class RootController {
  @Get("/")
  Get(@Res({ passthrough: true }) response: Response) {
    response.cookie("secure-cookie", "secure-cookie-value", {
      // Only 'none' seems to work with synchronous POST
      // Also, the Fetch docs say:
      // > Note that if a cookie's SameSite attribute is set to Strict or Lax, then the cookie will not be sent cross-site, even if credentials is set to include.
      sameSite: "none",
      secure: true,
      maxAge: 86400000,
      domain: `.${hostname}`, // Does not seem to matter.
      // https://stackoverflow.com/a/67001424 claims that this is important, but in my testing, it did not make a difference.
      httpOnly: false,
    });

    return "Cookie set!";
  }
}

@Controller()
class GetController {
  @Get("/get")
  Get(@Req() request: Request, @Query("get_content") get_content: string) {
    return {
      cookies: {
        "secure-cookie": request.cookies["secure-cookie"],
      },
      requestQuery: {
        get_content: get_content,
      },
    };
  }
}

@Controller()
class PostController {
  @Post("/post")
  @HttpCode(200)
  Get(@Req() request: Request, @Body("post_content") post_content: string) {
    return {
      cookies: {
        "secure-cookie": request.cookies["secure-cookie"],
      },
      requestBody: {
        post_content: post_content,
      },
    };
  }
}

@Module({ controllers: [RootController, GetController, PostController] })
class AppModule {}
const app = await NestFactory.create(AppModule, {
  httpsOptions: {
    key: Deno.readTextFileSync("./certs/key.pem"),
    cert: Deno.readTextFileSync("./certs/cert.pem"),
  },
});

app.enableCors({
  credentials: true,
  origin: "https://attacker.local",
  allowedHeaders: "Content-Type,custom-header",
});

app.use(cookieParser());

app.listen(port, hostname);
