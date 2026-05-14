import "@nestjs/platform-express";
import { ReflectionService } from "@grpc/reflection";
import { NestFactory } from "@nestjs/core";
import { type MicroserviceOptions, Transport } from "@nestjs/microservices";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // Better Auth will re-add the default body parsers for non-auth routes.
    bodyParser: false,
  });
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: "controlplane",
      protoPath: "../proto/src/controlplane.proto",
      url: process.env.GRPC_URL ?? "0.0.0.0:50051",
      onLoadPackageDefinition: (pkg, server) => {
        new ReflectionService(pkg).addToServer(server);
      },
    },
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
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);
  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
