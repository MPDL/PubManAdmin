import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import {ElasticService} from '../services/elastic.service';
import {MessagesService} from '../../base/services/messages.service';
import {FormGroup, FormBuilder, FormArray} from '@angular/forms';

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
    private formBuilder: FormBuilder,
    private messagesService: MessagesService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.list();
    this.aliasForm = this.formBuilder.group({
      indexAliases: this.formBuilder.array([this.initAliasForm()]),
    });
  }

  initAliasForm() {
    return this.formBuilder.group({
      action: 'add',
      index: '',
      alias: '',
    });
  }

  get indexAliases(): FormArray {
    return this.aliasForm.get('indexAliases') as FormArray;
  }

  addAlias() {
    this.indexAliases.push(this.initAliasForm());
  }

  removeAlias(i: number) {
    this.indexAliases.removeAt(i);
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

  goTo(destination) {
    this.router.navigate(['elastic', 'index', destination]);
  }

  addNewIndex() {
    this.goTo('new');
  }

  async delete(index) {
    if (confirm('you\'re about 2 delete ' + index.index)) {
      try {
        const response = await this.elasticService.delete(index.index);
        const pos = this.indices.indexOf(index);
        this.indices.splice(pos, 1);
        this.messagesService.success('deleted ' + index.index + '\n' + JSON.stringify(response));
      } catch (e) {
        this.messagesService.error(e);
      }
    }
  }

  handleNotification(event: string, index) {
    if (event === 'add') {
      this.addAlias();
    } else if (event === 'remove') {
      this.removeAlias(index);
    }
  }

  submit() {
    const aliases = this.aliasForm.value;
    aliases.indexAliases.forEach((alias) => {
      switch (alias.action) {
      case 'add': {
        this.elasticService.addAlias(alias.index, alias.alias)
          .then((response) => this.messagesService.info(JSON.stringify(response)))
          .catch((error) => {
            this.messagesService.error(error);
          });
        break;
      }
      case 'remove': {
        let a2remove: string;
        if (alias.alias.includes(',')) {
          a2remove = prompt('which one?');
        } else {
          a2remove = alias.alias;
        }
        this.elasticService.removeAlias(alias.index, a2remove)
          .then((response) => this.messagesService.info(JSON.stringify(response)))
          .catch((error) => {
            this.messagesService.error(error);
          });
        break;
      }
      }
      this.list();
    });
  }
}
