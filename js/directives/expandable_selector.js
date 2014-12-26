var app = angular.module("sdkApp");

app.directive("expandableSelector", function($location, $anchorScroll, dataService) {
	return {
		testrict: "A",
		replace: true,
		scope: true,
		templateUrl: "templates/view_expandableSelector.html",
		link: function(scope, element, attr) {
    		$anchorScroll.yOffset = 250;
    		scope.module = dataService.getModuleBlock(attr.elementId);
    		scope.style = dataService.getModuleCssStyle(attr.elementId);
    		scope.gapStyle = {};
    		scope.showDrapsown = false;
    		scope.itemModules = [];
    		scope.itemTemplates = {};

            var processModule = function(style, module) {
                dataService.moduleDataToCSS(style, module, attr.elementId);
                if (module.value) {
                    var childStye = {};
                    module.value.forEach(function(value, index) {
                        if (value.name === 'elementValues') {
                            value.value.forEach(function(childValue, childIndex) {
                                scope.itemModules[childIndex] = childValue;
                                if (!('itemSelect' in scope)) {
                                    scope.itemSelect = childIndex;
                                }
                            });
                        } else if (value.name === 'topStyle' || value.name === 'childStyle') {
                            scope.itemTemplates[value.name] = value;
                        } else if (value.name === 'gap') {
                            dataService.moduleDataToCSS(scope.gapStyle, value);
                        }
                    });
                }
            };

            processModule(scope.style, scope.module);

    		scope.getModule = function(index) {
    			return scope.itemModules[index];
    		};
    		scope.getTemplate = function(type) {
    			return scope.itemTemplates[type];
    		};
    		scope.childClicked = function(index) {
    			scope.itemSelect = parseInt(index);
    			var target = document.querySelector('#slideable');
                var content = target.querySelector('.slideable_content');
                if(!scope.showDrapsown) {
                    content.style.border = '1px solid rgba(0,0,0,0)';
                    var y = content.clientHeight;
                    content.style.border = 0;
                    target.style.height = y + 'px';
                } else {
                    target.style.height = '0px';
                }
    			scope.showDrapsown = !scope.showDrapsown;
    		};
    		scope.$watch('module', function(newValue, oldValue) {
                processModule(scope.style, newValue);
    		}, true);
    		scope.getImageView = function() {
    			return scope.topImg;
    		}
		}
	};
});

app.directive('expandableItem', function(dataService) {
    return {
        replace: true,
        restrict: 'A',
        scope: true,
        templateUrl: "templates/view_expandable_item.html",
        link: function(scope, element, attr) {
        	scope.layout = {};
        	scope.icon = {};
        	scope.text = [{}, {}];
        	scope.indicator = {};

    		scope.template = scope.getTemplate(attr.itemType);
            if (attr.itemType === 'topStyle') {
                scope.$watch('itemSelect', function(newValue, oldValue) {
                    scope.module = scope.getModule(newValue);
                });
                scope.$watch('showDrapsown', function(newValue, oldValue) {
                    if ('images' in scope.indicator) {
                        if (newValue) {
                            scope.indicator.image = scope.indicator.images[1];
                        } else {
                            scope.indicator.image = scope.indicator.images[0];
                        }
                    }
                });
            }
    		scope.module = scope.getModule(parseInt(attr.moduleIndex));
            scope.itemClicked = function() {
                scope.childClicked(attr.moduleIndex);
            }
    		scope.$watch('template', function(newValue, oldValue) {
                if (!newValue) {
                    return;
                }

				dataService.moduleDataToCSS(scope.layout, newValue);
				newValue.value.forEach(function(value, index) {
					if (value.name === 'image') {
						dataService.moduleDataToCSS(scope.icon, value);
                        scope.icon['align-self'] = 'center';
                        scope.icon['min-width'] = scope.icon.width;
                        scope.icon['min-height'] = scope.icon.height;
					} else if (value.name === 'text') {
						dataService.moduleDataToCSS(scope.text[0], value);
						dataService.moduleDataToCSS(scope.text[1], value);
                        scope.text[0]['align-self'] = 'center';
                        scope.text[1]['align-self'] = 'center';
					} else {
                        var previousImage = scope.indicator.image;
						dataService.moduleDataToCSS(scope.indicator, value);
                        
                        if (scope.indicator.height.indexOf('px') <= 0) {
                            scope.indicator.height = '50px';
                        }
                        if (scope.indicator.width.indexOf('px') <= 0) {
                            scope.indicator.width = '50px';
                        }
                        scope.indicator['min-width'] = scope.indicator.width;
                        scope.indicator['min-height'] = scope.indicator.height;
                        scope.indicator['align-self'] = 'center';

                        if (scope.indicator.image) {
                            if (scope.indicator.image.indexOf(";") > 0) {
                                scope.indicator.images = scope.indicator.image.split(";");
                                if (previousImage) {
                                    scope.indicator.image = previousImage;
                                } else {
                                    scope.indicator.image = scope.indicator.images[1];
                                }
                            }
                        }
					}
				});
    		}, true);
    		scope.$watch('module', function(newValue, oldValue) {
    			scope.icon.url = newValue.url;
                scope.text = [{}, {}];
				newValue.value.forEach(function(value, index) {
					dataService.moduleDataToCSS(scope.text[index], value);
				});
    		}, true);
        }
    };
});

app.directive('slideable', function () {
    return {
        restrict:'A',
        compile: function (element, attr) {
            // wrap tag
            var contents = element.html();
            element.html('<div class="slideable_content" style="margin:0 !important; padding:0 !important" >' + contents + '</div>');

            return function postLink(scope, element, attrs) {
                // default properties
                attrs.duration = (!attrs.duration) ? '300ms' : attrs.duration;
                attrs.easing = (!attrs.easing) ? 'ease-in-out' : attrs.easing;
                element.css({
                    'overflow': 'hidden',
                    'height': '0px',
                    'transitionProperty': 'height',
                    'transitionDuration': attrs.duration,
                    'transitionTimingFunction': attrs.easing
                });
            };
        }
    };
});