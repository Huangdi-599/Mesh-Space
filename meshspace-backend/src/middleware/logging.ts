import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

// Check if we're in a serverless environment
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NODE_ENV === 'production';

// Create logs directory if it doesn't exist (only in non-serverless environments)
let logsDir: string;
if (!isServerless) {
  logsDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logsDir)) {
    try {
      fs.mkdirSync(logsDir, { recursive: true });
    } catch (error) {
      console.warn('Could not create logs directory:', error);
    }
  }
} else {
  // In serverless environments, use /tmp for logs or skip file logging
  logsDir = '/tmp/logs';
  try {
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
  } catch (error) {
    console.warn('Could not create logs directory in serverless environment:', error);
  }
}

// Log levels
enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}

// Log interface
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  method?: string;
  url?: string;
  statusCode?: number;
  responseTime?: number;
  ip?: string;
  userAgent?: string;
  userId?: string;
  error?: any;
}

// Logger class
class Logger {
  private logToFile(entry: LogEntry) {
    // Skip file logging in serverless environments if logs directory is not available
    if (isServerless && !fs.existsSync(logsDir)) {
      return;
    }

    try {
      const logFile = path.join(logsDir, `${entry.level.toLowerCase()}.log`);
      const logLine = JSON.stringify(entry) + '\n';
      
      fs.appendFile(logFile, logLine, (err) => {
        if (err) {
          // In serverless environments, silently fail or use console
          if (!isServerless) {
            console.error('Failed to write to log file:', err);
          }
        }
      });
    } catch (error) {
      // Silently handle file system errors in serverless environments
      if (!isServerless) {
        console.error('Failed to write to log file:', error);
      }
    }
  }

  private log(level: LogLevel, message: string, meta?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...meta
    };

    // Console output
    const color = {
      [LogLevel.ERROR]: '\x1b[31m', // Red
      [LogLevel.WARN]: '\x1b[33m',  // Yellow
      [LogLevel.INFO]: '\x1b[36m', // Cyan
      [LogLevel.DEBUG]: '\x1b[37m'  // White
    }[level];

    console.log(`${color}[${level}]${message}${meta ? JSON.stringify(meta, null, 2) : ''}\x1b[0m`);

    // File output
    this.logToFile(entry);
  }

  error(message: string, meta?: any) {
    this.log(LogLevel.ERROR, message, meta);
  }

  warn(message: string, meta?: any) {
    this.log(LogLevel.WARN, message, meta);
  }

  info(message: string, meta?: any) {
    this.log(LogLevel.INFO, message, meta);
  }

  debug(message: string, meta?: any) {
    this.log(LogLevel.DEBUG, message, meta);
  }
}

export const logger = new Logger();

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const { method, url, ip } = req;
  const userAgent = req.get('User-Agent') || 'Unknown';

  // Log request
  logger.info('Incoming request', {
    method,
    url,
    ip,
    userAgent,
    userId: (req as any).user?.userId
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any, cb?: any) {
    const responseTime = Date.now() - start;
    const { statusCode } = res;

    logger.info('Request completed', {
      method,
      url,
      statusCode,
      responseTime,
      ip,
      userId: (req as any).user?.userId
    });

    return originalEnd.call(this, chunk, encoding, cb);
  };

  next();
};

// Error logging middleware
export const errorLogger = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userId: (req as any).user?.userId,
    error: err
  });

  next(err);
};

// Performance monitoring middleware
export const performanceMonitor = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime.bigint();
  
  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1000000; // Convert to milliseconds
    
    if (duration > 1000) { // Log slow requests (>1s)
      logger.warn('Slow request detected', {
        method: req.method,
        url: req.url,
        duration: `${duration.toFixed(2)}ms`,
        statusCode: res.statusCode,
        userId: (req as any).user?.userId
      });
    }
  });

  next();
};
