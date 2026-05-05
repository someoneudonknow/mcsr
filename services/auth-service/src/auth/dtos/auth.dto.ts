import { User } from '#entity/user.model';
import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class AuthDto {
  @MaxLength(100)
  @IsNotEmpty()
  username!: string;

  @IsNotEmpty()
  @MinLength(6)
  password!: string;
}

export class RegisterDto extends AuthDto {
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
  user!: User;
}

