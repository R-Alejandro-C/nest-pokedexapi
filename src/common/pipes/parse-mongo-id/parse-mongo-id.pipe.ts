import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';


@Injectable()
export class ParseMongoIdPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {

    if (isValidObjectId(value)) {
      return value.toUpperCase();

    } else {
      throw new BadRequestException(`${value} no es un id de mongo valido`)
    }
    console.log({ value, metadata });


  }
}
