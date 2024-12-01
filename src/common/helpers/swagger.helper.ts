import { DocumentBuilder, SwaggerDocumentOptions } from "@nestjs/swagger";
import { PORT } from "src/constants";

// Swagger setup
export const configs = new DocumentBuilder()
  .setTitle("Event Backend")
  .setDescription("Restful API for the Event backend")
  .setVersion("1.0.0")
  .addOAuth2()
  .addBearerAuth()
  .addServer(`http://localhost:${PORT}/`, "local")
  .addServer(`https://e-vents.onrender.com`, "prod")
  .build();

export const options: SwaggerDocumentOptions = {
  operationIdFactory: (_: string, methodKey: string) => methodKey
};
