
var app = angular.module("sdkApp", ['colorpicker.module']);

app.controller("mainController", function($scope, $rootScope, $http, dataService) {
	$scope.selectServerScript;
	$scope.actionList = dataService.getActionList();

	$http.get('/api/scripts').success(function(array) {
		if (array) {
			$scope.scripts = array;
		} else {
			$scope.scripts = [];
		}
	});

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
	$scope.saveScript = function() {
		if (!$scope.scriptName) {
			$scope.message = '脚本名不可为空';
	    	$('#postDialog').modal('show');
			return;
		}
		var script = $scope.selectServerScript;
		if (!script) {
			script = {};
		}
		
		script.title = $scope.scriptName,
		script.content = JSON.stringify(dataService.assembleScript());

		$http.post('/api/scripts', script).success(function(data){
	    	if (data) {
	    		if (!$scope.selectServerScript) {
	    			$scope.scripts.push(data);
	    			$scope.selectServerScript = data;
	    		}
	    	}
	    	$scope.message = '保存成功';
	    	$('#postDialog').modal('show');
	  	}).error(function(data, status, headers, config) {
	  		$scope.message = '保存失败: ' + data;
	    	$('#postDialog').modal('show');
	  	});
	};
	$scope.deleteScript = function() {
		$http.delete('/api/scripts/' + $scope.selectServerScript._id).success(function(data){
	    	if (data) {
	    		var index = $scope.scripts.indexOf($scope.selectServerScript);
	    		$scope.scripts.splice(index, 1);
	    		$scope.selectServerScript = undefined;
	    		dataService.loadScript();
	    	}
	  	});
	};
	$scope.loadFromServer = function(index) {
		$scope.selectServerScript = $scope.scripts[index];

		$scope.scriptName = $scope.selectServerScript.title;
	    var jsonObject = JSON.parse($scope.selectServerScript.content);
	    if (jsonObject) {
	        dataService.loadScript(jsonObject);
	    }
	};
	$scope.loadFromLocal = function() {
		$scope.selectServerScript = undefined;
		var pom = document.createElement('input');
		pom.setAttribute('type', 'file');
		pom.setAttribute('accept', '.json');
		pom.setAttribute('onchange', "angular.element(document.getElementById('navBar')).scope().loadScript(this)");
		pom.click();
	};
	$scope.newFrom = function() {
		$scope.selectServerScript = undefined;
		$scope.scriptName = '';
		dataService.loadScript();
	};
	$scope.loadScript = function(element) {
        var file = element.files[0];
	    var reader = new FileReader();
	    $scope.scriptName = file.name;

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
		if (!$scope.scriptName) {
			$scope.scriptName = 'new_script.json';
		}
		var saveFileContent = JSON.stringify(dataService.assembleScript());
		var pom = document.createElement('a');
		pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(saveFileContent));
		pom.setAttribute('download', $scope.scriptName);
		pom.click();
	};
	$scope.deleteAction = function() {
		dataService.deleteAction();
	};
    $scope.$on('sdk:panelSelectionChange', function(event) {
        $scope.selectedIndex = dataService.getSelectedFormIndex();
    });
});