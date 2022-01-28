import {Component, OnInit} from '@angular/core';
import {ConnectionService} from '../services/connection.service';

const {version: appVersion} = require('../../../../package.json');
const {homepage: appHome} = require('../../../../package.json');

@Component({
  selector: 'footer-component',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
  appVersion: any;
  appHome: any;
  hostName: string;

  constructor(
    private connectionService: ConnectionService,
  ) {}

  ngOnInit() {
    this.appVersion = appVersion;
    this.appHome = appHome;
    this.connectionService.connectionService.subscribe((data: string) => this.hostName = data);
  }
}
