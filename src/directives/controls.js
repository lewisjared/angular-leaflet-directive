angular.module("leaflet-directive").directive('controls', function ($log, leafletHelpers) {
    return {
        restrict: "A",
        scope: false,
        replace: false,
        require: '?^leaflet',

        link: function(scope, element, attrs, controller) {
            if(!controller) {
                return;
            }

            var isDefined = leafletHelpers.isDefined,
                leafletScope  = controller.getLeafletScope(),
                controls = leafletScope.controls;

            controller.getMap().then(function(map) {
                if (isDefined(L.Control.Draw) && isDefined(controls.draw)) {
                    var drawnItems = new L.FeatureGroup();
                    var options = {
                        edit: {
                            featureGroup: drawnItems
                        }
                    };
                    angular.extend(options, controls.draw);
                    controls.draw = options;
                    map.addLayer(options.edit.featureGroup);

                    var drawControl = {};

                    leafletScope.$watch('controls.draw.enabled', function(isEnabled) {
                        if (isEnabled) {
                            drawControl = new L.Control.Draw(options);
                            map.addControl(drawControl);
                        } else {
                            if (drawControl instanceof L.Class) {
                                map.removeControl(drawControl);
                            }
                        }
                    });
                }

                if(isDefined(controls.custom)) {
                    for(var i in controls.custom) {
                        map.addControl(controls.custom[i]);
                    }
                }
            });
        }
    };
});
