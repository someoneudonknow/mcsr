export enum ErrorCode {
  EMAIL_CONFLICT = 'EMAIL_CONFLICT',
  USER_EXIST = 'USER_EXIST',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  INVALID_PASSWORD = 'INVALID_PASSWORD',
}

export const ErrorMessages: Record<string, string> = {
  [ErrorCode.EMAIL_CONFLICT]: 'This email address is already registered.',
  [ErrorCode.USER_EXIST]:
    'This username or email address is already registered.',
  [ErrorCode.USER_NOT_FOUND]: 'The requested user could not be found.',
  [ErrorCode.INVALID_PASSWORD]: 'The password provided is incorrect.',
};
