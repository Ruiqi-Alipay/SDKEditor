var app = angular.module("sdkApp");

app.directive("deviceAndroid", function($compile, $rootScope, dataService) {
  	return {
    	restrict: "A",
    	replace: true,
    	templateUrl: "templates/device_android.html",
    	link: function (scope, element, attr) {
            var bottomBar = element.find('.bottom-bar');
            dataService.setBottombar(bottomBar);
            scope.style = dataService.getModuleCssStyle('root');

            scope.$on('sdk:panelSelectionChange', function(event) {
                var target = element.find(".activity");
                target.html('');
                bottomBar.html('');
                scope.style = dataService.getModuleCssStyle('root');
                scope.formParameters = dataService.getSelectedFormParameters();
            });
            scope.$on('append:root', function(event, elementId) {
                var target = element.find(".activity");
                dataService.createView($compile, scope, target, true, elementId);
            });
            scope.$on('delete:root', function(event) {
                var target = element.find(".activity");
                target.html('');
            });
            scope.$on('sdk:moduleLoaded', function(event) {
                var target = element.find(".activity");
                dataService.recursiveProcessView($compile, scope, target, 'root');
                scope.formParameters = dataService.getSelectedFormParameters();
                $rootScope.$broadcast('sdk:actionBarChange');
            });
            scope.$watch('formParameters', function(newValue, oldValue) {
                if (!newValue || !newValue.form) {
                    return;
                }
                if (newValue.form.type === "popupwin") {
                    scope.style['width'] = '80%';
                    scope.style['height'] = '';
                    scope.style['align-self'] = 'center';
                    scope.style['background'] = 'white';
                    scope.style['border-radius'] = '4px';
                    scope.style['-moz-box-shadow'] = '0 0 5px 5px #C0C0C0';
                    scope.style['-webkit-box-shadow'] = '0 0 5px 5px #C0C0C0';
                    scope.style['box-shadow'] = '0 0 5px 5px #C0C0C0';
                    scope.style['margin'] = 'auto auto';
                    scope.style['padding-top'] = '0px';
                } else {
                    scope.style['width'] = '360px';
                    scope.style['max-width'] = '360px';
                    scope.style['height'] = '';
                    scope.style['background'] = '#eee';
                    scope.style['border-radius'] = '';
                    scope.style['-moz-box-shadow'] = '';
                    scope.style['-webkit-box-shadow'] = '';
                    scope.style['box-shadow'] = '';
                    scope.style['margin'] = '';
                    scope.style['padding-bottom'] = '58px';
                    if (newValue.form.actionBar) {
                        scope.style['padding-top'] = '48px';
                    } else {
                        scope.style['padding-top'] = '0px';
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
                var data = dataService.getSelectedFormParameters();
                if (data.form) {
                    scope.bar = data.form.actionBar;
                } else {
                    scope.bar = undefined;
                }
            }, true);
	    }
  	};
});