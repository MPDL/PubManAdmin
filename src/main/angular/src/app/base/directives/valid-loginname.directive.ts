import {Directive} from '@angular/core';
import {AbstractControl, NG_VALIDATORS, ValidationErrors, Validator, ValidatorFn} from '@angular/forms';

export function validLoginnameValidator(nameRe: RegExp): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const allowed = nameRe.test(control.value);
    return !allowed ? {validLoginname: {value: control.value}} : null;
  };
}

@Directive({
    selector: '[validLoginname]',
    providers: [{ provide: NG_VALIDATORS, useExisting: ValidLoginnameDirective, multi: true }],
    standalone: false
})
export class ValidLoginnameDirective implements Validator {
  regex: string = '^[A-Za-z0-9@_\\-\\.]*$';
  validate(control: AbstractControl): ValidationErrors | null {
    return control.value ? validLoginnameValidator(new RegExp(this.regex))(control) : null;
  }
}
