import {Directive, Input} from '@angular/core';
import {AbstractControl, NG_VALIDATORS, ValidationErrors, Validator, ValidatorFn} from '@angular/forms';

export function forbiddenCharacterValidator(characterRe: RegExp): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const forbidden = characterRe.test(control.value);
    return forbidden ? {forbiddenCharacter: {value: control.value}} : null;
  };
}

@Directive({
    selector: '[forbiddenCharacter]',
    providers: [{ provide: NG_VALIDATORS, useExisting: ForbiddenCharacterDirective, multi: true }],
    standalone: false
})
export class ForbiddenCharacterDirective implements Validator {
  @Input('forbiddenCharacter') forbiddenCharacter = '';

  validate(control: AbstractControl): ValidationErrors | null {
    return this.forbiddenCharacter ? forbiddenCharacterValidator(new RegExp('[' + this.forbiddenCharacter + ']'))(control) : null;
  }
}
