import { LoggerBase } from './logger-base';

export const logger = new LoggerBase('🔥raf:', '');

export const log = (...args: any) => logger.log(...args);
export const logError = (...args: any) => logger.error(...args);
export const logWarn = (...args: any) => logger.warn(...args);
