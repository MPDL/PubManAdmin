import { Component, OnInit, ViewChild } from '@angular/core';
import { MessagesService } from '../../base/services/messages.service';
import { ElasticService } from '../service/elastic.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  @ViewChild('import_form') importform: NgForm;

  importing: boolean = false;
  import_url;
  source_index;
  target_index;
  filter_term;

  constructor(private service: ElasticService,
      private message: MessagesService) { }

  ngOnInit() {
  }

  importDocs(name) {
    this.importing = true;
  }

  import() {
    if (this.importform.valid) {
      let url = this.import_url;
      let index = this.source_index;
      let term = this.filter_term;
      this.service.scrollwithcallback(url, index, term, async (cb) => {
        let docs = [];
        cb.forEach(async doc => {
          let temp = {index: {_index:this.target_index, _type:doc._type, _id:doc._id}};
          docs.push(temp);
          docs.push(doc._source);
        });
        try {
          let go4it = await this.service.bulkIndex(docs);
          this.message.success(JSON.stringify(go4it));
        } catch(e) {
          this.message.error(e);
        }
      });
    } else {
      this.message.error('form invalid? '+this.importform.hasError)
    }
  }

  cancelImport() {
    this.importing = false;
  }

  notyet(name) {
    alert('this method is not yet implemented 4 ' + name);
  }
}
