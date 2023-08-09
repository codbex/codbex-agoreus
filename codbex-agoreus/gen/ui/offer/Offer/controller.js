angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-agoreus.offer.Offer';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/js/codbex-agoreus/gen/api/offer/Offer.js";
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
					messageHub.showAlertError("Offer", `Unable to count Offer: '${response.message}'`);
					return;
				}
				$scope.dataCount = response.data;
				let offset = (pageNumber - 1) * $scope.dataLimit;
				let limit = $scope.dataLimit;
				entityApi.list(offset, limit).then(function (response) {
					if (response.status != 200) {
						messageHub.showAlertError("Offer", `Unable to list Offer: '${response.message}'`);
						return;
					}

					response.data.forEach(e => {
						if (e.Date) {
							e.Date = new Date(e.Date);
						}
						if (e.ExpiryDate) {
							e.ExpiryDate = new Date(e.ExpiryDate);
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
			messageHub.showDialogWindow("Offer-details", {
				action: "select",
				entity: entity,
				optionsProduct: $scope.optionsProduct,
				optionsUoMId: $scope.optionsUoMId,
				optionsCurrencyCode: $scope.optionsCurrencyCode,
				optionsCountry: $scope.optionsCountry,
				optionsSupplier: $scope.optionsSupplier,
				optionsTrader: $scope.optionsTrader,
				optionsOfferStatus: $scope.optionsOfferStatus,
			});
		};

		$scope.createEntity = function () {
			$scope.selectedEntity = null;
			messageHub.showDialogWindow("Offer-details", {
				action: "create",
				entity: {},
				optionsProduct: $scope.optionsProduct,
				optionsUoMId: $scope.optionsUoMId,
				optionsCurrencyCode: $scope.optionsCurrencyCode,
				optionsCountry: $scope.optionsCountry,
				optionsSupplier: $scope.optionsSupplier,
				optionsTrader: $scope.optionsTrader,
				optionsOfferStatus: $scope.optionsOfferStatus,
			}, null, false);
		};

		$scope.updateEntity = function (entity) {
			messageHub.showDialogWindow("Offer-details", {
				action: "update",
				entity: entity,
				optionsProduct: $scope.optionsProduct,
				optionsUoMId: $scope.optionsUoMId,
				optionsCurrencyCode: $scope.optionsCurrencyCode,
				optionsCountry: $scope.optionsCountry,
				optionsSupplier: $scope.optionsSupplier,
				optionsTrader: $scope.optionsTrader,
				optionsOfferStatus: $scope.optionsOfferStatus,
			}, null, false);
		};

		$scope.deleteEntity = function (entity) {
			let id = entity.Id;
			messageHub.showDialogAsync(
				'Delete Offer?',
				`Are you sure you want to delete Offer? This action cannot be undone.`,
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
							messageHub.showAlertError("Offer", `Unable to delete Offer: '${response.message}'`);
							return;
						}
						$scope.loadPage($scope.dataPage);
						messageHub.postMessage("clearDetails");
					});
				}
			});
		};

		//----------------Dropdowns-----------------//
		$scope.optionsProduct = [];
		$scope.optionsUoMId = [];
		$scope.optionsCurrencyCode = [];
		$scope.optionsCountry = [];
		$scope.optionsSupplier = [];
		$scope.optionsTrader = [];
		$scope.optionsOfferStatus = [];

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

		$http.get("/services/js/codbex-agoreus/gen/api/entities/Country.js").then(function (response) {
			$scope.optionsCountry = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$http.get("/services/js/codbex-agoreus/gen/api/entities/Partner.js").then(function (response) {
			$scope.optionsSupplier = response.data.map(e => {
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

		$http.get("/services/js/codbex-agoreus/gen/api/entities/OfferStatus.js").then(function (response) {
			$scope.optionsOfferStatus = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});
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
		$scope.optionsCountryValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsCountry.length; i++) {
				if ($scope.optionsCountry[i].value === optionKey) {
					return $scope.optionsCountry[i].text;
				}
			}
			return null;
		};
		$scope.optionsSupplierValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsSupplier.length; i++) {
				if ($scope.optionsSupplier[i].value === optionKey) {
					return $scope.optionsSupplier[i].text;
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
		$scope.optionsOfferStatusValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsOfferStatus.length; i++) {
				if ($scope.optionsOfferStatus[i].value === optionKey) {
					return $scope.optionsOfferStatus[i].text;
				}
			}
			return null;
		};
		//----------------Dropdowns-----------------//

	}]);
