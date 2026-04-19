import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isMultipleOf15' })
export class IsMultipleOf15 implements ValidatorConstraintInterface {
  validate(value: number): boolean {
    return value % 15 === 0;
  }

  defaultMessage(): string {
    return 'משך הטיפול חייב להיות כפולה של 15';
  }
}
