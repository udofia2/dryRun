import { EXHIBITTYPE, USERTYPE } from "@prisma/client";
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  IsEmail,
  IsNotEmpty,
  IsString,
  IsNumber
} from "class-validator";

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
}

export class ResetPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  @MatchesProperty("password")
  confirmPassword: string;
}

export class VerifyOtpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsNumber()
  otp: number;
}

export class TokenDto {
  @IsNotEmpty()
  @IsString()
  token: string;
}

export class RefreshTokenDto {
  @IsNotEmpty()
  @IsString()
  refresh_token: string;
}

export class UpdateAuthDto {}

/**
 * MATCH PROPERTIES
 * @param property
 * @param validationOptions
 * @returns
 */
function MatchesProperty(
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
