import {Component, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {Router} from '@angular/router';
import {MessagesService} from '../../base/services/messages.service';
import {ElasticService} from '../services/elastic.service';

@Component({
  selector: 'index-list-component',
  templateUrl: './index-list.component.html',
  styleUrls: ['./index-list.component.scss'],
})
export class IndexListComponent implements OnInit {
  indices: any[];
  aliases: any;
  aliasForm: FormGroup;
  indexList: string[] = [];

  constructor(
    private elasticService: ElasticService,
    private messagesService: MessagesService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.list();
  }

  addNewIndex() {
    this.goTo('new');
  }

  async delete(index: { index: string; }) {
    if (confirm('Delete index ' + index.index + '?')) {
      try {
        const response = await this.elasticService.deleteIndex(index.index);
        this.list();
        this.messagesService.success('deleted ' + index.index + '\n' + JSON.stringify(response));
      } catch (e) {
        this.messagesService.error(e);
      }
    }
  }

  goTo(destination: string) {
    this.router.navigate(['elastic', 'index', destination]);
  }

  async list() {
    try {
      this.indices = await this.elasticService.listAllIndices();
      this.aliases = await this.elasticService.listAliases();

      this.indices.sort((a, b) => {
        if (a.index < b.index) {
          return -1;
        } else if (a.index > b.index) {
          return 1;
        } else {
          return 0;
        }
      });

      this.indices.map((index) => {
        if (index.status === 'open') {
          index.alias = Object.keys(this.aliases[index.index].aliases);
        }
      });
    } catch (e) {
      this.messagesService.error(e);
    }
  }
}
