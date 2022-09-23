import {Component, OnInit} from '@angular/core';
import {UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {SearchRequest, SearchTerm} from '../../base/common/components/search-term/search.term';
import {SearchService} from '../../base/common/services/search.service';
import {MessagesService} from '../../base/services/messages.service';
import {ElasticService} from '../services/elastic.service';

@Component({
  selector: 'elastic-search-component',
  templateUrl: './elastic-search.component.html',
  styleUrls: ['./elastic-search.component.scss'],
})
export class ElasticSearchComponent implements OnInit {
  fields2Select: string[] = [];
  searchForm: UntypedFormGroup;
  searchRequest: SearchRequest;
  searchResult: any[];
  sourceList: any[];

  get searchTerms(): UntypedFormArray {
    return this.searchForm.get('searchTerms') as UntypedFormArray;
  }

  constructor(
    private elasticService: ElasticService,
    private formBuilder : UntypedFormBuilder,
    private messagesService: MessagesService,
    private searchservice: SearchService,
  ) {}

  ngOnInit() {
    this.searchForm = this.formBuilder.group({
      sourceIndex: ['', Validators.required],
      searchTerms: this.formBuilder.array([this.initSearchTerm()]),
    });

    this.getList();
  }

  handleNotification(event: string, index: number) {
    if (event === 'add') {
      this.addSearchTerm();
    } else if (event === 'remove') {
      this.removeSearchTerm(index);
    }
  }

  search() {
    this.searchRequest = this.prepareRequest();
    const preparedBody = this.searchservice.buildQuery(this.searchRequest, 25, 0, '_id', 'asc');
    this.searchSelectedIndex(preparedBody);
  }

  private prepareRequest(): SearchRequest {
    const model = this.searchForm.value;
    const searchTerms2Save: SearchTerm[] = model.searchTerms.map(
      (term: SearchTerm) => Object.assign({}, term)
    );
    const request: SearchRequest = {
      searchTerms: searchTerms2Save,
    };
    return request;
  }

  private addSearchTerm() {
    this.searchTerms.push(this.initSearchTerm());
  }

  private async getList() {
    try {
      this.sourceList = await this.elasticService.listAllIndices();
    } catch (e) {
      this.messagesService.error(e);
    }
  }

  private initSearchTerm() {
    return this.formBuilder.group({
      type: 'must',
      field: '',
      searchTerm: '',
    });
  }

  private removeSearchTerm(i: number) {
    if (i !== 0) {
      this.searchTerms.removeAt(i);
    }
  }

  private searchSelectedIndex(body: object) {
    const index = this.searchForm.get('sourceIndex').value;
    this.elasticService.scroll(index, body)
      .then(
        (data) => this.searchResult = data,
        (error) => this.messagesService.error(error)
      );
  }
}
