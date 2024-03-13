import {
  ArgumentMetadata,
  BadRequestException,
  Injectable
} from "@nestjs/common";
import { ValidationPipe } from "@nestjs/common";

@Injectable()
export class AppValidationPipe extends ValidationPipe {
  constructor() {
    super({
      whitelist: true
    });
  }

  async transform(value: any, metadata: ArgumentMetadata) {
    try {
      return await super.transform(value, metadata);
    } catch (error) {
      throw new BadRequestException(error.response.message[0]);
    }
  }
}
