import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { PORT } from "./constants";
import { AppValidationPipe } from "./provider/pipe";
import { ErrorService } from "./error/error.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new AppValidationPipe({ whitelist: true }));
  app.setGlobalPrefix("api");
  app.useGlobalFilters(new ErrorService());
  await app.listen(PORT);
  console.log(`Application is running on: ${await app.getUrl()}/api`);
}
bootstrap();
