angular.module("leaflet-directive").directive('geojson', function ($log, $rootScope, leafletData, leafletHelpers) {
    return {
        restrict: "A",
        scope: false,
        replace: false,
        require: 'leaflet',

        link: function(scope, element, attrs, controller) {
            var safeApply = leafletHelpers.safeApply,
                isDefined = leafletHelpers.isDefined,
                leafletScope  = controller.getLeafletScope(),
                leafletGeoJSON = {};
            var defaultOnEachFeature = function(feature, layer) {
                if (leafletHelpers.LabelPlugin.isLoaded() && isDefined(layer.label)) {
                    layer.bindLabel(feature.properties.description);
                }

                layer.on({
                    mouseover: function(e) {
                        safeApply(leafletScope, function() {
                            layer.selected = feature;
                            $rootScope.$broadcast('leafletDirectiveMap.geojsonMouseover', e);
                        });
                    },
                    mouseout: function(e) {
                        if (layer.resetStyleOnMouseout) {
                            leafletGeoJSON.resetStyle(e.target);
                        }
                        safeApply(leafletScope, function() {
                            layer.selected = undefined;
                            $rootScope.$broadcast('leafletDirectiveMap.geojsonMouseout', e);
                        });
                    },
                    click: function(e) {
                        safeApply(leafletScope, function() {
                            layer.selected = feature;
                            $rootScope.$broadcast('leafletDirectiveMap.geojsonClick', layer.selected, e);
                        });
                    }
                });
            };

            controller.getMap().then(function(map) {
                leafletScope.$watch("geojson", function(geojson) {
                    if (isDefined(leafletGeoJSON)) {
                        angular.forEach(leafletGeoJSON, function(layer) {
                            if (map.hasLayer(layer)) {
                                map.removeLayer(layer);
                            }
                        });
                    }

                    if (!isDefined(geojson)) {
                        return;
                    }

                    for( var layerName in geojson) {
                        var layer = geojson[layerName];
                        var onEachFeature = layer.onEachFeature || defaultOnEachFeature;


                        layer.options = {
                            style: layer.style,
                            filter: layer.filter,
                            onEachFeature: onEachFeature,
                            pointToLayer: layer.pointToLayer,
                            resetStyleOnMouseout: layer.resetStyleOnMouseout
                        };

                        var leafletLayer = L.geoJson(layer.data, layer.options);
                        leafletLayer.addTo(map);

                        leafletGeoJSON[layerName] = leafletLayer;
                    }
                    leafletData.setGeoJSON(leafletGeoJSON, attrs.id);
                }, true);
            });
        }
    };
});
