import { ApiProperty } from "@nestjs/swagger";
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
  @ApiProperty({
    type: String,
    example: "Abasiodiong",
    description: "User first name"
  })
  firstname: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    example: "Udofia",
    description: "User last name"
  })
  lastname: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    example: "odiong@gmail.com",
    description: "User email address"
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    example: "Odiong123$",
    description: "User strong and secure password"
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    example: "vendor",
    description: "user type could be host or vendor"
  })
  type: USERTYPE;

  @UserTypeMustBe("vendor")
  @ApiProperty({
    type: String,
    example: "social_media_influencer",
    description: "exhibit type"
  })
  exhibit: EXHIBITTYPE;
}

export class LoginDto {
  @ApiProperty({
    example: "odiong@gmail.com",
    description: "The user's email address. Must be a valid email format.",
    required: true
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: "Odiong123$",
    description: "The user's password. Must not be empty.",
    required: true
  })
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

/**
 * USER TYPE MUST BE
 * @param expectedType
 * @param validationOptions
 * @returns
 */
export function UserTypeMustBe(
  expectedType: string,
  validationOptions?: ValidationOptions
) {
  return function (object: CreateAuthDto, propertyName: string) {
    registerDecorator({
      name: "userTypeMustBe",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [expectedType],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [expectedType] = args.constraints;
          const userDto = args.object as CreateAuthDto;
          if (userDto.type !== expectedType && value !== undefined) {
            return false;
          }
          return true;
        },
        defaultMessage(args: ValidationArguments) {
          const [expectedType] = args.constraints;
          return `Only ${expectedType}s can have ${args.property} field`;
        }
      }
    });
  };
}
