import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { NODE_ENV, PORT } from "./constants";
import { ErrorService } from "./error/error.service";
import { AppValidationPipe } from "./provider/pipe";
import { SwaggerModule } from "@nestjs/swagger";
import { configs, options } from "./common/helpers";
import { LoggerMiddleware } from "./common/middlewares/logger.middleware";
import { Logger } from "@nestjs/common";
import { ResponseFormatInterceptor } from "./common/interceptors";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ credentials: true });

  const globalPrefix = "api";
  app.setGlobalPrefix(globalPrefix);
  app.useGlobalFilters(new ErrorService());
  app.useGlobalInterceptors(new ResponseFormatInterceptor());

  app.useGlobalPipes(new AppValidationPipe());

  app.use(new LoggerMiddleware().use);

  // SWAGGER SETUP
  const document = SwaggerModule.createDocument(app, configs, options);
  SwaggerModule.setup(`${globalPrefix}/docs`, app, document, {
    explorer: true,
    customSiteTitle: "Event API Documentation"
  });

  await app.listen(PORT);
  Logger.log(`🚀 Application is using ${NODE_ENV} environment`);
  Logger.log(
    `🚀 Application is running on: ${await app.getUrl()}/${globalPrefix}`
  );
  Logger.log(
    `🚀 Swagger doc. is running on: ${await app.getUrl()}/${globalPrefix}/docs`
  );
}
bootstrap();
