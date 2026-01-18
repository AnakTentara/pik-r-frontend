type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const colors = {
    info: '\x1b[36m',    // Cyan
    warn: '\x1b[33m',    // Yellow
    error: '\x1b[31m',   // Red
    debug: '\x1b[35m',   // Magenta
    reset: '\x1b[0m'
};

class Logger {
    private prefix: string;

    constructor(prefix: string = 'PIK-R') {
        this.prefix = prefix;
    }

    private format(level: LogLevel, message: string, data?: any): string {
        const timestamp = new Date().toISOString();
        const dataStr = data ? ` ${JSON.stringify(data)}` : '';
        return `[${timestamp}] [${level.toUpperCase()}] [${this.prefix}] ${message}${dataStr}`;
    }

    info(message: string, data?: any) {
        console.log(colors.info + this.format('info', message, data) + colors.reset);
    }

    warn(message: string, data?: any) {
        console.warn(colors.warn + this.format('warn', message, data) + colors.reset);
    }

    error(message: string, data?: any) {
        console.error(colors.error + this.format('error', message, data) + colors.reset);
    }

    debug(message: string, data?: any) {
        if (process.env.NODE_ENV !== 'production') {
            console.log(colors.debug + this.format('debug', message, data) + colors.reset);
        }
    }

    api(method: string, path: string, status?: number) {
        this.info(`API ${method} ${path}`, status ? { status } : undefined);
    }
}

export const logger = new Logger();
export default logger;
