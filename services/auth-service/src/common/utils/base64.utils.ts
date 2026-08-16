export const encodeBase64 = (input: string): string => {
  return Buffer.from(input, 'utf8').toString('base64');
};

export const decodeBase64 = (input: string): string => {
  return Buffer.from(input, 'base64').toString('utf8');
};
