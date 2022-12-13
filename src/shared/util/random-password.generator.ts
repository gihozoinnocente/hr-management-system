export const generateRandomPassword = () => {
  const randomPassword: string = Math.random().toString(36).slice(-8);
  return randomPassword;
};
