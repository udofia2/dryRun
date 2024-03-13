import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { PORT } from "./constants";
import { ErrorService } from "./error/error.service";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ credentials: true });
  app.setGlobalPrefix("api");
  app.useGlobalFilters(new ErrorService());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.listen(PORT);
  console.log(`Application is running on: ${await app.getUrl()}/api`);
}
bootstrap();
