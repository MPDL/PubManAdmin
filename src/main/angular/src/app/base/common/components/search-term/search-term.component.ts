import {Component, Input, Output, EventEmitter} from '@angular/core';
import {UntypedFormGroup} from '@angular/forms';

export const queryTypes = ['must', 'must_not', 'filter', 'should'];

@Component({
  selector: 'search-term-component',
  templateUrl: './search-term.component.html',
  styleUrls: ['./search-term.component.scss'],
})
export class SearchTermComponent {
  @Input()
    searchTermForm: UntypedFormGroup;
  @Input()
    fields: string[];

  @Output()
    notice = new EventEmitter<string>();

  filteredTerms: string[] = [];
  types: string[] = queryTypes;

  addSearchTerm() {
    this.notice.emit('add');
  }

  close() {
    this.searchTermForm.patchValue({field: ''});
    this.filteredTerms = [];
  }

  filter() {
    const selectedField = this.searchTermForm.get('field') as UntypedFormGroup;
    if (selectedField.value !== '') {
      this.filteredTerms = this.fields.filter((el) => {
        return el.toLowerCase().indexOf(selectedField.value.toLowerCase()) > -1;
      });
    } else {
      this.filteredTerms = [];
    }
  }

  onQueryTypeSelect(type: any) {
    this.searchTermForm.patchValue({type: type});
  }

  removeSearchTerm() {
    this.notice.emit('remove');
  }

  select(term: any) {
    this.searchTermForm.patchValue({field: term});
    this.filteredTerms = [];
  }
}
