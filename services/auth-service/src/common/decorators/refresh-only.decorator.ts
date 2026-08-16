import { SetMetadata } from '@nestjs/common';

export const IS_REFRESH_ONLY_KEY = Symbol('IS_REFRESH_ONLY');

export const RefreshOnly = () => SetMetadata(IS_REFRESH_ONLY_KEY, true);
