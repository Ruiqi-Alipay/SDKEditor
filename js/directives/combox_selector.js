var app = angular.module("sdkApp");

app.directive("comboxSelector", function($location, $anchorScroll, dataService) {
	return {
		testrict: "A",
		replace: true,
		scope: true,
		templateUrl: "templates/view_combox.html",
		link: function(scope, element, attr) {
    		
		}
	};
});