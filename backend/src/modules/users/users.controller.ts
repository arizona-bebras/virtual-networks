import { Controller, Get, Param, Post,  } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './interfaces/user.interface';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    create(@Body() user: User) {
        return this.usersService.create(user);
    } 
    
}

