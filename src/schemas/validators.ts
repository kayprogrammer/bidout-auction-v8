import { Logger } from '@nestjs/common';
import { registerDecorator, ValidationOptions, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { convertDateToUTC } from 'src/utils/utils';

@ValidatorConstraint({ name: 'isUtcDateTimeValid', async: false })
export class IsUtcDateTimeValidConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const currentUtcDate = convertDateToUTC(new Date());
    const inputUtcDate = convertDateToUTC(new Date(value));
    Logger.log(currentUtcDate)
    Logger.log(inputUtcDate)

    // Check if the parsed input UTC date is greater than or equal to the current UTC date
    return inputUtcDate > currentUtcDate;
  }

  defaultMessage(args: ValidationArguments) {
    return `Closing datetime must be beyond the current datetime in UTC!`;
  }
}

export function IsUtcDateTimeValid(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsUtcDateTimeValidConstraint,
    });
  };
}


// export function IsBiggerThan(property: string, validationOptions?: ValidationOptions) {
//     return function (object: Object, propertyName: string) {
//       registerDecorator({
//         name: 'isBiggerThan',
//         target: object.constructor,
//         propertyName: propertyName,
//         constraints: [property],
//         options: validationOptions,
//         validator: {
//           validate(value: any, args: ValidationArguments) {
//             const [relatedPropertyName] = args.constraints;
//             const relatedValue = (args.object as any)[relatedPropertyName];
//             return typeof value === 'number' && typeof relatedValue === 'number' && value > relatedValue;
//           },
//         },
//       });
//     };
//   }