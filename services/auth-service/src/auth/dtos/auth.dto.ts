import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @MaxLength(100)
  @IsNotEmpty()
  email!: string;
}

export class LoginDto {
  @IsNotEmpty()
  @MaxLength(100)
  usernameOrEmail!: string;

  @IsNotEmpty()
  @MinLength(6)
  password!: string;
}

export class AuthResponseDto {
  accessToken!: string;
  refreshToken!: string;
}
