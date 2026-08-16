export enum ErrorCode {
  EMAIL_CONFLICT = 'EMAIL_CONFLICT',
  USER_EXIST = 'USER_EXIST',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  INVALID_PASSWORD = 'INVALID_PASSWORD',

  SLUG_TAKEN = 'SLUG_TAKEN',
  SLUG_INVALID = 'SLUG_INVALID',
  SLUG_RESERVED = 'SLUG_RESERVED',
  TENANT_NOT_READY = 'TENANT_NOT_READY',
  TENANT_BLOCKED = 'TENANT_BLOCKED',
  VERIFICATION_INVALID = 'VERIFICATION_INVALID',
  VERIFICATION_EXPIRED = 'VERIFICATION_EXPIRED',
}

export const ErrorMessages: Record<string, string> = {
  [ErrorCode.EMAIL_CONFLICT]: 'This email address is already registered.',
  [ErrorCode.USER_EXIST]:
    'This username or email address is already registered.',
  [ErrorCode.USER_NOT_FOUND]: 'The requested user could not be found.',
  [ErrorCode.INVALID_PASSWORD]: 'The password provided is incorrect.',
  [ErrorCode.SLUG_TAKEN]: 'That workspace address is already taken.',
  [ErrorCode.SLUG_INVALID]:
    'Workspace address may only contain lowercase letters, numbers and hyphens.',
  [ErrorCode.SLUG_RESERVED]: 'That workspace address is reserved.',
  [ErrorCode.TENANT_NOT_READY]:
    'Your workspace is still being set up. Please try again shortly.',
  [ErrorCode.TENANT_BLOCKED]: 'This workspace is not available.',
  [ErrorCode.VERIFICATION_INVALID]:
    'This verification link is invalid or has already been used.',
  [ErrorCode.VERIFICATION_EXPIRED]: 'This verification link has expired.',
};
