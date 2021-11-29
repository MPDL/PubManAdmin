import {Component, OnInit} from '@angular/core';
import {FormGroup, FormArray, FormBuilder, Validators} from '@angular/forms';
import {MessagesService} from '../../base/services/messages.service';
import {ElasticService} from '../services/elastic.service';
import {SearchService} from '../../base/common/services/search.service';
import {SearchRequest, SearchTerm} from '../../base/common/components/search-term/search.term';

@Component({
  selector: 'elastic-search-component',
  templateUrl: './elastic-search.component.html',
  styleUrls: ['./elastic-search.component.scss'],
})
export class ElasticSearchComponent implements OnInit {
  searchForm: FormGroup;
  searchRequest: SearchRequest;
  searchResult: any;
  sourceList: any[];
  targetList: any[];

  fields2Select: string[] = [];

  constructor(
    private elasticService: ElasticService,
    private formBuilder : FormBuilder,
    private messagesService: MessagesService,
    private searchservice: SearchService,
  ) {}

  ngOnInit() {
    this.searchForm = this.formBuilder.group({
      remoteUrl: '',
      sourceIndex: ['', Validators.required],
      targetIndex: ['', Validators.required],
      searchTerms: this.formBuilder.array([this.initSearchTerm()]),
    });
    this.getList();
  }

  async changeList() {
    const remoteUrl = this.searchForm.get('remoteUrl').value;
    try {
      this.sourceList = await this.elasticService.listRemoteIndices(remoteUrl);
    } catch (e) {
      this.messagesService.error(e);
    }
  }

  async getList() {
    try {
      this.sourceList = await this.elasticService.listAllIndices();
      this.targetList = this.sourceList;
    } catch (e) {
      this.messagesService.error(e);
    }
  }

  initSearchTerm() {
    return this.formBuilder.group({
      type: '',
      field: '',
      searchTerm: '',
    });
  }

  get searchTerms(): FormArray {
    return this.searchForm.get('searchTerms') as FormArray;
  }

  addSearchTerm() {
    this.searchTerms.push(this.initSearchTerm());
  }

  removeSearchTerm(i: number) {
    this.searchTerms.removeAt(i);
  }

  handleNotification(event: string, index) {
    if (event === 'add') {
      this.addSearchTerm();
    } else if (event === 'remove') {
      this.removeSearchTerm(index);
    }
  }

  import() {
    if (this.searchForm.valid) {
      const url = this.searchForm.get('remoteUrl').value;
      const source = this.searchForm.get('sourceIndex').value;
      const target = this.searchForm.get('targetIndex').value;
      this.searchRequest = this.prepareRequest();
      const body = this.searchservice.buildQuery(this.searchRequest, -1, 0, '_id', 'asc');
      this.elasticService.scrollwithcallback(url, source, body, async (cb) => {
        const docs = [];
        cb.forEach(async (doc) => {
          const temp = {index: {_index: target, _type: doc._type, _id: doc._id}};
          docs.push(temp);
          docs.push(doc._source);
        });
        try {
          const go4it = await this.elasticService.bulkIndex(docs);
          this.messagesService.success(JSON.stringify(go4it));
        } catch (e) {
          this.messagesService.error(e);
        }
      });
    } else {
      this.messagesService.error('form invalid? '+this.searchForm.hasError);
    }
  }

  search() {
    this.searchRequest = this.prepareRequest();
    const preparedBody = this.searchservice.buildQuery(this.searchRequest, 25, 0, '_id', 'asc');
    this.searchSelectedIndex(preparedBody);
  }

  prepareRequest(): SearchRequest {
    const model = this.searchForm.value;
    const searchTerms2Save: SearchTerm[] = model.searchTerms.map(
      (term: SearchTerm) => Object.assign({}, term)
    );
    const request: SearchRequest = {
      searchTerms: searchTerms2Save,
    };
    return request;
  }

  searchSelectedIndex(body) {
    let url;
    if (this.searchForm.get('remoteUrl').value != '') {
      url = this.searchForm.get('remoteUrl').value;
    } else {
      url = null;
    }
    const index = this.searchForm.get('sourceIndex').value;
    this.elasticService.scrollwithcallback(url, index, body, (hits) => {
      this.searchResult = hits;
    });
  }

  async reindex() {
    const source = this.searchForm.get('sourceIndex').value;
    const dest = this.searchForm.get('targetIndex').value;
    const body = {source: {index: source}, dest: {index: dest}};
    try {
      const response = await this.elasticService.reindex(body);
      this.messagesService.success(JSON.stringify(response));
    } catch (e) {
      this, this.messagesService.error(e);
    }
  }

  notyet(name) {
    alert('this method is not yet implemented 4 ' + name);
  }
}
