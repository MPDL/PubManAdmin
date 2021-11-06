import {Component, OnInit, OnDestroy, ViewChild} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {Subscription} from 'rxjs';

import {MessagesService} from '../../base/services/messages.service';
import {ElasticService} from '../services/elastic.service';
import {NgForm} from '@angular/forms';

@Component({
  selector: 'index-detail-component',
  templateUrl: './index-detail.component.html',
  styleUrls: ['./index-detail.component.scss'],
})
export class IndexDetailComponent implements OnInit, OnDestroy {
  @ViewChild('new_index_form')
    indexform: NgForm;

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private elasticService: ElasticService,
    private messagesService: MessagesService
  ) {}

  ngOnInit() {
    this.subscription = this.route.params
      .subscribe((params) => {
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
      this.index = await this.elasticService.getIndex(name);
      this.settings = this.index[name].settings;
      this.mapping = this.index[name].mappings;
      this.aliases = this.index[name].aliases;
    } catch (e) {
      this.messagesService.error(e);
    }
  }

  async addAlias(index) {
    try {
      const alias = prompt('new alias name:');
      const response = await this.elasticService.addAlias(index, alias);
      this.messagesService.success(JSON.stringify(response));
      this.getIndex(index);
    } catch (e) {
      this.messagesService.error(e);
    }
  }

  async removeAlias(index) {
    try {
      let alias;
      const aliases = Object.keys(this.index[this.index_name].aliases);
      if (aliases.length > 1) {
        alias = prompt('which one?');
      } else if (aliases.length === 1) {
        alias = aliases[0];
      }
      const response = await this.elasticService.removeAlias(index, alias);
      this.messagesService.success(JSON.stringify(response));
      this.getIndex(index);
    } catch (e) {
      this.messagesService.error(e);
    }
  }

  async getList() {
    try {
      this.list = await this.elasticService.listAllIndices();
    } catch (e) {
      this.messagesService.error(e);
    }
  }

  async getIndexInfo(index) {
    try {
      this.list = await this.elasticService.listAllIndices();
      const selected = this.list.filter((result) => result.index === index);
      if (selected.length === 1) {
        this.index_info = selected[0];
      }
    } catch (e) {
      this.messagesService.error(e);
    }
  }

  async getRemoteList(host) {
    this.remote = host;
    try {
      this.list = await this.elasticService.listRemoteIndices(this.remote);
    } catch (e) {
      this.messagesService.error(e);
    }
  }

  async onChangeSettings(index) {
    try {
      if (this.remote != null) {
        const settings = await this.elasticService.getRemoteSettings4Index(this.remote, index);
        this.selectedSettings = this.cloneSettings(settings[index]);
      } else {
        const settings = await this.elasticService.getSettings4Index(index);
        this.selectedSettings = this.cloneSettings(settings[index]);
      }
    } catch (e) {
      this.messagesService.error(e);
    }
  }

  cloneSettings(settings) {
    if (settings.settings.index.version) {
      delete settings.settings.index.version;
    }
    if (settings.settings.index.provided_name) {
      delete settings.settings.index.provided_name;
    }
    if (settings.settings.index.creation_date) {
      delete settings.settings.index.creation_date;
    }
    if (settings.settings.index.uuid) {
      delete settings.settings.index.uuid;
    }
    return settings;
  }

  async onChangeMappings(index) {
    try {
      if (this.remote != null) {
        const mapping = await this.elasticService.getRemoteMapping4Index(this.remote, index);
        this.selectedMapping = mapping[index];
      } else {
        const mapping = await this.elasticService.getMapping4Index(index);
        this.selectedMapping = mapping[index];
      }
    } catch (e) {
      this.messagesService.error(e);
    }
  }

  gotoList() {
    this.router.navigate(['elastic/index']);
  }

  remoteList() {
    const host = prompt('where from?');
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
          const res = await this.elasticService.create(this.index_name, body);
          this.messagesService.success('created index ' + this.index_name + '\n' + JSON.stringify(res));
        } catch (e) {
          this.messagesService.error(e);
        }
      }
    } else {
      alert('OOOPS! ' + this.indexform.valid);
    }
  }

  async openOrClose(index) {
    try {
      if (index.status === 'open') {
        const response = await this.elasticService.closeIndex(index.index);
        this.messagesService.success(JSON.stringify(response));
        this.getIndexInfo(index.index);
      } else {
        const response = await this.elasticService.openIndex(index.index);
        this.messagesService.success(JSON.stringify(response));
        this.getIndexInfo(index.index);
      }
    } catch (e) {
      this.messagesService.error(e);
    }
  }

  notyet(name) {
    alert('this method is not yet implemented 4 ' + name);
  }
}
