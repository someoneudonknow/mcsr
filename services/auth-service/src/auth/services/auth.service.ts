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
import { UserJwtPayload } from '#auth/interfaces';
import { JwtTokenService } from './jwt-token.service';
import { SessionService } from './session.service';
import { isSlugReserved, isSlugValid, normalizeSlug } from '#common/utils';
import { ErrorCode } from '#common/exceptions';
import { randomUUID } from 'crypto';
import { TenantRegisterDto, TenantRegisterResponseDto } from '#auth/dtos';
import { v7 as uuidv7 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtTokenService: JwtTokenService,
    private readonly sessionService: SessionService,
  ) {}

  async refreshTheToken({ payload }: { payload: UserJwtPayload }) {
    const { sub: userId, email, jti } = payload;

    if (await this.sessionService.isRefreshJtiUsed(userId, jti)) {
      await this.logout(userId);
      throw new ForbiddenException(
        'There was some suspicious behaviour in your account! Please log in again!',
      );
    }

    const session = await this.sessionService.find(userId);
    if (!session || session.refreshJti !== jti) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const currentVersion = await this.sessionService.getSessionVersion(userId);
    this.sessionService.assertNotRevoked(payload, currentVersion);

    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new BadRequestException("You're not registered.");
    }

    const { accessToken, refreshToken, refreshJti } =
      this.jwtTokenService.signTokenPair(
        { sub: user.id, email: user.email },
        currentVersion,
      );

    await this.sessionService.rotate(userId, jti, refreshJti);

    return {
      accessToken,
      refreshToken: refreshToken,
    };
  }

  async logout(userId: string) {
    if (!userId) {
      throw new UnauthorizedException('Invalid credentials.');
    }
    await this.sessionService.bumpSessionVersion(userId);
    await this.sessionService.end(userId);
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

    return await this.issueSession(user);
  }

  private async issueSession(user: Tenants): Promise<AuthResponseDto> {
    const sessionVersion = await this.sessionService.getSessionVersion(user.id);
    const { accessToken, refreshToken, refreshJti } =
      this.jwtTokenService.signTokenPair(
        {
          sub: user.id,
          email: user.email,
        },
        sessionVersion,
      );
    await this.sessionService.start(user.id, refreshJti);

    return { accessToken, refreshToken };
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

    return await this.issueSession(newUser);
  }
}
