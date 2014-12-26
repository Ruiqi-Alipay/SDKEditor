var app = angular.module("sdkApp");

app.directive("itemView", function($compile, $location, $anchorScroll, dataService) {
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
			} else if (data.type === 'password' || data.type === 'edittext') {
                return "templates/view_input.html"
            } else {
				return "templates/view_block.html";
			}
    	},
    	link: function (scope, element, attr) {
    		$anchorScroll.yOffset = 250;
    		scope.viewData = {};
    		scope.module = dataService.getModuleBlock(attr.elementId);
    		scope.selection = dataService.getItemSelection();

            scope.$watch('module', function(newValue, oldValue) {
                dataService.moduleDataToView(scope.viewData, newValue);
            }, true);

            scope.$watch('selection', function(newValue, oldValue) {
                if (newValue.value === attr.elementId) {
                	scope.viewData.border = '1px dashed red';
                } else {
					scope.viewData.border = '';
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

            scope.viewClicked = function() {
            	dataService.resetSelection(attr.elementId);
            	scope.viewData.border = '2px dashed red';
            	$location.hash(attr.elementId + '-collapse');
            	$anchorScroll();
            };

            if (scope.module.value) {
                dataService.recursiveProcessView($compile, scope, element, attr.elementId);
                // delete scope.module.value;
            }
	    }
  	};
});