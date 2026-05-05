import { ResponseMessage } from '#common/decorators';
import { UserService } from '#user/services';
import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ResponseMessage('Get user successfully.')
  async getMe(@Req() req: Request) {
    return this.userService.findById(req.user.userId);
  }
}
