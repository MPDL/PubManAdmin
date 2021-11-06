import {Component, OnInit} from '@angular/core';
const {version: appVersion} = require('../../../../package.json');
const {homepage: appHome} = require('../../../../package.json');
import {ConnectionService} from '../services/connection.service';

@Component({
  selector: 'footer-component',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
  appVersion;
  appName = 'Pubman Administration';
  appHome;
  hostname;

  constructor(
    private connectionService: ConnectionService
  ) {}

  ngOnInit() {
    this.appVersion = appVersion;
    this.appHome = appHome;
    this.connectionService.connectionService.subscribe((name) => this.hostname = name);
  }
}
