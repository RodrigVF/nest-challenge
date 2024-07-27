import { HttpException, HttpStatus } from '@nestjs/common';

export class UserBadRequestException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}