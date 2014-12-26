var app = angular.module("sdkApp");

app.directive("itemView", function($compile, dataService) {
  	return {
    	restrict: "A",
    	replace: true,
    	scope: true,
    	templateUrl: function(tElem, tAttrs) {
            var data = dataService.getModuleBlock(tAttrs.elementId);
			if (data.type === "button") {
				return "templates/view_button.html";
			} else if (data.type === "label" || data.type === "link") {
				return "templates/view_label.html";
			} else if (data.type === "img" || data.type === 'icon') {
				return "templates/view_img.html";
			} else if (data.type === "component"){
				return "templates/view_component.html";
			} else if (data.type === 'password' || data.type === 'input') {
                return "templates/view_input.html"
            } else {
				return "templates/view_block.html";
			}
    	},
    	link: function (scope, element, attr) {
    		scope.style = dataService.getModuleCssStyle(attr.elementId);
    		scope.module = dataService.getModuleBlock(attr.elementId);
    		scope.highlightView = dataService.getHighlightView();

            scope.$watch('module', function(newValue, oldValue) {
                dataService.moduleDataToCSS(scope.style, newValue, attr.elementId);
            }, true);
            scope.$watch('highlightView', function(newValue, oldValue) {
                if (newValue.elementId === attr.elementId) {
                	scope.style['border'] = '2px dashed red';
                } else {
					scope.style['border'] = '';
                }
            }, true);
            scope.$on('delete:' + attr.elementId, function(event) {
                element.remove();
            });
            scope.$on('insert:' + attr.elementId, function(event, elementId) {
                dataService.createView($compile, scope, element, false, elementId);
            });
            if (scope.module.type === "component" || scope.module.type === "block") {
                scope.$on('append:' + attr.elementId, function(event, elementId) {
                    dataService.createView($compile, scope, element, true, elementId);
                });
            }
            element.bind('click', function (e) {
                e.stopPropagation();
                dataService.setHighlightViewId(attr.elementId);
                dataService.selectPanel(attr.elementId);
            })

            if (scope.module.value) {
                dataService.recursiveProcessView($compile, scope, element, attr.elementId);
                // delete scope.module.value;
            }
	    }
  	};
});