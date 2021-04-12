import { browser, by, element, promise } from 'protractor';

export class AppPage {
  navigateTo(): promise.Promise<any> {
    return browser.get(browser.baseUrl);
  }
}
