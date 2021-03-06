import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';

import { ElasticService } from '../service/elastic.service';
import { MessagesService } from '../../base/services/messages.service';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';


@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit, AfterViewInit {

  indices: any[];
  aliases: any;
  aliasForm: FormGroup;
  indexList: string[] = [];


  constructor(private elastic: ElasticService,
    private message: MessagesService,
    private builder: FormBuilder,
    private router: Router, ) { }

  ngOnInit() {
    this.list();
    this.aliasForm = this.builder.group({
      indexAliases: this.builder.array([this.initAliasForm()])
    });
  }

  ngAfterViewInit() {

  }

  initAliasForm() {
    return this.builder.group({
      action: 'add',
      index: '',
      alias: ''
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
      this.indices = await this.elastic.listAllIndices();
      this.aliases = await this.elastic.listAliases();

      this.indices.sort((a, b) => {
        if (a.index < b.index) {
          return -1;
        } else if (a.index > b.index) {
          return 1;
        } else {
          return 0;
        }
      });

      this.indices.map(index => {
        if (index.status === 'open') {
        index.alias = Object.keys(this.aliases[index.index].aliases);
        }
      });
    } catch (e) {
      this.message.error(e);
    }
  }

  goTo(destination) {
    this.router.navigate(['elastic/index', destination]);
  }

  addNewIndex() {
    this.goTo('new');
  }

  async delete(index) {
    if (confirm('you\'re about 2 delete ' + index.index)) {
      try {
        const res = await this.elastic.delete(index.index);
        const pos = this.indices.indexOf(index);
        this.indices.splice(pos, 1);
        this.message.success('deleted ' + index.index + '\n' + JSON.stringify(res));
      } catch (e) {
        this.message.error(e);
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
    aliases.indexAliases.forEach(alias => {
      switch (alias.action) {
        case 'add': {
          this.elastic.addAlias(alias.index, alias.alias)
            .then(response => this.message.info(JSON.stringify(response)))
            .catch(err => {
              this.message.error(err);
            })
          break;
        }
        case 'remove': {
          let a2remove: string;
          if (alias.alias.includes(',')) {
            a2remove = prompt('which one?');
          } else {
            a2remove = alias.alias;
          }
          this.elastic.removeAlias(alias.index, a2remove)
            .then(response => this.message.info(JSON.stringify(response)))
            .catch(err => {
              this.message.error(err);
            })
          break;
        }
      }
      this.list();
    });
  }
}
