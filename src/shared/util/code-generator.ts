export const codeGenerator = (): string => {
  const randomString: string = Math.random()
    .toString(36)
    .slice(-2)
    .toUpperCase();
  const randomNumber: number = Math.floor(1000 + Math.random() * 9000);
  return `${randomString}${randomNumber}`;
};
