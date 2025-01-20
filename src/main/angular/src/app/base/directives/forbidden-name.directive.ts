import {Directive, Input} from '@angular/core';
import {AbstractControl, NG_VALIDATORS, ValidationErrors, Validator, ValidatorFn} from '@angular/forms';

export function forbiddenNameValidator(nameRe: RegExp): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const forbidden = nameRe.test(control.value);
    return forbidden ? {forbiddenName: {value: control.value}} : null;
  };
}

@Directive({
    selector: '[forbiddenName]',
    providers: [{ provide: NG_VALIDATORS, useExisting: ForbiddenNameDirective, multi: true }],
    standalone: false
})
export class ForbiddenNameDirective implements Validator {
  @Input('forbiddenName') forbiddenName = '';

  validate(control: AbstractControl): ValidationErrors | null {
    return this.forbiddenName ? forbiddenNameValidator(new RegExp('^' + this.forbiddenName + '$', 'i'))(control) : null;
  }
}
