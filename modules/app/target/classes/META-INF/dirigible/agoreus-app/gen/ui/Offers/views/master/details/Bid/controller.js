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
		messageHub.post({data: data}, 'agoreus-app.Offers.Bid.' + evtName);
	};

	var on = function(topic, callback){
		messageHub.subscribe(callback, topic);
	};

	return {
		message: message,
		on: on,
		onEntityRefresh: function(callback) {
			on('agoreus-app.Offers.Bid.refresh', callback);
		},
		onProductModified: function(callback) {
			on('agoreus-app.Offers.Product.modified', callback);
		},
		onUoMModified: function(callback) {
			on('agoreus-app.Offers.UoM.modified', callback);
		},
		onCurrencyModified: function(callback) {
			on('agoreus-app.Offers.Currency.modified', callback);
		},
		onBuyerModified: function(callback) {
			on('agoreus-app.Offers.Buyer.modified', callback);
		},
		onTraderModified: function(callback) {
			on('agoreus-app.Offers.Trader.modified', callback);
		},
		onBidStatusModified: function(callback) {
			on('agoreus-app.Offers.BidStatus.modified', callback);
		},
		onOfferSelected: function(callback) {
			on('agoreus-app.Offers.Offer.selected', callback);
		},
		messageEntityModified: function() {
			message('modified');
		}
	};
}])
.controller('PageController', function ($scope, $http, $messageHub) {

	var api = '/services/v4/js/agoreus-app/gen/api/Offers/Bid.js';
	var productidOptionsApi = '/services/v4/js/agoreus-app/gen/api/Nomenclatures/Product.js';
	var uomidOptionsApi = '/services/v4/js/agoreus-app/gen/api/Nomenclatures/UoM.js';
	var currencycodeOptionsApi = '/services/v4/js/agoreus-app/gen/api/Nomenclatures/Currency.js';
	var buyeridOptionsApi = '/services/v4/js/agoreus-app/gen/api/Partners/Buyer.js';
	var traderidOptionsApi = '/services/v4/js/agoreus-app/gen/api/Partners/Trader.js';
	var bidstatusidOptionsApi = '/services/v4/js/agoreus-app/gen/api/Nomenclatures/BidStatus.js';

	$scope.dateOptions = {
		startingDay: 1
	};
	$scope.dateFormats = ['yyyy/MM/dd', 'dd-MMMM-yyyy', 'dd.MM.yyyy', 'shortDate'];
	$scope.monthFormats = ['yyyy/MM', 'MMMM-yyyy', 'MM.yyyy', 'MMMM/yyyy'];
	$scope.weekFormats = ['yyyy/w', 'w-yyyy', 'w.yyyy', 'w/yyyy', "w"];
	$scope.dateFormat = $scope.dateFormats[0];
	$scope.monthFormat = $scope.monthFormats[1];
	$scope.weekFormat = $scope.weekFormats[3];

	$scope.productidOptions = [];

	$scope.uomidOptions = [];

	$scope.currencycodeOptions = [];

	$scope.buyeridOptions = [];

	$scope.traderidOptions = [];

	$scope.bidstatusidOptions = [];

	function productidOptionsLoad() {
		$http.get(productidOptionsApi)
		.then(function(data) {
			$scope.productidOptions = data.data;
		});
	}
	productidOptionsLoad();

	function uomidOptionsLoad() {
		$http.get(uomidOptionsApi)
		.then(function(data) {
			$scope.uomidOptions = data.data;
		});
	}
	uomidOptionsLoad();

	function currencycodeOptionsLoad() {
		$http.get(currencycodeOptionsApi)
		.then(function(data) {
			$scope.currencycodeOptions = data.data;
		});
	}
	currencycodeOptionsLoad();

	function buyeridOptionsLoad() {
		$http.get(buyeridOptionsApi)
		.then(function(data) {
			$scope.buyeridOptions = data.data;
		});
	}
	buyeridOptionsLoad();

	function traderidOptionsLoad() {
		$http.get(traderidOptionsApi)
		.then(function(data) {
			$scope.traderidOptions = data.data;
		});
	}
	traderidOptionsLoad();

	function bidstatusidOptionsLoad() {
		$http.get(bidstatusidOptionsApi)
		.then(function(data) {
			$scope.bidstatusidOptions = data.data;
		});
	}
	bidstatusidOptionsLoad();

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
			$http.get(api + '?OfferId=' + $scope.masterEntityId + '&$offset=' + ((pageNumber - 1) * $scope.dataLimit) + '&$limit=' + $scope.dataLimit)
			.then(function(data) {
				$scope.data = data.data;
			});
		});
	};

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
			$scope.entity.OfferId = $scope.masterEntityId;
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
			$scope.entity.OfferId = $scope.masterEntityId;

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
			alert(JSON.stringify(data));
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

	$scope.productidOptionValue = function(optionKey) {
		for (var i = 0 ; i < $scope.productidOptions.length; i ++) {
			if ($scope.productidOptions[i].Id === optionKey) {
				return $scope.productidOptions[i].Name;
			}
		}
		return null;
	};
	$scope.uomidOptionValue = function(optionKey) {
		for (var i = 0 ; i < $scope.uomidOptions.length; i ++) {
			if ($scope.uomidOptions[i].Id === optionKey) {
				return $scope.uomidOptions[i].Name;
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
	$scope.buyeridOptionValue = function(optionKey) {
		for (var i = 0 ; i < $scope.buyeridOptions.length; i ++) {
			if ($scope.buyeridOptions[i].Id === optionKey) {
				return $scope.buyeridOptions[i].Name;
			}
		}
		return null;
	};
	$scope.traderidOptionValue = function(optionKey) {
		for (var i = 0 ; i < $scope.traderidOptions.length; i ++) {
			if ($scope.traderidOptions[i].Id === optionKey) {
				return $scope.traderidOptions[i].Name;
			}
		}
		return null;
	};
	$scope.bidstatusidOptionValue = function(optionKey) {
		for (var i = 0 ; i < $scope.bidstatusidOptions.length; i ++) {
			if ($scope.bidstatusidOptions[i].Id === optionKey) {
				return $scope.bidstatusidOptions[i].Name;
			}
		}
		return null;
	};

	$messageHub.onEntityRefresh($scope.loadPage($scope.dataPage));
	$messageHub.onProductModified(productidOptionsLoad);
	$messageHub.onUoMModified(uomidOptionsLoad);
	$messageHub.onCurrencyModified(currencycodeOptionsLoad);
	$messageHub.onBuyerModified(buyeridOptionsLoad);
	$messageHub.onTraderModified(traderidOptionsLoad);
	$messageHub.onBidStatusModified(bidstatusidOptionsLoad);

	$messageHub.onOfferSelected(function(event) {
		$scope.masterEntityId = event.data.id;
		$scope.loadPage($scope.dataPage);
	});

	function toggleEntityModal() {
		$('#entityModal').modal('toggle');
	}
});
