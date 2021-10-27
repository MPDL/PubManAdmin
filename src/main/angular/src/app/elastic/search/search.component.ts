import {Component, OnInit} from '@angular/core';
import {FormGroup, FormArray, FormBuilder, Validators} from '@angular/forms';
import {MessagesService} from '../../base/services/messages.service';
import {ElasticService} from '../service/elastic.service';
import {SearchService} from '../../base/common/services/search.service';
import {SearchRequest, SearchTerm} from '../../base/common/components/search-term/search.term';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {
  searchForm: FormGroup;
  searchRequest: SearchRequest;
  searchResult: any;
  source_list: any[];
  target_list: any[];

  fields2Select: string[] = [];

  constructor(
    private fb : FormBuilder,
    private service: ElasticService,
    private searchservice: SearchService,
    private message: MessagesService
  ) {}

  ngOnInit() {
    this.searchForm = this.fb.group({
      remote_url: '',
      source_index: ['', Validators.required],
      target_index: ['', Validators.required],
      searchTerms: this.fb.array([this.initSearchTerm()]),
    });
    this.getList();
  }

  async changeList() {
    const remoteUrl = this.searchForm.get('remote_url').value;
    try {
      this.source_list = await this.service.listRemoteIndices(remoteUrl);
    } catch (e) {
      this.message.error(e);
    }
  }

  async getList() {
    try {
      this.source_list = await this.service.listAllIndices();
      this.target_list = this.source_list;
    } catch (e) {
      this.message.error(e);
    }
  }

  initSearchTerm() {
    return this.fb.group({
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
      const url = this.searchForm.get('remote_url').value;
      const source = this.searchForm.get('source_index').value;
      const target = this.searchForm.get('target_index').value;
      this.searchRequest = this.prepareRequest();
      const body = this.searchservice.buildQuery(this.searchRequest, -1, 0, '_id', 'asc');
      this.service.scrollwithcallback(url, source, body, async (cb) => {
        const docs = [];
        cb.forEach(async (doc) => {
          const temp = {index: {_index: target, _type: doc._type, _id: doc._id}};
          docs.push(temp);
          docs.push(doc._source);
        });
        try {
          const go4it = await this.service.bulkIndex(docs);
          this.message.success(JSON.stringify(go4it));
        } catch (e) {
          this.message.error(e);
        }
      });
    } else {
      this.message.error('form invalid? '+this.searchForm.hasError);
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
    if (this.searchForm.get('remote_url').value != '') {
      url = this.searchForm.get('remote_url').value;
    } else {
      url = null;
    }
    const index = this.searchForm.get('source_index').value;
    this.service.scrollwithcallback(url, index, body, (hits) => {
      this.searchResult = hits;
    });
  }

  async reindex() {
    const source = this.searchForm.get('source_index').value;
    const dest = this.searchForm.get('target_index').value;
    const body = {source: {index: source}, dest: {index: dest}};
    try {
      const result = await this.service.reindex(body);
      this.message.success(JSON.stringify(result));
    } catch (e) {
      this, this.message.error(e);
    }
  }

  notyet(name) {
    alert('this method is not yet implemented 4 ' + name);
  }
}
