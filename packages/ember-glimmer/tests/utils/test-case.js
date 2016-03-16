export { TestCase, moduleFor } from './abstract-test-case';
import Environment from './environment';
import { DOMHelper, InteractiveRenderer, compile } from './helpers';
import {
  ApplicationTest as AbstractApplicationTest,
  RenderingTest as AbstractRenderingTest
} from './abstract-test-case';
import { OutletView } from 'ember-glimmer/ember-routing-view';
import ComponentLookup from 'ember-views/component_lookup';

export class ApplicationTest extends AbstractApplicationTest {
  constructor() {
    super();

    let { application } = this;

    application.registerOptionsForType('helper', { instantiate: false });
    application.registerOptionsForType('template', { instantiate: true });
    application.registerOptionsForType('component', { singleton: false });

    application.register('service:-dom-helper', {
      create() { return new DOMHelper(document); }
    });

    application.register('service:-glimmer-environment', Environment);
    application.inject('service:-glimmer-environment', 'dom', 'service:-dom-helper');

    application.register('renderer:-dom', InteractiveRenderer);
    application.inject('renderer', 'dom', 'service:-dom-helper');
    application.inject('renderer', 'env', 'service:-glimmer-environment');

    application.register('template:-outlet', compile('{{outlet}}'));
    application.register('view:-outlet', OutletView);
    application.register('component-lookup:main', ComponentLookup);

    application.inject('template', 'env', 'service:-glimmer-environment');
    application.inject('view:-outlet', 'template', 'template:-outlet');
  }
}

export class RenderingTest extends AbstractRenderingTest {
  constructor() {
    super();

    let { owner } = this;

    owner.register('component-lookup:main', ComponentLookup);
    owner.register('service:-glimmer-environment', this.env, { instantiate: false });
    owner.inject('template', 'env', 'service:-glimmer-environment');
    owner.registerOptionsForType('helper', { instantiate: false });
    owner.registerOptionsForType('component', { singleton: false });
  }

  runTask(callback) {
    super.runTask(() => {
      callback();
      this.component.rerender();
    });
  }
}
