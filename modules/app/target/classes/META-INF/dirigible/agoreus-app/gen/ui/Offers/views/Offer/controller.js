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
		messageHub.post({data: data}, 'agoreus-app.Offers.Offer.' + evtName);
	};

	var on = function(topic, callback){
		messageHub.subscribe(callback, topic);
	};

	return {
		message: message,
		on: on,
		onEntityRefresh: function(callback) {
			on('agoreus-app.Offers.Offer.refresh', callback);
		},
		onRequestModified: function(callback) {
			on('agoreus-app.Offers.Request.modified', callback);
		},
		onOfferStatusModified: function(callback) {
			on('agoreus-app.Offers.OfferStatus.modified', callback);
		},
		messageEntityModified: function() {
			message('modified');
		}
	};
}])
.controller('PageController', function ($scope, $http, $messageHub) {

	var api = '/services/v4/js/agoreus-app/gen/api/Offers/Offer.js';
	var requestidOptionsApi = '/services/v4/js/agoreus-app/gen/api/Requests/Request.js';
	var offerstatusidOptionsApi = '/services/v4/js/agoreus-app/gen/api/Nomenclatures/OfferStatus.js';

	$scope.requestidOptions = [];

	$scope.offerstatusidOptions = [];

	$scope.dateOptions = {
		startingDay: 1
	};
	$scope.dateFormats = ['yyyy/MM/dd', 'dd-MMMM-yyyy', 'dd.MM.yyyy', 'shortDate'];
	$scope.monthFormats = ['yyyy/MM', 'MMMM-yyyy', 'MM.yyyy', 'MMMM/yyyy'];
	$scope.weekFormats = ['yyyy/w', 'w-yyyy', 'w.yyyy', 'w/yyyy', "w"];
	$scope.dateFormat = $scope.dateFormats[0];
	$scope.monthFormat = $scope.monthFormats[1];
	$scope.weekFormat = $scope.weekFormats[3];

	function requestidOptionsLoad() {
		$http.get(requestidOptionsApi)
		.then(function(data) {
			$scope.requestidOptions = data.data;
		});
	}
	requestidOptionsLoad();

	function offerstatusidOptionsLoad() {
		$http.get(offerstatusidOptionsApi)
		.then(function(data) {
			$scope.offerstatusidOptions = data.data;
		});
	}
	offerstatusidOptionsLoad();

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

	$scope.validitydateOpenCalendar = function($event) {
		$scope.validitydateCalendarStatus.opened = true;
	};

	$scope.validitydateCalendarStatus = {
		opened: false
	};

	$scope.requestidOptionValue = function(optionKey) {
		for (var i = 0 ; i < $scope.requestidOptions.length; i ++) {
			if ($scope.requestidOptions[i].Id === optionKey) {
				return $scope.requestidOptions[i].Name;
			}
		}
		return null;
	};
	$scope.offerstatusidOptionValue = function(optionKey) {
		for (var i = 0 ; i < $scope.offerstatusidOptions.length; i ++) {
			if ($scope.offerstatusidOptions[i].Id === optionKey) {
				return $scope.offerstatusidOptions[i].Name;
			}
		}
		return null;
	};

	$messageHub.onEntityRefresh($scope.loadPage($scope.dataPage));
	$messageHub.onRequestModified(requestidOptionsLoad);
	$messageHub.onOfferStatusModified(offerstatusidOptionsLoad);

	function toggleEntityModal() {
		$('#entityModal').modal('toggle');
	}
});
