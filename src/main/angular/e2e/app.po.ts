import {browser, by, element} from 'protractor';

export class AdmintoolPage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('app-component h1')).getText();
  }
}
