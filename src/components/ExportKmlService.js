(function() {
  goog.provide('ga_export_kml_service');
  goog.require('ga_browsersniffer_service');

  var module = angular.module('ga_export_kml_service', [
    'ga_browsersniffer_service'
  ]);

  /**
   * This service can be used to export a kml file based on some
   * features on an ol3 map
   *
   */
  module.provider('gaExportKml', function() {
    this.$get = function($window, gaBrowserSniffer) {
      var ExportKml = function() {
        this.create = function(vectorSource, projection) {
          var exportFeatures = [];
          vectorSource.forEachFeature(function(f) {
              var clone = f.clone();
              clone.setId(f.getId());
              clone.getGeometry().transform(projection, 'EPSG:4326');
              var styles = clone.getStyleFunction()();
              var newStyle = {
                fill: styles[0].getFill(),
                stroke: styles[0].getStroke(),
                text: styles[0].getText(),
                image: styles[0].getImage(),
                zIndex: styles[0].getZIndex()
              };
              if (newStyle.image instanceof ol.style.Circle) {
                newStyle.image = null;
              }
              var myStyle = new ol.style.Style(newStyle);
              clone.setStyle(myStyle);

              exportFeatures.push(clone);
          });

          if (exportFeatures.length > 0) {
            var node = new ol.format.KML().writeFeatures(exportFeatures);
            var stringified = node.outerHtml;
            if (!stringified) {
              stringified = new $window.XMLSerializer().serializeToString(node);
            }
            var base64 = $window.btoa(stringified);
//            var locationString = 'data:application/vnd.google-earth.kml+xml;' +
//                                 'filename=map.geo.admin.ch.kml;';
            var locationString = 'data:application/vnd.google-earth.kml+xml;';
            if (gaBrowserSniffer.msie == 9) {
              locationString += ''; 
            } else if (gaBrowserSniffer.msie > 9) {
              locationString += '';
            }
            
            $window.location = locationString + 'base64,' + base64;
          }
        };
      };

      return new ExportKml();

    };
  });
})();

