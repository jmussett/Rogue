import {bootstrap} from 'aurelia-bootstrapper-webpack';

bootstrap(function(aurelia) {
  aurelia.use
    .standardConfiguration()
    .developmentLogging();

  aurelia.start().then(() => aurelia.setRoot('site', document.body));
});
