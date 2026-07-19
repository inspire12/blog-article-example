import { ApiProperty } from '@nestjs/swagger';

export class User {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Kim' })
  name!: string;
}
