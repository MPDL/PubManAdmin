import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[selectedItemColor]'
})
export class SelectedItemColourDirective {

  constructor(private elemRef: ElementRef) { }
  
    @Input('selectedItemColor') selectedcolor: string;
    @Input() defaultColor: string;
  
    @HostListener('mouseenter') onMouseEnter() {
      this.highlight(this.selectedcolor || this.defaultColor || 'silver');
    }
  
    @HostListener('mouseleave') onMouseLeave() {
      this.highlight(null);
    }
  
    highlight(color: string) {
      this.elemRef.nativeElement.style.backgroundColor = color;
    }

}