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
        // const request = ctx.getRequest<Request>();
        var status = exception.getStatus();

        var errMsg: any = exception.message
        const errData: { [key: string]: string } = {};


        // Handle Validation error
        if (exception instanceof UnprocessableEntityException) {
            const errResponse = exception.getResponse() as any
            const errArray = errResponse.errors

            errArray.forEach((error: { [key: string]: any }) => {
                const errValues: string[] = Object.values(error.constraints);
                errData[error.property] = errValues[0]
            });

            errMsg = "Invalid Entry"
            status = 422
        }
        this.setResponse(response, status, errMsg, errData)
    }
}