import {Directive, ElementRef, HostListener, Output, EventEmitter} from '@angular/core';

@Directive({
    selector: '[clickOutside]',
    standalone: true
})
export class ClickOutsideDirective {
  @Output()
    clickOutside: EventEmitter<any> = new EventEmitter();

  constructor(
    private _elementRef: ElementRef,
  ) {}

  @HostListener('document:click', ['$event.target']) onMouseEnter(targetElement) {
    const clickedInside = this._elementRef.nativeElement.contains(targetElement);
    if (!clickedInside) {
      this.clickOutside.emit(null);
    }
  }
}
