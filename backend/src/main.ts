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
    origin: ["http://localhost:5173"],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
  });
  const config = new DocumentBuilder()
    .setTitle("Virtual Networks API")
    .setDescription("API for managing virtual networks")
    .setVersion("1.0")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
