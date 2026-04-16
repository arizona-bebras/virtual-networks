import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from "@nestjs/common";
import type { User } from "./interfaces/user.interface";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() user: User) {
    return this.usersService.create(user);
  }

  @Get(":id")
  read(@Param("id") id: string) {
    return this.usersService.read(id);
  }

  @Put(":id")
  update(@Param("id") id: string, @Body() user: User) {
    return this.usersService.update(id, user);
  }

  @Delete(":id")
  delete(@Param("id") id: string) {
    return this.usersService.delete(id);
  }
}
