define(

  [
    './advice',
    './component',
    './compose',
    './logger',
    './registry',
    './utils'
  ],

  function (advice, component, compose, logger, registry, utils) {

    return {
      advice: advice,
      component: component,
      compose: compose,
      logger: logger,
      registry: registry,
      utils: utils
    };

  }
);
