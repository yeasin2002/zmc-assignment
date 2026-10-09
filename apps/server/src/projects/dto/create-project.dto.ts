import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({
    description: 'Name of the project',
    example: 'E-Commerce Platform Redesign',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: 'Project name is required' })
  @MinLength(2, { message: 'Project name must be at least 2 characters' })
  @MaxLength(100, { message: 'Project name cannot exceed 100 characters' })
  name!: string;

  @ApiPropertyOptional({
    description: 'Detailed description or goals of the project',
    example: 'Overhaul UI/UX and integrate payment gateways.',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Description cannot exceed 500 characters' })
  description?: string;
}
