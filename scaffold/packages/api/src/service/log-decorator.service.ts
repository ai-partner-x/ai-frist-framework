/**
 * 日志装饰器服务
 * 提供 @Slf4j 和 @Log* 装饰器的集成和工具方法
 */

import { getLogger, ILogger } from '@ai-partner-x/aiko-boot-starter-log';
import { 
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
    options?: {
      level?: string;
      message?: string;
      className?: string;
      methodName?: string;
    }
  ): Function {
    const config = {
      level: options?.level || 'info',
      message: options?.message || 'Method called',
      className: options?.className || 'UnknownClass',
      methodName: options?.methodName || 'unknownMethod',
    };

    return function (...args: any[]) {
      const startTime = Date.now();
      const meta: any = {
        className: config.className,
        methodName: config.methodName,
      };

      // 记录参数
      if (args.length > 0) {
        meta.args = args.map(arg => {
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
          return arg;
        });
      }

      try {
        // 执行原始方法
        const result = method.apply(this, args);

        // 处理异步方法
        if (result instanceof Promise) {
          return result
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

        // 处理同步方法
        const duration = Date.now() - startTime;
        meta.duration = `${duration}ms`;
        meta.result = result;
        console.log(`[${config.level.toUpperCase()}] ${config.message} - success`, meta);
        return result;
      } catch (error) {
        // 处理同步方法错误
        const duration = Date.now() - startTime;
        meta.duration = `${duration}ms`;
        meta.error = {
          name: (error as Error).name,
          message: (error as Error).message,
          stack: (error as Error).stack,
        };
        console.error(`[ERROR] ${config.message} - error`, meta);
        throw error;
      }
    };
  }
}

// 导出装饰器配置工具
export const createDecoratorConfig = LogDecoratorService.createConfig;
export const isSlf4jDecorated = LogDecoratorService.isSlf4jDecorated;
export const injectLogger = LogDecoratorService.injectLogger;
export const getClassLogger = LogDecoratorService.getClassLogger;
export const createMethodWrapper = LogDecoratorService.createMethodWrapper;