import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {Observable} from 'rxjs';
import {FormGroup} from '@angular/forms';
import {distinctUntilChanged, switchMap, debounceTime} from 'rxjs/operators';
import {PubmanRestService} from '../../../services/pubman-rest.service';
import {mpgOus4auto} from '../../model/query-bodies';
import {environment} from '../../../../../environments/environment';

@Component({
  selector: 'suggestion-component',
  templateUrl: './suggestion.component.html',
  styleUrls: ['./suggestion.component.scss'],
})
export class SuggestionComponent implements OnInit {
  @Input()
    form: FormGroup;
  @Input()
    placeholder;
  @Input()
    color: string = 'primary';

  @Output()
    selectedSuggestion = new EventEmitter<any>();

  url: string = environment.rest_ous;
  searchResult: Observable<any>;

  constructor(
    private service: PubmanRestService
  ) {}

  ngOnInit() {
    this.searchResult = this.getListOfSuggestions(this.form.get('suggestion').valueChanges);
  }

  getListOfSuggestions(term: Observable<any>, wait = 400) {
    return term.pipe(
      debounceTime(wait),
      distinctUntilChanged(),
      switchMap((val) => this.search(val))
    );
  }

  search(val) {
    const body = mpgOus4auto;
    body.query.bool.must.term['metadata.name.auto'] = val;
    return this.service.query(this.url, null, body);
  }

  filter(selected) {
    this.selectedSuggestion.emit(selected);
    this.close();
  }

  close() {
    this.form.get('suggestion').patchValue('');
  }
}
