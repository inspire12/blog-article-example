import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { User } from './user.interface';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  getUser(@Param('id', ParseIntPipe) id: number): User {
    return this.userService.getUser(id);
  }
}
