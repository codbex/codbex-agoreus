angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-agoreus.bid.Bid';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/js/codbex-agoreus/gen/api/bid/Bid.js";
	}])
	.controller('PageController', ['$scope', '$http', 'messageHub', 'entityApi', function ($scope, $http, messageHub, entityApi) {

		function resetPagination() {
			$scope.dataPage = 1;
			$scope.dataCount = 0;
			$scope.dataLimit = 20;
		}
		resetPagination();

		//-----------------Events-------------------//
		messageHub.onDidReceiveMessage("entityCreated", function (msg) {
			$scope.loadPage($scope.dataPage);
		});

		messageHub.onDidReceiveMessage("entityUpdated", function (msg) {
			$scope.loadPage($scope.dataPage);
		});
		//-----------------Events-------------------//

		$scope.loadPage = function (pageNumber) {
			$scope.dataPage = pageNumber;
			entityApi.count().then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("Bid", `Unable to count Bid: '${response.message}'`);
					return;
				}
				$scope.dataCount = response.data;
				let offset = (pageNumber - 1) * $scope.dataLimit;
				let limit = $scope.dataLimit;
				entityApi.list(offset, limit).then(function (response) {
					if (response.status != 200) {
						messageHub.showAlertError("Bid", `Unable to list Bid: '${response.message}'`);
						return;
					}

					response.data.forEach(e => {
						if (e.Date) {
							e.Date = new Date(e.Date);
						}
						if (e.ValidityDate) {
							e.ValidityDate = new Date(e.ValidityDate);
						}
					});

					$scope.data = response.data;
				});
			});
		};
		$scope.loadPage($scope.dataPage);

		$scope.selectEntity = function (entity) {
			$scope.selectedEntity = entity;
		};

		$scope.openDetails = function (entity) {
			$scope.selectedEntity = entity;
			messageHub.showDialogWindow("Bid-details", {
				action: "select",
				entity: entity,
				optionsOffer: $scope.optionsOffer,
				optionsProduct: $scope.optionsProduct,
				optionsUoMId: $scope.optionsUoMId,
				optionsCurrencyCode: $scope.optionsCurrencyCode,
				optionsBuyer: $scope.optionsBuyer,
				optionsTrader: $scope.optionsTrader,
			});
		};

		$scope.createEntity = function () {
			$scope.selectedEntity = null;
			messageHub.showDialogWindow("Bid-details", {
				action: "create",
				entity: {},
				optionsOffer: $scope.optionsOffer,
				optionsProduct: $scope.optionsProduct,
				optionsUoMId: $scope.optionsUoMId,
				optionsCurrencyCode: $scope.optionsCurrencyCode,
				optionsBuyer: $scope.optionsBuyer,
				optionsTrader: $scope.optionsTrader,
			}, null, false);
		};

		$scope.updateEntity = function (entity) {
			messageHub.showDialogWindow("Bid-details", {
				action: "update",
				entity: entity,
				optionsOffer: $scope.optionsOffer,
				optionsProduct: $scope.optionsProduct,
				optionsUoMId: $scope.optionsUoMId,
				optionsCurrencyCode: $scope.optionsCurrencyCode,
				optionsBuyer: $scope.optionsBuyer,
				optionsTrader: $scope.optionsTrader,
			}, null, false);
		};

		$scope.deleteEntity = function (entity) {
			let id = entity.Id;
			messageHub.showDialogAsync(
				'Delete Bid?',
				`Are you sure you want to delete Bid? This action cannot be undone.`,
				[{
					id: "delete-btn-yes",
					type: "emphasized",
					label: "Yes",
				},
				{
					id: "delete-btn-no",
					type: "normal",
					label: "No",
				}],
			).then(function (msg) {
				if (msg.data === "delete-btn-yes") {
					entityApi.delete(id).then(function (response) {
						if (response.status != 204) {
							messageHub.showAlertError("Bid", `Unable to delete Bid: '${response.message}'`);
							return;
						}
						$scope.loadPage($scope.dataPage);
						messageHub.postMessage("clearDetails");
					});
				}
			});
		};

		//----------------Dropdowns-----------------//
		$scope.optionsOffer = [];
		$scope.optionsProduct = [];
		$scope.optionsUoMId = [];
		$scope.optionsCurrencyCode = [];
		$scope.optionsBuyer = [];
		$scope.optionsTrader = [];

		$http.get("/services/js/codbex-agoreus/gen/api/offer/Offer.js").then(function (response) {
			$scope.optionsOffer = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$http.get("/services/js/codbex-agoreus/gen/api/entities/Product.js").then(function (response) {
			$scope.optionsProduct = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$http.get("/services/js/codbex-agoreus/gen/api/entities/UoM.js").then(function (response) {
			$scope.optionsUoMId = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$http.get("/services/js/codbex-agoreus/gen/api/entities/Currency.js").then(function (response) {
			$scope.optionsCurrencyCode = response.data.map(e => {
				return {
					value: e.Code,
					text: e.Code
				}
			});
		});

		$http.get("/services/js/codbex-agoreus/gen/api/entities/Partner.js").then(function (response) {
			$scope.optionsBuyer = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$http.get("/services/js/codbex-agoreus/gen/api/entities/Partner.js").then(function (response) {
			$scope.optionsTrader = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});
		$scope.optionsOfferValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsOffer.length; i++) {
				if ($scope.optionsOffer[i].value === optionKey) {
					return $scope.optionsOffer[i].text;
				}
			}
			return null;
		};
		$scope.optionsProductValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsProduct.length; i++) {
				if ($scope.optionsProduct[i].value === optionKey) {
					return $scope.optionsProduct[i].text;
				}
			}
			return null;
		};
		$scope.optionsUoMIdValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsUoMId.length; i++) {
				if ($scope.optionsUoMId[i].value === optionKey) {
					return $scope.optionsUoMId[i].text;
				}
			}
			return null;
		};
		$scope.optionsCurrencyCodeValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsCurrencyCode.length; i++) {
				if ($scope.optionsCurrencyCode[i].value === optionKey) {
					return $scope.optionsCurrencyCode[i].text;
				}
			}
			return null;
		};
		$scope.optionsBuyerValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsBuyer.length; i++) {
				if ($scope.optionsBuyer[i].value === optionKey) {
					return $scope.optionsBuyer[i].text;
				}
			}
			return null;
		};
		$scope.optionsTraderValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsTrader.length; i++) {
				if ($scope.optionsTrader[i].value === optionKey) {
					return $scope.optionsTrader[i].text;
				}
			}
			return null;
		};
		//----------------Dropdowns-----------------//

	}]);
