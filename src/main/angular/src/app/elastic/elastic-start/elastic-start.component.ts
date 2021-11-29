import {Component, OnInit} from '@angular/core';
import {ElasticService} from '../services/elastic.service';
import {MessagesService} from '../../base/services/messages.service';

@Component({
  selector: 'elastic-start-component',
  templateUrl: './elastic-start.component.html',
  styleUrls: ['./elastic-start.component.scss'],
})
export class ElasticStartComponent implements OnInit {
  info: any;
  host: any;

  constructor(
    private elasticService: ElasticService,
    private messagesService: MessagesService,
  ) {}

  ngOnInit() {
    this.getInfo();
  }

  async getInfo() {
    try {
      this.info = await this.elasticService.info_api();
    } catch (e) {
      this.messagesService.error(e);
      this.info = null;
    }
  }

  connect2(server) {
    this.host = server;
    this.elasticService.connect2(this.host);
    this.getInfo();
  }
}
