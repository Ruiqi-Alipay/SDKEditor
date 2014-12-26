
var app = angular.module("sdkApp", ['colorpicker.module']);

app.controller("mainController", function($scope, $rootScope, dataService) {
	$scope.actionList = dataService.getActionList();
	$scope.loadFile = {};
	$scope.onMainFormSelected = function() {
		dataService.selectForm(-1);
	};
	$scope.onActionSelected = function(index) {
		dataService.selectForm(index);
	};
	$scope.onNewAction = function() {
		dataService.createNewAction();
	};
	$scope.$on('sdk:newScriptLoaded', function(event) {
		$scope.appState.tabSelect = 1;
	});
	$scope.loadScript = function(element) {
        var file = element.files[0];
	    var reader = new FileReader();
	    $scope.loadFile.name = file.name;

	    // If we use onloadend, we need to check the readyState.
	    reader.onloadend = function(evt) {
	      if (evt.target.readyState == FileReader.DONE) { // DONE == 2
	        var result = evt.target.result;
	        var jsonObject = JSON.parse(result);
	        if (jsonObject) {
		        $scope.$apply(function() {
	        		dataService.loadScript(jsonObject);
	        	});
	        }
	      }
		};

	    reader.readAsText(file);
	};
	$scope.downloadScript = function(what) {
		if (!$scope.loadFile.name) {
			$scope.loadFile.name = 'new_script.json';
		}
		var saveFileName = $scope.loadFile.name;
		var saveFileContent = JSON.stringify(dataService.assembleScript());
		var pom = document.createElement('a');
		pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(saveFileContent));
		pom.setAttribute('download', saveFileName);
		pom.click();
	};
	$scope.deleteAction = function() {
		dataService.deleteAction();
	};
    $scope.$on('sdk:panelSelectionChange', function(event) {
        $scope.selectedIndex = dataService.getSelectedFormIndex();
    });
});