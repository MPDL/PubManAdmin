import {Component, OnInit} from '@angular/core';

import {environment} from '../../../environments/environment';

const {version: appVersion} = require('../../../../package.json');
const {homepage: appHome} = require('../../../../package.json');

@Component({
    selector: 'footer-component',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss'],
    standalone: true,
    imports: []
})
export class FooterComponent implements OnInit {
  appVersion: any;
  appHome: any;
  hostName: string;

  constructor(
  ) {}

  ngOnInit() {
    this.hostName = environment.baseUrl;
    if (environment.proxyUrl) {
      this.hostName += ' (-> ' + environment.proxyUrl + ')';
    }
    this.appVersion = appVersion;
    this.appHome = appHome;
  }
}
