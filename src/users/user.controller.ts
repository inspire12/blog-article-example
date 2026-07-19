import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { User } from './user.interface';
import { UserService } from './user.service';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  @ApiOperation({ summary: '사용자 단건 조회' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({ description: '조회된 사용자', type: User })
  @ApiNotFoundResponse({ description: '사용자를 찾을 수 없음' })
  getUser(@Param('id', ParseIntPipe) id: number): User {
    return this.userService.getUser(id);
  }
}
