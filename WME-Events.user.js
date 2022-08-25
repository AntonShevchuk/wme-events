// ==UserScript==
// @name         WME Events
// @namespace    https://greasyfork.org/users/227648-anton-shevchuk
// @version      0.0.1
// @description  Events for custom Waze Map Editor scripts
// @license      MIT License
// @match        https://www.waze.com/editor*
// @match        https://www.waze.com/*/editor*
// @match        https://beta.waze.com/editor*
// @match        https://beta.waze.com/*/editor*
// @exclude      https://www.waze.com/user/editor*
// @exclude      https://beta.waze.com/user/editor*
// @icon         https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://anton.shevchuk.name&size=64
// @grant        none
// ==/UserScript==

/* jshint esversion: 6 */

/* global W */

(function ($) {
  'use strict'

  let $document = $(document)

  $document
    .on('segment.wme', log)
    .on('segments.wme', log)
    .on('node.wme', log)
    .on('nodes.wme', log)
    .on('venue.wme', log)
    .on('venues.wme', log)
    .on('point.wme', log)
    .on('residential.wme', log)

  init() // be carefully, this script should be load only by WME Bootstrap

  function init() {
    // Initial handler for fire events
    W.selectionManager.events.register('selectionchanged', null, (event) => handler(event.selected))

    handler(W.selectionManager.getSelectedFeatures())
  }

  function log (event) {
    console.log('%cEvents:%c ' + event.type + '.' + event.namespace, 'color: #0DAD8D; font-weight: bold', 'color: dimgray; font-weight: normal')
  }

  function handler (selected) {
    if (selected.length === 0) {
      $document.trigger('none.wme')
      return
    }

    let models = selected.map(x => x.model)
    let model = models[0]
    let isSingle = (models.length === 1)

    switch (true) {
      case (model.type === 'node' && isSingle):
        trigger('node.wme','node-edit-general', model)
        break;
      case (model.type === 'node'):
        trigger('nodes.wme','node-edit-general', models)
        break;
      case (model.type === 'segment' && isSingle):
        trigger('segment.wme','segment-edit-general', model)
        break;
      case (model.type === 'segment'):
        trigger('segments.wme','segment-edit-general', models)
        break;
      case (model.type === 'venue' && isSingle):
        trigger('venue.wme', 'venue-edit-general', model)
        if (model.isPoint()) {
          trigger('point.wme', 'venue-edit-general', model)
        }
        if (model.isResidential()) {
          trigger('residential.wme', 'venue-edit-general', model)
        }
        break;
      case (model.type === 'venue'):
        trigger('venues.wme', 'mergeVenuesCollection', models)
        break;
    }
  }

  function trigger(event, selector, models) {
    $document.trigger(event, [document.getElementById(selector), models])
  }

})(window.jQuery);
