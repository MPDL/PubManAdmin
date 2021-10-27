import {Component, OnInit} from '@angular/core';
const {version: appVersion} = require('../../../../package.json');
const {homepage: appHome} = require('../../../../package.json');
import {ConnectionService} from '../services/connection.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})

export class FooterComponent implements OnInit {
  appVersion;
  appName = 'Pubman Administration';
  appHome;
  hostname;

  constructor(
    private conn: ConnectionService
  ) {}

  ngOnInit() {
    this.appVersion = appVersion;
    this.appHome = appHome;
    this.conn.conn.subscribe((name) => this.hostname = name);
  }
}
