angular.module('page', ['ngAnimate', 'ui.bootstrap']);
angular.module('page')
.factory('httpRequestInterceptor', function () {
	var csrfToken = null;
	return {
		request: function (config) {
			config.headers['X-Requested-With'] = 'Fetch';
			config.headers['X-CSRF-Token'] = csrfToken ? csrfToken : 'Fetch';
			return config;
		},
		response: function(response) {
			var token = response.headers()['x-csrf-token'];
			if (token) {
				csrfToken = token;
			}
			return response;
		}
	};
})
.config(['$httpProvider', function($httpProvider) {
	$httpProvider.interceptors.push('httpRequestInterceptor');
}])
.factory('$messageHub', [function(){
	var messageHub = new FramesMessageHub();

	var message = function(evtName, data){
		messageHub.post({data: data}, 'agoreus-app.Requests.Request.' + evtName);
	};

	var on = function(topic, callback){
		messageHub.subscribe(callback, topic);
	};

	return {
		message: message,
		on: on,
		onEntityRefresh: function(callback) {
			on('agoreus-app.Requests.Request.refresh', callback);
		},
		onRequestTypeModified: function(callback) {
			on('agoreus-app.Requests.RequestType.modified', callback);
		},
		onRequestStatusModified: function(callback) {
			on('agoreus-app.Requests.RequestStatus.modified', callback);
		},
		onCurrencyModified: function(callback) {
			on('agoreus-app.Requests.Currency.modified', callback);
		},
		onCountryModified: function(callback) {
			on('agoreus-app.Requests.Country.modified', callback);
		},
		messageEntityModified: function() {
			message('modified');
		}
	};
}])
.controller('PageController', function ($scope, $http, $messageHub) {

	var api = '/services/v4/js/agoreus-app/gen/api/Requests/Request.js';
	var requesttypeidOptionsApi = '/services/v4/js/agoreus-app/gen/api/Nomenclatures/RequestType.js';
	var requeststatusidOptionsApi = '/services/v4/js/agoreus-app/gen/api/Nomenclatures/RequestStatus.js';
	var currencycodeOptionsApi = '/services/v4/js/agoreus-app/gen/api/Entities/Currency.js';
	var countryidOptionsApi = '/services/v4/js/agoreus-app/gen/api/Nomenclatures/Country.js';

	$scope.requesttypeidOptions = [];

	$scope.requeststatusidOptions = [];

	$scope.currencycodeOptions = [];

	$scope.countryidOptions = [];

	$scope.dateOptions = {
		startingDay: 1
	};
	$scope.dateFormats = ['yyyy/MM/dd', 'dd-MMMM-yyyy', 'dd.MM.yyyy', 'shortDate'];
	$scope.monthFormats = ['yyyy/MM', 'MMMM-yyyy', 'MM.yyyy', 'MMMM/yyyy'];
	$scope.weekFormats = ['yyyy/w', 'w-yyyy', 'w.yyyy', 'w/yyyy', "w"];
	$scope.dateFormat = $scope.dateFormats[0];
	$scope.monthFormat = $scope.monthFormats[1];
	$scope.weekFormat = $scope.weekFormats[3];

	function requesttypeidOptionsLoad() {
		$http.get(requesttypeidOptionsApi)
		.then(function(data) {
			$scope.requesttypeidOptions = data.data;
		});
	}
	requesttypeidOptionsLoad();

	function requeststatusidOptionsLoad() {
		$http.get(requeststatusidOptionsApi)
		.then(function(data) {
			$scope.requeststatusidOptions = data.data;
		});
	}
	requeststatusidOptionsLoad();

	function currencycodeOptionsLoad() {
		$http.get(currencycodeOptionsApi)
		.then(function(data) {
			$scope.currencycodeOptions = data.data;
		});
	}
	currencycodeOptionsLoad();

	function countryidOptionsLoad() {
		$http.get(countryidOptionsApi)
		.then(function(data) {
			$scope.countryidOptions = data.data;
		});
	}
	countryidOptionsLoad();

	$scope.dataPage = 1;
	$scope.dataCount = 0;
	$scope.dataOffset = 0;
	$scope.dataLimit = 50;

	$scope.getPages = function() {
		return new Array($scope.dataPages);
	};

	$scope.nextPage = function() {
		if ($scope.dataPage < $scope.dataPages) {
			$scope.loadPage($scope.dataPage + 1);
		}
	};

	$scope.previousPage = function() {
		if ($scope.dataPage > 1) {
			$scope.loadPage($scope.dataPage - 1);
		}
	};

	$scope.loadPage = function(pageNumber) {
		$scope.dataPage = pageNumber;
		$http.get(api + '/count')
		.then(function(data) {
			$scope.dataCount = data.data;
			$scope.dataPages = Math.ceil($scope.dataCount / $scope.dataLimit);
			$http.get(api + '?$offset=' + ((pageNumber - 1) * $scope.dataLimit) + '&$limit=' + $scope.dataLimit)
			.then(function(data) {
				$scope.data = data.data;
			});
		});
	};
	$scope.loadPage($scope.dataPage);

	$scope.openNewDialog = function() {
		$scope.actionType = 'new';
		$scope.entity = {};
		toggleEntityModal();
	};

	$scope.openEditDialog = function(entity) {
		$scope.actionType = 'update';
		$scope.entity = entity;
		$scope.entityForm.$valid = true;
		toggleEntityModal();
	};

	$scope.openDeleteDialog = function(entity) {
		$scope.actionType = 'delete';
		$scope.entity = entity;
		toggleEntityModal();
	};

	$scope.close = function() {
		$scope.loadPage($scope.dataPage);
		toggleEntityModal();
	};

	$scope.create = function() {
		if ($scope.entityForm.$valid) {
			$http.post(api, JSON.stringify($scope.entity))
			.then(function(data) {
				$scope.loadPage($scope.dataPage);
				toggleEntityModal();
				$messageHub.messageEntityModified();
			}, function(data) {
				alert(JSON.stringify(data.data));
			});
		}
	};

	$scope.update = function() {
		if ($scope.entityForm.$valid) {
			$http.put(api + '/' + $scope.entity.Id, JSON.stringify($scope.entity))

			.then(function(data) {
				$scope.loadPage($scope.dataPage);
				toggleEntityModal();
				$messageHub.messageEntityModified();
			}, function(data) {
				alert(JSON.stringify(data.data));
			})
		}
	};

	$scope.delete = function() {
		$http.delete(api + '/' + $scope.entity.Id)
		.then(function(data) {
			$scope.loadPage($scope.dataPage);
			toggleEntityModal();
			$messageHub.messageEntityModified();
		}, function(data) {
			alert(JSON.stringify(data.data));
		});
	};

	$scope.updateCalculatedProperties = function() {
		var entity = $scope.entity;
	};

	$scope.dateOpenCalendar = function($event) {
		$scope.dateCalendarStatus.opened = true;
	};

	$scope.dateCalendarStatus = {
		opened: false
	};

	$scope.duedateOpenCalendar = function($event) {
		$scope.duedateCalendarStatus.opened = true;
	};

	$scope.duedateCalendarStatus = {
		opened: false
	};

	$scope.requesttypeidOptionValue = function(optionKey) {
		for (var i = 0 ; i < $scope.requesttypeidOptions.length; i ++) {
			if ($scope.requesttypeidOptions[i].Id === optionKey) {
				return $scope.requesttypeidOptions[i].Name;
			}
		}
		return null;
	};
	$scope.requeststatusidOptionValue = function(optionKey) {
		for (var i = 0 ; i < $scope.requeststatusidOptions.length; i ++) {
			if ($scope.requeststatusidOptions[i].Id === optionKey) {
				return $scope.requeststatusidOptions[i].Name;
			}
		}
		return null;
	};
	$scope.currencycodeOptionValue = function(optionKey) {
		for (var i = 0 ; i < $scope.currencycodeOptions.length; i ++) {
			if ($scope.currencycodeOptions[i].Code === optionKey) {
				return $scope.currencycodeOptions[i].Name;
			}
		}
		return null;
	};
	$scope.countryidOptionValue = function(optionKey) {
		for (var i = 0 ; i < $scope.countryidOptions.length; i ++) {
			if ($scope.countryidOptions[i].Id === optionKey) {
				return $scope.countryidOptions[i].Name;
			}
		}
		return null;
	};

	$messageHub.onEntityRefresh($scope.loadPage($scope.dataPage));
	$messageHub.onRequestTypeModified(requesttypeidOptionsLoad);
	$messageHub.onRequestStatusModified(requeststatusidOptionsLoad);
	$messageHub.onCurrencyModified(currencycodeOptionsLoad);
	$messageHub.onCountryModified(countryidOptionsLoad);

	function toggleEntityModal() {
		$('#entityModal').modal('toggle');
	}
});
