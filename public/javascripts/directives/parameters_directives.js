var app = angular.module("sdkApp");

app.directive("basicProperties", function($compile, dataService) {
    return {
        restrict: "A",
        replace: true,
        scope: true,
        template: "<div></div>",
        link: function(scope, element, attr) {
            var resetPropertyies = function() {
                element.html('');
                scope.allProperties.root = dataService.getScriptRoot();
                element.append($compile("<div properties-panel sector='root'></div>")(scope));
            };

            scope.allProperties = {};
            scope.$on('sdk:newScriptLoaded', function(event) {
                resetPropertyies();
            });
            resetPropertyies();
        }
    };
});

app.directive("formProperties", function($compile, dataService) {
    return {
        restrict: "A",
        replace: true,
        scope: true,
        template: "<div></div>",
        link: function(scope, element, attr) {
            scope.allProperties = {};
            scope.$on('sdk:panelSelectionChange', function(event) {
                element.html('');
                scope.allProperties = {};
                scope.allProperties['parameter'] = dataService.getSelectedFormParameters();
                element.append($compile("<div properties-panel sector='parameter' style='margin-top: 12px;'></div>")(scope));
            });
        }
    };
});

app.directive("propertiesPanel", function($compile, dataService) {
  	return {
    	restrict: "A",
    	replace: true,
    	scope: true,
    	templateUrl: "templates/properties_panel.html",
        compile: function (tElem) {
            var sector = tElem.attr("sector");
            var parentId = tElem.attr("parentid");
            tElem.find('#header').attr({
                'id': sector + "-header",
                'data-parent': '#' + parentId,
                'data-toggle': 'collapse',
                'aria-expanded': true,
                'href': "#" + sector + "-body",
                'aria-controls': sector + "-body"
            });
            tElem.find('#body').attr({
                'id': sector + "-body",
                'aria-labelledby': sector + "-header"
            });

            tElem.find('#container').attr({
                id: sector
            });

            return function (scope, element, attr) {
                var appendChildPanel = function(sector, parentId) {
                    var container = element.find('#' + scope.sector);
                    container.append($compile("<div properties-panel sector='" + sector + "' parentid='" + parentId + "'></div>")(scope));
                };
                var findProperty = function(array, name) {
                    for (var index = 0; index < array.length; index++) {
                        if (array[index] === name) {
                            return index;
                        }
                    }
                };

                scope.propertyArray = [];
                scope.sector = attr.sector;
                scope.properties = scope.allProperties[attr.sector];
                scope.protocols = dataService.getProtocol(attr.sector);
                scope.simpleUnuseProperties = [];
                scope.complexUnuseProperties = [];

                scope.newProperty = function(name) {
                    scope.properties[name] = '';
                };
                scope.newPanelProperty = function(name) {
                    scope.properties[name] = '';
                    scope.allProperties[name] = {};
                    appendChildPanel(name, sector);
                };
                scope.deleteProperty = function(key) {
                    delete scope.properties[key];
                };
                scope.deletePanel = function() {
                    delete scope.allProperties[scope.sector];
                    for (var key in scope.allProperties) {
                        var property = scope.allProperties[key];
                        for (var item in property) {
                            if (item === scope.sector) {
                                delete property[item];
                                break;
                            }
                        }
                    }
                    element.remove(); 
                };
                scope.getPropertyProtocolType = function(name) {
                    var type = scope.protocols[name];
                    if (type instanceof Array || type === 'array') {
                        return 'array';
                    } else {
                        return type;
                    }
                };
                scope.getPropertyProtocolValue = function(name) {
                    var values = scope.protocols[name];
                    if (values instanceof Array) {
                        return values;
                    } else if (values === 'array') {
                        var find;
                        for (var index in scope.properties) {
                            if (scope.properties[index].name === name) {
                                find = scope.properties[index];
                                break;
                            }
                        }
                        if (find) {
                            return find.value;
                        }
                    }
                }
                scope.$watch('properties', function(newValue, oldValaue) {
                    scope.simpleUnuseProperties.length = 0;
                    scope.complexUnuseProperties.length = 0;
                    scope.propertyArray.length = 0;

                    for (var key in scope.protocols) {
                        var type = scope.protocols[key];
                        if (!(key in scope.properties)) {
                            if (type === 'object' || type === 'list') {
                                scope.complexUnuseProperties.push(key);
                            } else {
                                scope.simpleUnuseProperties.push(key);
                            }
                        } else {
                            if (type != 'object' && type != 'list') {
                                scope.propertyArray.push(key);
                            }
                        }
                    }
                }, true);

                for (var key in scope.properties) {
                    var type = scope.protocols[key];
                    if (type === 'object') {
                        scope.allProperties[key] = scope.properties[key];
                        appendChildPanel(key, sector);
                    }
                }
            };
        }
  	};
});

app.filter('onlySimpleProperty', function () {
  return function (item) {
    var filtered = {};
    for (var key in item) {
        if (typeof item[key] != 'object') {
            filtered[key] = item[key];
        }
    }
    return filtered;
  };
});