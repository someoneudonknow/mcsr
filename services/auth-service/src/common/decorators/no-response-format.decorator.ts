import { SetMetadata } from '@nestjs/common';

export const NO_RESPONSE_FORMAT_KEY = Symbol('NO_RESPONSE_FORMAT');

export const NoResponseFormat = () => SetMetadata(NO_RESPONSE_FORMAT_KEY, true);
