import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class AddMemberDto {
  @ApiProperty({
    description: 'Email of the registered user to add as a project member',
    example: 'member1@example.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'A valid email address is required' })
  @IsNotEmpty({ message: 'User email is required' })
  email!: string;
}
