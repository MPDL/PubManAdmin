import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {MessagesService} from '../../base/services/messages.service';
import {ElasticService} from '../services/elastic.service';

@Component({
  selector: 'index-detail-component',
  templateUrl: './index-detail.component.html',
  styleUrls: ['./index-detail.component.scss'],
})
export class IndexDetailComponent implements OnInit, OnDestroy {
  @ViewChild('new_index_form')
    indexform: NgForm;

  remote: string;
  index;
  indexName: string;
  indexInfo: any;
  isNewIndex: boolean = false;
  list: any[];
  settings: any;
  selectedSettings: { settings: { index: { version: any; provided_name: any; creation_date: any; uuid: any; }; }; };
  mapping: any;
  selectedMapping: any;
  aliases: {};

  routeSubscription: Subscription;

  constructor(
    private activatedRoute: ActivatedRoute,
    private elasticService: ElasticService,
    private messagesService: MessagesService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.routeSubscription = this.activatedRoute.params.subscribe((data) => {
      const name = data['name'];
      this.indexName = name;
    });
    if (this.indexName !== 'new') {
      this.getIndex(this.indexName);
      this.getIndexInfo(this.indexName);
    } else {
      this.isNewIndex = true;
      this.getList();
    }
  }

  ngOnDestroy() {
    this.routeSubscription.unsubscribe();
  }

  async getIndex(name: string) {
    try {
      this.index = await this.elasticService.getIndex(name);
      this.settings = this.index[name].settings;
      this.mapping = this.index[name].mappings;
      this.aliases = this.index[name].aliases;
    } catch (e) {
      this.messagesService.error(e);
    }
  }

  async addAlias(index: string) {
    try {
      const alias = prompt('new alias name:');
      await this.elasticService.addAlias(index, alias);
      this.messagesService.success('added alias ' + alias + ' to index ' + index);
      this.getIndex(index);
    } catch (e) {
      this.messagesService.error(e);
    }
  }

  async removeAlias(index: string) {
    try {
      let alias: string;
      const aliases = Object.keys(this.index[this.indexName].aliases);
      if (aliases.length > 1) {
        alias = prompt('which one?');
      } else if (aliases.length === 1) {
        alias = aliases[0];
      }
      await this.elasticService.removeAlias(index, alias);
      this.messagesService.success('removed alias ' + alias + ' from index ' + index);
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

  async getIndexInfo(index: any) {
    try {
      this.list = await this.elasticService.listAllIndices();
      const selected = this.list.filter((response) => response.index === index);
      if (selected.length === 1) {
        this.indexInfo = selected[0];
      }
    } catch (e) {
      this.messagesService.error(e);
    }
  }

  async getRemoteList(host: string) {
    this.remote = host;
    try {
      this.list = await this.elasticService.listRemoteIndices(this.remote);
    } catch (e) {
      this.messagesService.error(e);
    }
  }

  async onChangeSettings(index: string) {
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

  cloneSettings(settings: { settings: { index: { version: any; provided_name: any; creation_date: any; uuid: any; }; }; }) {
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

  async onChangeMappings(index: string) {
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
    this.router.navigate(['elastic', 'index']);
  }

  remoteList() {
    const host = prompt('where from?');
    this.getRemoteList(host);
  }

  async save() {
    let msg = 'saving ' + this.indexName + '\n';
    msg = msg.concat('with seleted settings / mapping');

    if (confirm(msg)) {
      const body = {};
      Object.assign(body, this.selectedSettings, this.selectedMapping);
      try {
        const response = await this.elasticService.createIndex(this.indexName, body);
        this.messagesService.success('created index ' + this.indexName + '\n' + JSON.stringify(response));
      } catch (e) {
        this.messagesService.error(e);
      }
    }
  }

  async openOrClose(index: { status: string; index: string; }) {
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

  notyet(name: string) {
    alert('this method is not yet implemented 4 ' + name);
  }
}
