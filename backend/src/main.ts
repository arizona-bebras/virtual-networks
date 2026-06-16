import "@nestjs/platform-express";
import { ClsMiddleware, ClsServiceManager } from "nestjs-cls";
import { ReflectionService } from "@grpc/reflection";
import { NestFactory } from "@nestjs/core";
import { type MicroserviceOptions, Transport } from "@nestjs/microservices";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module.js";
import { auth } from "./auth.js"

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
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

  app.use(new ClsMiddleware(undefined).use);

  app.use(async (req, _res, next) => {
    try {
          const session = await auth.api.getSession({
            headers: req.headers,
          });

          console.log(session)
          if (session?.user?.id) {
            req.session = { user: { id: session.user.id } };
    
            const cls = ClsServiceManager.getClsService();
            if (cls) {
              cls.set("userId", session.user.id);
            }
          }
        } catch (error) {
          console.error("Better-Auth session verification failed:", error);
        }
    
        next();
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
