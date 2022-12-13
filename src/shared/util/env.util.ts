import 'dotenv/config';

/**
 * Checks if project is running in production env
 * @returns if env is in production
 */
export const isRunningInProduction = (): boolean =>
  process.env.NODE_ENV === 'production';
