import { Directive, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NG_VALIDATORS, Validator, Validators, ValidatorFn, AbstractControl } from '@angular/forms';

export function valueValidator(regex: RegExp): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} => {
    const notAllowed = regex.test(control.value);
    return notAllowed ? {'valueNotAllowed': {value: control.value}} : null;
  };
}

@Directive({
  selector: '[valueNotAllowed]',
  providers: [{provide: NG_VALIDATORS, useExisting: ValueNotAllowedDirective, multi: true}]
})
export class ValueNotAllowedDirective implements Validator {

  @Input() valueNotAllowed: string;

  constructor() { }

  validate(c: AbstractControl): {[key: string]: any} {
    return this.valueNotAllowed ? valueValidator(new RegExp(this.valueNotAllowed, 'i'))(c) : null;
  }

}
