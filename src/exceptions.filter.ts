import { ExceptionFilter, Catch, ArgumentsHost, HttpException, UnprocessableEntityException, Logger } from '@nestjs/common';
import { Response } from 'express';
import snakecaseKeys from 'snakecase-keys'

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    setResponse(response: Response, statusCode: number, message: string, data?: Record<string, any>) {
        var respData: Record<string, any> = {
            status: "failure",
            message: message,
        }
        if (data && Object.keys(data).length) respData.data = snakecaseKeys(data)
        response
            .status(statusCode)
            .json(respData);
    }
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        Logger.log(exception.message)
        var errResp: Record<string, any> = exception.getResponse() as Record<string, any>
        var status = exception.getStatus();

        var errMsg: any = exception.message
        var errData: { [key: string]: string } = errResp.data || {};

        // Handle Validation error
        if (exception instanceof UnprocessableEntityException) {
            const errResponse = exception.getResponse() as any
            const errArray = errResponse.errors

            errArray.forEach((error: { [key: string]: any }) => {
                var errValue = Object.values(error.constraints)[0] as string;
                const errType: string = Object.keys(error.constraints)[0]
                if (errType === "isNotEmpty"){
                    errValue = "Field required"
                } else if(errType === "maxLength") {
                    const setNum = errValue.split(" ").splice(-2)[0]
                    errValue = `${setNum} characters max`
                }
                else if(errType === "minLength") {
                    const setNum = errValue.split(" ").splice(-2)[0]
                    errValue = `${setNum} characters min`
                }
                errData[error.property] = errValue as string
            });

            errMsg = "Invalid Entry"
            status = 422
        }
        this.setResponse(response as any, status, errMsg, errData)
    }
}

export class RequestError extends HttpException {
    constructor(errMsg: string, statusCode: number = 400, data?: Record<string, any>) {
      super({ message: errMsg, data }, statusCode);
    }
}