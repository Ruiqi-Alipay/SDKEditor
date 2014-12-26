var app = angular.module("sdkApp");

app.directive("deviceAndroid", function($compile, $rootScope, dataService) {
  	return {
    	restrict: "A",
    	replace: true,
    	templateUrl: "templates/device_android.html",
    	link: function (scope, element, attr) {
    		dataService.setBottomBar(element.find('.bottom-bar'));
            scope.activity = {};
            scope.form = {};
            scope.$on('append:root', function(event, elementId) {
                var target = element.find(".activity");
                dataService.createView($compile, scope, target, true, elementId);
            });
            scope.$on('sdk:moduleLoaded', function(event) {
                var data = dataService.getSelectedForm();
                var bottomBar = element.find(".bottom-bar");
                bottomBar.html('');
            	var target = element.find(".activity");
                target.html('');
                dataService.recursiveProcessView($compile, scope, target, 'root');

                scope.form = data.form;
                $rootScope.$broadcast('sdk:actionBarChange');
            });
            scope.$watch('form', function(newValue, oldValue) {
                scope.activity.type = newValue.type;

                if (newValue.type === "popupwin") {
                    scope.activity.width = '80%';
                    scope.activity.height = '';
                    scope.activity.align = 'center';
                    scope.activity.paddingTop = '0px';
                } else {
                    scope.activity.width = '100%';
                    scope.activity.height = '100%';
                    scope.activity.align = 'flex-start';
                    if (newValue.actionBar) {
                        scope.activity.paddingTop = '48px';
                    } else {
                        scope.activity.paddingTop = '0px';
                    }
                }
                
            }, true);
	    }
  	};
});

app.directive("actionBar", function(dataService) {
  	return {
    	restrict: "A",
    	replace: true,
    	templateUrl: "templates/action_bar.html",
    	link: function (scope, element, attr) {
    		scope.$on('sdk:actionBarChange', function(event) {
                var data = dataService.getSelectedForm();
                if (data.form) {
                    scope.bar = data.form.actionBar;
                } else {
                    scope.bar = undefined;
                }
            }, true);
	    }
  	};
});