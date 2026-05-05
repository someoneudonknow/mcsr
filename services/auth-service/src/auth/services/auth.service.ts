import { AuthResponseDto } from '#auth/dtos/auth.dto';
import { UserService } from '#user/services';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { KeyTokenService } from './key-token.service';
import { KeyTokenData, UserJwtPayload } from '#auth/interfaces';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly keyTokenService: KeyTokenService,
  ) {}

  async refreshTheToken({
    userJwtPayload,
    refreshToken,
    keyToken,
  }: {
    userJwtPayload: UserJwtPayload;
    refreshToken: string;
    keyToken: KeyTokenData;
  }) {
    if (!userJwtPayload || !refreshToken || !keyToken) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const { userId, email } = userJwtPayload;

    const isRefreshTokenUsed = await this.keyTokenService.isRefreshTokenUsed(
      userId,
      refreshToken,
    );
    if (isRefreshTokenUsed) {
      await this.logout(userId);

      throw new ForbiddenException(
        'There was some suspicious behaviour in your account! Please log in again!',
      );
    }

    if (refreshToken !== keyToken.refreshToken) {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    const userFound = await this.userService.findByEmail(email);
    if (!userFound) {
      throw new BadRequestException("You're not registered.");
    }

    const { accessToken, refreshToken: newRefreshToken } =
      this.keyTokenService.createJWTTokenPair(
        {
          userId: userFound.id,
          email: userFound.email,
        },
        keyToken.privateKey,
      );
    const updatedKeyToken = await this.keyTokenService.updateKeyToken(userId, {
      refreshToken: newRefreshToken,
    });
    console.log({ updatedKeyToken });
    if (!updatedKeyToken) {
      throw new InternalServerErrorException(
        'Something went wrong while refreshing the token, please try again later.',
      );
    }

    await this.keyTokenService.appendRefreshToken(userId, refreshToken);

    return {
      accessToken,
      refreshToken: newRefreshToken,
      user: userFound,
    };
  }

  async logout(userId: string) {
    if (!userId) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const cleaned = await this.keyTokenService.cleanKeyToken(userId);
    if (!cleaned) {
      throw new InternalServerErrorException(
        'Something went wrong while logging out, please try again later.',
      );
    }
    return true;
  }

  async login({
    identifier,
    password,
  }: {
    identifier: string;
    password: string;
  }): Promise<AuthResponseDto> {
    const user = await this.userService.findByUsernameOrEmail({
      email: identifier,
      username: identifier,
    });
    if (!user) {
      throw new NotFoundException('User is not registered.');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const { privateKey, publicKey } = this.keyTokenService.generateRSAKeyPair();
    const { accessToken, refreshToken } =
      this.keyTokenService.createJWTTokenPair(
        {
          userId: user.id,
          email: user.email,
        },
        privateKey,
      );

    const ok = this.keyTokenService.createKeyToken({
      userId: user.id,
      publicKey,
      privateKey,
      refreshToken,
    });
    if (!ok) {
      throw new InternalServerErrorException(
        'Something went wrong while logging in, please try again later.',
      );
    }

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  async register({
    username,
    password,
    email,
  }: {
    username: string;
    password: string;
    email: string;
  }): Promise<AuthResponseDto> {
    const user = await this.userService.findByUsernameOrEmail({
      email,
      username,
    });
    if (user) {
      throw new ConflictException('User already exits.');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await this.userService.create({
      username,
      email,
      password: hashedPassword,
    });

    if (!newUser) {
      throw new InternalServerErrorException(
        'Something went wrong while registering, please try again later.',
      );
    }

    const { privateKey, publicKey } = this.keyTokenService.generateRSAKeyPair();
    const { accessToken, refreshToken } =
      this.keyTokenService.createJWTTokenPair(
        {
          userId: newUser.id,
          email: newUser.email,
        },
        privateKey,
      );

    const insertedKeyToken = this.keyTokenService.createKeyToken({
      userId: newUser.id,
      publicKey,
      privateKey,
      refreshToken: refreshToken,
    });
    if (!insertedKeyToken) {
      throw new InternalServerErrorException(
        'Something went wrong while registering, please try again later.',
      );
    }

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
      user: newUser,
    };
  }
}
