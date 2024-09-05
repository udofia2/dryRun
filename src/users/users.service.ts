import { Injectable } from "@nestjs/common";
import { UpdateUserDto } from "./dtos/update-user.dto";
import { User } from "@prisma/client";
import { DatabaseService } from "src/database/database.service";
import { SocialAuthDto } from "src/auth/dto";
import { CreateUserDto } from "./dtos";
import { AuthProvider } from "src/common/types";

@Injectable()
export class UsersService {
  constructor(private db: DatabaseService) {}

  /**
   * Creates a new user
   * @param {CreateUserDto | SocialAuthDto} dto - user data
   * @returns {Promise<User>} - the newly created user
   */
  public async create(dto: CreateUserDto | SocialAuthDto): Promise<User> {
    const user: User = await this.db.user.create({ data: dto });
    return user;
  }

  /**
   * Finds a user by email
   *
   * @param {string} email - the user email to query against the database
   * @returns {Promise<User>} - the user with the email
   */
  public async findByEmail(email: string): Promise<User> {
    const user = await this.db.user.findUnique({
      where: { email }
    });
    return user;
  }

  /**
   * Finds a user by provider and email
   *
   * @param {string} email - the user email to query against the database
   * @param {AuthProvider} provider - the provider to query against the database
   * @returns {Promise<User>} - the user with the email
   */
  public async findByProvider(
    email: string,
    provider: AuthProvider
  ): Promise<User> {
    const user = await this.db.user.findUnique({
      where: { email, provider }
    });
    return user;
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
