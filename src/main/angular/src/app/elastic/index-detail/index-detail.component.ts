import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { MessagesService } from '../../base/services/messages.service';
import { ElasticService } from '../service/elastic.service';
import { NgForm } from '@angular/forms';

@Component({
  // selector: 'app-indices-detail',
  templateUrl: './index-detail.component.html',
  styleUrls: ['./index-detail.component.scss']
})
export class IndexDetailComponent implements OnInit, OnDestroy {

  @ViewChild('new_index_form') indexform: NgForm;

  remote;
  index;
  index_name;
  index_info;
  isNewIndex: boolean = false;
  list: any[];
  settings;
  selectedSettings;
  mapping;
  selectedMapping;
  aliases;
  
  subscription: Subscription;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private service: ElasticService,
    private message: MessagesService) { }

  ngOnInit() {
    this.subscription = this.route.params
      .subscribe(params => {
        const name = params['name'];
        this.index_name = name;
      });
    if (this.index_name !== 'new') {
      this.getIndex(this.index_name);
      this.getIndexInfo(this.index_name);
    } else {
      this.isNewIndex = true;
      this.getList();
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  async getIndex(name) {
    try {
      this.index = await this.service.getIndex(name);
      this.settings = this.index[name].settings;
      this.mapping = this.index[name].mappings;
      this.aliases = this.index[name].aliases;
    } catch(e) {
      this.message.error(e);
    }
  }

  async addAlias(index) {
    try {
      let alias = prompt('new alias name:');
      let response = await this.service.addAlias(index, alias);
      this.message.success(JSON.stringify(response));
      this.getIndex(index);
    } catch (e) {
      this.message.error(e);
    }
  }

  async removeAlias(index) {
    try {
      let alias;
      let aliases = Object.keys(this.index[this.index_name].aliases);
      if (aliases.length > 1) {
        alias = prompt('which one?');
      } else if (aliases.length === 1) {
        alias = aliases[0];
      }
      let response = await this.service.removeAlias(index, alias);
      this.message.success(JSON.stringify(response));
      this.getIndex(index);
    } catch (e) {
      this.message.error(e);
    }
  }

  async getList() {
    try {
      this.list = await this.service.listAllIndices();
    } catch (e) {
      this.message.error(e);
    }
  }

  async getIndexInfo(index) {
    try {
      this.list = await this.service.listAllIndices();
      let selected = this.list.filter(result => result.index === index);
      if (selected.length === 1) {
        this.index_info = selected[0];
      }
    } catch (e) {
      this.message.error(e);
    }
  }

  async getRemoteList(host) {
    this.remote = host;
    try {
      this.list = await this.service.listRemoteIndices(this.remote);
    } catch (e) {
      this.message.error(e);
    }
  }

  async onChangeSettings(index) {
    try {
      if (this.remote != null) {
        const settings = await this.service.getRemoteSettings4Index(this.remote, index);
        this.selectedSettings = this.cloneSettings(settings[index]);
      } else {
        const settings = await this.service.getSettings4Index(index);
        this.selectedSettings = this.cloneSettings(settings[index]);
      }
    } catch (e) {
      this.message.error(e);
    }
  }

  cloneSettings(settings) {
    if (settings.settings.index.version) { delete settings.settings.index.version; }
    if (settings.settings.index.provided_name) { delete settings.settings.index.provided_name; }
    if (settings.settings.index.creation_date) { delete settings.settings.index.creation_date; }
    if (settings.settings.index.uuid) { delete settings.settings.index.uuid; }
    return settings;
  }

  async onChangeMappings(index) {
    try {
      if (this.remote != null) {
        const mapping = await this.service.getRemoteMapping4Index(this.remote, index);
        this.selectedMapping = mapping[index];
      } else {
        const mapping = await this.service.getMapping4Index(index);
        this.selectedMapping = mapping[index];
      }
    } catch (e) {
      this.message.error(e);
    }
  }

  gotoList() {
    this.router.navigate(['elastic/index']);
  }

  remoteList() {
    let host = prompt('where from?');
    this.getRemoteList(host);
  }

  async save() {
    if (this.indexform.valid) {
      let msg = 'saving ' + this.index_name + '\n';
      msg = msg.concat('with seleted settings / mapping');

      if (confirm(msg)) {
        const body = {};
        Object.assign(body, this.selectedSettings, this.selectedMapping);
        try {
          const res = await this.service.create(this.index_name, body);
          this.message.success('created index ' + this.index_name + '\n' + JSON.stringify(res));
        } catch (e) {
          this.message.error(e);
        }
      }
    } else {
      alert('OOOPS! ' + this.indexform.valid);
    }
  }

  async openOrClose(index) {
    try {
      if (index.status === 'open') {
        const response = await this.service.closeIndex(index.index);
        this.message.success(JSON.stringify(response));
        this.getIndexInfo(index.index);
      } else {
        const response = await this.service.openIndex(index.index);
        this.message.success(JSON.stringify(response));
        this.getIndexInfo(index.index);
      }
    } catch (e) {
      this.message.error(e);
    }

  }

  notyet(name) {
    alert('this method is not yet implemented 4 ' + name);
  }
}
