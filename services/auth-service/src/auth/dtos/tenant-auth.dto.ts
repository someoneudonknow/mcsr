import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class TenantRegisterDto {
  @IsOptional()
  @IsString()
  @MaxLength(63)
  @Matches(/ ^[a-z][a-z0-9-]{2,62}$/, {
    message:
      'Slug must be lowercase, alphanumeric, and dash-separated (e.g., example-slug)',
  })
  slug?: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  organizationName!: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(100)
  email!: string;

  @IsNotEmpty()
  @MinLength(12)
  @MaxLength(128)
  password!: string;
}

export class TenantRegisterResponseDto {
  tenantId!: string;
  status!: 'pending';
}
