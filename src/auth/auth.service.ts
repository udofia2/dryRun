import { ForbiddenException, Injectable } from "@nestjs/common";
import { CreateAuthDto, LoginDto, UpdateAuthDto } from "./dto";
import { DatabaseService } from "src/database/database.service";
import {
  ACCESS_TOKEN_EXPIRY,
  ACCESS_TOKEN_SECRET,
  ExhibitType,
  REFRESH_TOKEN_EXPIRY,
  REFRESH_TOKEN_SECRET
} from "src/constants";
import * as argon from "argon2";
import { User } from "@prisma/client";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly jwt: JwtService
  ) {}
  async register(dto: CreateAuthDto) {
    dto.email = dto.email.toLowerCase();
    // FIND USER
    const userExists = await this.db.user.findUnique({
      where: { email: dto.email }
    });
    if (userExists) {
      throw new ForbiddenException("User already exists. Please login");
    }

    if (dto.type === "exhibitor" && !ExhibitType.has(dto.exhibit)) {
      throw new ForbiddenException("Invalid exhibit type");
    }

    dto.password = await argon.hash(dto.password);

    // CREATE USER
    const user = await this.db.user.create({
      data: { ...dto }
    });

    delete user.password;
    const token = await this.signToken(user);

    return {
      success: true,
      message: "User created successfully",
      data: {
        ...user,
        ...token
      }
    };
  }

  async login(dto: LoginDto) {
    dto.email = dto.email.toLowerCase();
    // FIND USER
    const user = await this.db.user.findUnique({
      where: { email: dto.email }
    });

    if (!user) {
      throw new ForbiddenException("Invalid email or password");
    }

    // VERIFY PASSWORD
    const validPassword = await argon.verify(user.password, dto.password);
    if (!validPassword) {
      throw new ForbiddenException("Invalid email or password");
    }

    delete user.password;
    const token = await this.signToken(user);

    return {
      success: true,
      message: "User logged in successfully",
      data: {
        ...user,
        ...token
      }
    };
  }

  public async signToken(
    user: User
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      id: user.id,
      firstname: user.firstname,
      email: user.email,
      city: user.city,
      state: user.state,
      type: user.type
    };

    const accessToken = await this.jwt.signAsync(payload, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
      secret: ACCESS_TOKEN_SECRET
    });
    const refreshToken = await this.jwt.signAsync(payload, {
      expiresIn: REFRESH_TOKEN_EXPIRY,
      secret: REFRESH_TOKEN_SECRET
    });
    return { accessToken, refreshToken };
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
