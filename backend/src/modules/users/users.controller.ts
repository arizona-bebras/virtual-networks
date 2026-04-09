<<<<<<< HEAD
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
import type { UsersService } from "./users.service";
=======
import { Controller, Get, Param, Post, Body, Delete, Put  } from '@nestjs/common';
import { UsersService } from './users.service';
import type { User } from './interfaces/user.interface';
>>>>>>> 44c3127 (feat: user CRUD)

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

<<<<<<< HEAD
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
=======
    @Post()
    create(@Body() user: User) {
        return this.usersService.create(user);
    }

    @Get(':id')
    read(@Param('id') id: string) {
        return this.usersService.read(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() user: User) {
        return this.usersService.update(id, user);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.usersService.delete(id);
    }
>>>>>>> 44c3127 (feat: user CRUD)
}
