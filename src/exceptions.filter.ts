import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger, NotFoundException, ForbiddenException, UnauthorizedException, BadRequestException, UnprocessableEntityException, InternalServerErrorException, MethodNotAllowedException, BadGatewayException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    setResponse(response: Response, statusCode: number, message: string, data?: Record<string, any>) {
        var respData: Record<string, any> = {
            status: "failure",
            message: message,
        }
        if (data) respData.data = data
        response
            .status(statusCode)
            .json(respData);
    }
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus();

        const errResponse = exception.getResponse()
        var errMsg = exception.message
        Logger.log(JSON.stringify(errResponse))
        // Logger.log(JSON.stringify(exception instanceof NotFoundException))
        this.setResponse(response, status, exception.message)
    }
}