//מסנן שגיאות גלובלי — כל שגיאה שקורית בפרויקט עוברת דרכו.
// הוא מחזיר תשובה אחידה ומסודרת ומדפיס ל-log. בלעדיו כל שגיאה מחזירה פורמט שונה.

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'שגיאה פנימית בשרת';

    this.logger.error(
      `${request.method} ${request.url} — ${status}`,
      exception instanceof Error ? exception.stack : String(exception),
    );
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
