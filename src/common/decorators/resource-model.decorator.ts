import { SetMetadata } from "@nestjs/common";

export const ResourceModel = (model: string) => SetMetadata("model", model);
