import "@nestjs/platform-express";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // Better Auth will re-add the default body parsers for non-auth routes.
    bodyParser: false,
  });
  app.enableCors({
    origin: process.env.TRUSTED_ORIGINS?.split(",").map((o) => o.trim()) || [],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
  });
  const config = new DocumentBuilder()
    .setTitle("Virtual Networks API")
    .setDescription("API for managing virtual networks")
    .setVersion("1.0")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "JWT",
        description: "Введите токен",
        in: "header",
      },
      "JWT-auth",
    )
    .addSecurityRequirements("JWT-auth")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
