import { SetMetadata } from '@nestjs/common';

export type ResponseMessageOpts = {
  message: string;
  statusCode: number;
};

export const RESPONSE_MESSAGE_KEY = Symbol('RESPONSE_MESSAGE');

export const ResponseMessage = (payload: string | ResponseMessageOpts) => {
  if (typeof payload === 'string') {
    return SetMetadata(RESPONSE_MESSAGE_KEY, {
      message: payload,
      statusCode: 200,
    });
  }
  return SetMetadata(RESPONSE_MESSAGE_KEY, payload);
};
