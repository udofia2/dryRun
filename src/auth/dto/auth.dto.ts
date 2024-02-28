import { EXHIBITTYPE, USERTYPE } from "@prisma/client";
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  IsEmail,
  IsNotEmpty,
  IsString
} from "class-validator";

export function MatchesProperty(
  property: string,
  validationOptions?: ValidationOptions
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: "matchesProperty",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return value === relatedValue;
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          return `${propertyName} must match ${relatedPropertyName}`;
        }
      }
    });
  };
}

export class CreateAuthDto {
  @IsString()
  @IsNotEmpty()
  firstname: string;

  @IsString()
  @IsNotEmpty()
  lastname: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  type: USERTYPE;

  @IsString()
  exhibit: EXHIBITTYPE;
}

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  redirectUrl: string;
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  @MatchesProperty("password")
  confirmPassword: string;
}

export class TokenDto {
  @IsNotEmpty()
  @IsString()
  token: string;
}

export class UpdateAuthDto {}
