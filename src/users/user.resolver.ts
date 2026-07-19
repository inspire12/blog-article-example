import { Args, Query, Resolver } from '@nestjs/graphql';
import { User } from './user.interface';
import { UserService } from './user.service';

@Resolver('User')
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query('user')
  user(@Args('id') id: number): User {
    return this.userService.getUser(id);
  }
}
