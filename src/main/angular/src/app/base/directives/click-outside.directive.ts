import {Directive, ElementRef, Output, EventEmitter, HostListener} from '@angular/core';

@Directive({
  selector: '[click-outside]',
})
export class ClickOutsideDirective {
  @Output()
    clickoutside = new EventEmitter();

  constructor(
    private elementRef: ElementRef
  ) {}

  @HostListener('document:click', ['$event.target'])
  onClick(targetElement) {
    const clickedInside = this.elementRef.nativeElement.contains(targetElement);

    if (!clickedInside) {
      this.clickoutside.emit(null);
    }
  }
}
