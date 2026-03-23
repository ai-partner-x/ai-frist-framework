/**
 * 日志服务
 * 包含基础日志服务和装饰器功能
 */

import { 
  getLogger, 
  ILogger,
  Slf4j as OriginalSlf4j, 
  Log as OriginalLog, 
  LogInfo as OriginalLogInfo, 
  LogError as OriginalLogError, 
  LogDebug as OriginalLogDebug,
  enableDecoratorSupport,
  type Slf4jOptions,
  type LogOptions
} from '@ai-partner-x/aiko-boot-starter-log';

// 启用装饰器支持
enableDecoratorSupport();

// 类型定义
type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'http' | 'verbose' | 'silly';
type MetaData = Record<string, any>;
type MethodWrapperOptions = {
  level?: LogLevel;
  message?: string;
  className?: string;
  methodName?: string;
};

/**
 * 日志服务适配器
 * 提供统一的日志接口，封装 aiko-boot-starter-log 的功能
 */
export class LogService {
  private static _instance: LogService | null = null;
  private readonly logger: ILogger;
  
  private constructor() {
    // 使用命名logger，便于区分不同模块
    this.logger = getLogger('scaffold-api');
  }
  
  /**
   * 获取日志服务单例
   */
  static get instance(): LogService {
    if (!LogService._instance) {
      LogService._instance = new LogService();
    }
    return LogService._instance;
  }
  
  /**
   * 获取日志服务单例（兼容旧版本）
   */
  static getInstance(): LogService {
    return LogService.instance;
  }
  
  /**
   * 记录错误日志
   * @param message 错误消息
   * @param error 错误对象（可选）
   * @param meta 附加元数据（可选）
   */
  error(message: string, error?: Error, meta?: MetaData): void {
    this.logger.error(message, error, meta);
  }
  
  /**
   * 记录警告日志
   * @param message 警告消息
   * @param meta 附加元数据（可选）
   */
  warn(message: string, meta?: MetaData): void {
    this.logger.warn(message, meta);
  }
  
  /**
   * 记录信息日志
   * @param message 信息消息
   * @param meta 附加元数据（可选）
   */
  info(message: string, meta?: MetaData): void {
    this.logger.info(message, meta);
  }
  
  /**
   * 记录调试日志
   * @param message 调试消息
   * @param meta 附加元数据（可选）
   */
  debug(message: string, meta?: MetaData): void {
    this.logger.debug(message, meta);
  }
  
  /**
   * 记录HTTP请求日志
   * @param message HTTP消息
   * @param meta 附加元数据（可选）
   */
  http(message: string, meta?: MetaData): void {
    this.logger.http(message, meta);
  }
  
  /**
   * 记录详细日志
   * @param message 详细消息
   * @param meta 附加元数据（可选）
   */
  verbose(message: string, meta?: MetaData): void {
    this.logger.verbose(message, meta);
  }
  
  /**
   * 记录最详细日志
   * @param message 最详细消息
   * @param meta 附加元数据（可选）
   */
  silly(message: string, meta?: MetaData): void {
    this.logger.silly(message, meta);
  }
  
  /**
   * 检查是否启用指定级别的日志
   * @param level 日志级别
   */
  isLevelEnabled(level: LogLevel): boolean {
    return this.logger.isLevelEnabled(level);
  }
  
  /**
   * 获取原始logger实例
   */
  getLogger(): ILogger {
    return this.logger;
  }
  
  /**
   * 创建子logger（用于模块划分）
   * @param name 子logger名称
   */
  createChildLogger(name: string): ILogger {
    return this.logger.child(name);
  }
  
  /**
   * 添加上下文信息
   * @param context 上下文对象
   */
  withContext(context: MetaData): ILogger {
    return this.logger.withContext(context);
  }
  
  /**
   * 便捷日志方法
   * @param level 日志级别
   * @param message 日志消息
   * @param meta 附加元数据（可选）
   */
  log(level: LogLevel, message: string, meta?: MetaData): void {
    switch (level) {
      case 'error':
        this.error(message, undefined, meta);
        break;
      case 'warn':
        this.warn(message, meta);
        break;
      case 'info':
        this.info(message, meta);
        break;
      case 'debug':
        this.debug(message, meta);
        break;
      case 'http':
        this.http(message, meta);
        break;
      case 'verbose':
        this.verbose(message, meta);
        break;
      case 'silly':
        this.silly(message, meta);
        break;
      default:
        this.info(message, meta);
    }
  }
}

// 导出单例实例
export const logService = LogService.instance;

/**
 * @Slf4j 装饰器（脚手架适配版本）
 * 提供增强的配置选项和脚手架集成
 */
export function Slf4j(options?: Slf4jOptions): ClassDecorator {
  const defaultOptions: Slf4jOptions = {
    name: options?.name,
    level: options?.level || 'info',
    enabled: options?.enabled !== false,
    factoryOptions: {
      ...options?.factoryOptions,
      // 脚手架特定的默认配置
      format: 'json',
      transports: ['console', 'file'],
    },
    logMethodName: options?.logMethodName || 'log',
  };

  return OriginalSlf4j(defaultOptions);
}

/**
 * @Log 装饰器（脚手架适配版本）
 * 提供增强的配置选项和脚手架集成
 */
export function Log(options?: LogOptions): MethodDecorator {
  const defaultOptions: LogOptions = {
    level: options?.level || 'info',
    message: options?.message,
    logArgs: options?.logArgs !== false,
    logResult: options?.logResult !== false,
    logDuration: options?.logDuration !== false,
    logError: options?.logError !== false,
    argsSerializer: options?.argsSerializer,
    resultSerializer: options?.resultSerializer,
    errorSerializer: options?.errorSerializer,
    loggerName: options?.loggerName,
  };

  return OriginalLog(defaultOptions);
}

/**
 * @LogInfo 装饰器（脚手架适配版本）
 */
export function LogInfo(message?: string): MethodDecorator {
  return OriginalLogInfo(message);
}

/**
 * @LogError 装饰器（脚手架适配版本）
 */
export function LogError(message?: string): MethodDecorator {
  return OriginalLogError(message);
}

/**
 * @LogDebug 装饰器（脚手架适配版本）
 */
export function LogDebug(message?: string): MethodDecorator {
  return OriginalLogDebug(message);
}

/**
 * @LogWarn 装饰器（脚手架适配版本）
 * 注意：原日志组件没有提供 LogWarn，这里使用 Log 装饰器实现
 */
export function LogWarn(message?: string): MethodDecorator {
  return OriginalLog({ level: 'warn', message });
}

/**
 * 装饰器配置工具类
 */
export class LogDecoratorService {
  /**
   * 创建装饰器配置
   * @param options 配置选项
   */
  static createConfig(options?: {
    name?: string;
    level?: string;
    enabled?: boolean;
    format?: string;
    transports?: string[];
  }) {
    return {
      name: options?.name,
      level: options?.level || 'info',
      enabled: options?.enabled !== false,
      factoryOptions: {
        format: options?.format || 'json',
        transports: options?.transports || ['console', 'file'],
      },
    };
  }

  /**
   * 检查类是否已应用 @Slf4j 装饰器
   * @param target 类构造函数
   */
  static isSlf4jDecorated(target: any): boolean {
    return !!target.prototype?.logger;
  }

  /**
   * 为类手动注入日志记录器
   * @param target 类构造函数
   * @param loggerName 日志记录器名称
   */
  static injectLogger(target: any, loggerName?: string): void {
    const name = loggerName || target.name;
    const logger = getLogger(name);
    
    Object.defineProperty(target.prototype, 'logger', {
      get() {
        return logger;
      },
      enumerable: false,
      configurable: true,
    });
  }

  /**
   * 获取类的日志记录器
   * @param target 类实例或类构造函数
   */
  static getClassLogger(target: any): ILogger | undefined {
    if (typeof target === 'function') {
      // 类构造函数
      return target.prototype?.logger;
    } else {
      // 类实例
      return target.logger;
    }
  }

  /**
   * 创建方法包装器（手动装饰器模式）
   * @param method 原始方法
   * @param options 装饰器选项
   */
  static createMethodWrapper(
    method: Function,
    options?: MethodWrapperOptions
  ): Function {
    const config = {
      level: options?.level || 'info',
      message: options?.message || 'Method called',
      className: options?.className || 'UnknownClass',
      methodName: options?.methodName || 'unknownMethod',
    };

    return function (...args: any[]) {
      const startTime = Date.now();
      const meta: Record<string, any> = {
        className: config.className,
        methodName: config.methodName,
      };

      // 记录参数
      if (args.length > 0) {
        meta.args = args.map(LogDecoratorService.serializeArg);
      }

      try {
        // 执行原始方法
        const result = method.apply(this, args);

        // 处理异步方法
        if (result instanceof Promise) {
          return LogDecoratorService.handleAsyncMethod(
            result, startTime, meta, config
          );
        }

        // 处理同步方法
        return LogDecoratorService.handleSyncMethod(
          result, startTime, meta, config
        );
      } catch (error) {
        // 处理同步方法错误
        return LogDecoratorService.handleSyncError(
          error as Error, startTime, meta, config
        );
      }
    };
  }

  /**
   * 序列化参数
   */
  private static serializeArg(arg: any): string {
    if (arg === undefined) return 'undefined';
    if (arg === null) return 'null';
    if (typeof arg === 'function') return '[Function]';
    if (typeof arg === 'object') {
      try {
        return JSON.stringify(arg);
      } catch {
        return '[Object]';
      }
    }
    return String(arg);
  }

  /**
   * 处理异步方法
   */
  private static handleAsyncMethod(
    promise: Promise<any>,
    startTime: number,
    meta: MetaData,
    config: { level: LogLevel; message: string; className: string; methodName: string }
  ): Promise<any> {
    return promise
      .then((asyncResult) => {
        const duration = Date.now() - startTime;
        meta.duration = `${duration}ms`;
        meta.result = asyncResult;
        console.log(`[${config.level.toUpperCase()}] ${config.message} - success`, meta);
        return asyncResult;
      })
      .catch((error) => {
        const duration = Date.now() - startTime;
        meta.duration = `${duration}ms`;
        meta.error = {
          name: error.name,
          message: error.message,
          stack: error.stack,
        };
        console.error(`[ERROR] ${config.message} - error`, meta);
        throw error;
      });
  }

  /**
   * 处理同步方法
   */
  private static handleSyncMethod(
    result: any,
    startTime: number,
    meta: MetaData,
    config: { level: LogLevel; message: string; className: string; methodName: string }
  ): any {
    const duration = Date.now() - startTime;
    meta.duration = `${duration}ms`;
    meta.result = result;
    console.log(`[${config.level.toUpperCase()}] ${config.message} - success`, meta);
    return result;
  }

  /**
   * 处理同步方法错误
   */
  private static handleSyncError(
    error: Error,
    startTime: number,
    meta: MetaData,
    config: { level: LogLevel; message: string; className: string; methodName: string }
  ): never {
    const duration = Date.now() - startTime;
    meta.duration = `${duration}ms`;
    meta.error = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
    console.error(`[ERROR] ${config.message} - error`, meta);
    throw error;
  }
}

// 导出装饰器配置工具
export const createDecoratorConfig = LogDecoratorService.createConfig;
export const isSlf4jDecorated = LogDecoratorService.isSlf4jDecorated;
export const injectLogger = LogDecoratorService.injectLogger;
export const getClassLogger = LogDecoratorService.getClassLogger;
export const createMethodWrapper = LogDecoratorService.createMethodWrapper;

/**
 * 性能优化的装饰器配置（生产环境禁用详细日志）
 */
export function createProductionDecoratorConfig(name?: string) {
  return LogDecoratorService.createConfig({
    name,
    level: 'warn', // 生产环境只记录警告及以上级别
    enabled: true,
    format: 'json',
    transports: ['file'], // 生产环境只记录到文件
  });
}

/**
 * 开发环境装饰器配置（启用详细日志）
 */
export function createDevelopmentDecoratorConfig(name?: string) {
  return LogDecoratorService.createConfig({
    name,
    level: 'debug', // 开发环境启用调试日志
    enabled: true,
    format: 'json',
    transports: ['console', 'file'], // 开发环境同时输出到控制台和文件
  });
}
