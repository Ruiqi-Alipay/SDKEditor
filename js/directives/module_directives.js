var app = angular.module("sdkApp");

app.directive("blockRoot", function ($compile, $rootScope, dataService) {
    return {
        restrict: "A",
        replace: true,
        scope: true,
        templateUrl: "templates/block_root.html",
        link: function (scope, element, attr) {
            var runingTask = 0;
            scope.moduleTypes = ["block", "component", "button", "label", "img", "link", "line", "expandableSelector"];
            scope.addNewChild = function(type) {
                element.find('.collapse').collapse('hide');
                var container = element.find("#root");
                var elementId = dataService.createModule($compile, scope, container, -1, type, 'root');
                $rootScope.$broadcast('append:root', elementId);
            };
            scope.moduleLoadFinished = function() {
                runingTask--;
                if (runingTask == 0) {
                    $rootScope.$broadcast('sdk:moduleLoaded');
                }
            };
            scope.addNewtask = function(count) {
                runingTask += parseInt(count);
            };
            scope.$on('childDeleted:' + 'root', function(event) {
                var container = element.find("#root");
                var childNum = container.children("div").length;
            });
            scope.$on('sdk:panelSelectionChange', function(event) {
                var data = dataService.getSelectedForm();
                var connatiner = element.find("#root");
                connatiner.html('');
                if (data && data.blocks) {
                    var result = dataService.recursiveProcessModule($compile, scope, connatiner, 'root', data.blocks);
                    scope.addNewtask(result);
                }
            });
        }
    };
});

app.directive("blockModule", function ($compile, $rootScope, dataService) {
  	return {
    	restrict: "A",
    	replace: true,
    	scope: true,
    	templateUrl: "templates/block_module.html",
    	compile: function (tElem) {
    		var elementId = tElem.attr("element-id");
            var type = tElem.attr("view-type")
            var parentId = dataService.getBlockParentId(elementId);
            $rootScope.$broadcast('childchange:' + parentId);

    		tElem.find('#collapseId').attr({
    			id: elementId + "-collapse",
    			ariaLabelledby: elementId + "-heading"
    		});
    		tElem.find('#headingId').attr({
    			id: elementId + "-heading",
    			href: "#" + elementId + "-collapse",
    			ariaControls: elementId + "-collapse",
    			"data-parent": "#" + parentId
    		});
    		tElem.find('#container').attr({
    			id: elementId
    		});

            var resetModuleItems = function(scope, type) {
                scope.ctrl.unuse.length = 0;
                scope.properties.length = 0;
                var fullProperties = dataService.getProtocol('blocks')[type];
                var recordProperty = {};
                for (var index in fullProperties) {
                    var property = fullProperties[index];
                    if (property in scope.block) {
                        scope.properties.push(property);
                        recordProperty[property] = '';
                    } else {
                        scope.ctrl.unuse.push(property);
                    }
                }

                for (var key in scope.block) {
                    if (key in recordProperty || key === 'type' || key === 'value') {
                        continue;
                    }
                    scope.properties.push(key);
                }
            };

      		return function (scope, element, attr) {
                scope.block = dataService.getModuleBlock(attr.elementId);
                scope.protocols = dataService.getModuleProtocol();
                scope.properties = [];
                scope.ctrl = {
                    title: '',
                    childNum: 0,
                    elementId: attr.elementId,
                    viewType: scope.block.type,
                    background: dataService.getHierarchyColor(attr.elementId),
                    typeArray: dataService.getProtocol('blocks').type,
                    unuse: []
                };
                resetModuleItems(scope, scope.block.type);

                scope.insetSlibing = function(type) {
                    // element.children().find('.collapse').collapse('hide');
                    var insertPosition = dataService.getBlockPosition(attr.elementId);
                    var elementId = dataService.createModule($compile, scope, element, insertPosition, type, parentId);
                    $rootScope.$broadcast('insert:' + scope.ctrl.elementId, elementId);
                };
                scope.blockPanelClicked = function() {
                    dataService.resetSelection(scope.ctrl.elementId);
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
                    return scope.protocols[name];
                }
                scope.addNewProperty = function(name) {
                    var value = '';
                    if (name === 'align' || name === 'text-align') {
                        value = 'left';
                    } else if (name === 'width') {
                        value = -1;
                    } else if (name === 'height') {
                        value = -2;
                    } else if (name === 'vertical-align') {
                        value = 'top';
                    }

                    scope.block[name] = value;
                    resetModuleItems(scope, scope.block.type);
                };
                scope.deleteProperty = function(name) {
                    delete scope.block[name];
                    resetModuleItems(scope, scope.block.type);
                };
		      	scope.addNewChild = function(type) {
                    element.children().find('.collapse').collapse('hide');
		      		var container = element.find("#" + attr.elementId);
		      		var elementId = dataService.createModule($compile, scope, container, -1, type, attr.elementId);
                    $rootScope.$broadcast('append:' + scope.ctrl.elementId, elementId);
                };
                scope.deleteElement = function() {
                    dataService.deleteBlockModule(scope.ctrl.elementId);
                    element.remove();
                    $rootScope.$broadcast('delete:' + scope.ctrl.elementId);
                }
                scope.$on('childchange:' + scope.ctrl.elementId, function(event) {
                    var childs = dataService.getBlockChilds(scope.ctrl.elementId);
                    if (childs) {
                        var title = '(';
                        childs.forEach(function(value) {
                            title += (' ' + dataService.getModuleBlock(value.name).type);
                        });
                        title += ' )';
                        scope.ctrl.title = title;
                        scope.ctrl.childNum = childs.length;
                    }
                });

                if (scope.block.value) {
                    var container = element.find("#" + scope.ctrl.elementId);
                    var result = dataService.recursiveProcessModule($compile, scope, container, scope.ctrl.elementId, scope.block.value);
                    scope.addNewtask(result);
                }

                scope.moduleLoadFinished();
		    };
    	}
  	};
});