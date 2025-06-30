angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-agoreus.inquiry.Inquiry';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/js/codbex-agoreus/gen/api/inquiry/Inquiry.js";
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
					messageHub.showAlertError("Inquiry", `Unable to count Inquiry: '${response.message}'`);
					return;
				}
				$scope.dataCount = response.data;
				let offset = (pageNumber - 1) * $scope.dataLimit;
				let limit = $scope.dataLimit;
				entityApi.list(offset, limit).then(function (response) {
					if (response.status != 200) {
						messageHub.showAlertError("Inquiry", `Unable to list Inquiry: '${response.message}'`);
						return;
					}

					response.data.forEach(e => {
						if (e.Date) {
							e.Date = new Date(e.Date);
						}
						if (e.DueDate) {
							e.DueDate = new Date(e.DueDate);
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
			messageHub.showDialogWindow("Inquiry-details", {
				action: "select",
				entity: entity,
				optionsBuyer: $scope.optionsBuyer,
				optionsProduct: $scope.optionsProduct,
				optionsUoMId: $scope.optionsUoMId,
				optionsCurrency: $scope.optionsCurrency,
				optionsCountry: $scope.optionsCountry,
				optionsTrader: $scope.optionsTrader,
				optionsInquiryStatus: $scope.optionsInquiryStatus,
			});
		};

		$scope.createEntity = function () {
			$scope.selectedEntity = null;
			messageHub.showDialogWindow("Inquiry-details", {
				action: "create",
				entity: {},
				optionsBuyer: $scope.optionsBuyer,
				optionsProduct: $scope.optionsProduct,
				optionsUoMId: $scope.optionsUoMId,
				optionsCurrency: $scope.optionsCurrency,
				optionsCountry: $scope.optionsCountry,
				optionsTrader: $scope.optionsTrader,
				optionsInquiryStatus: $scope.optionsInquiryStatus,
			}, null, false);
		};

		$scope.updateEntity = function (entity) {
			messageHub.showDialogWindow("Inquiry-details", {
				action: "update",
				entity: entity,
				optionsBuyer: $scope.optionsBuyer,
				optionsProduct: $scope.optionsProduct,
				optionsUoMId: $scope.optionsUoMId,
				optionsCurrency: $scope.optionsCurrency,
				optionsCountry: $scope.optionsCountry,
				optionsTrader: $scope.optionsTrader,
				optionsInquiryStatus: $scope.optionsInquiryStatus,
			}, null, false);
		};

		$scope.deleteEntity = function (entity) {
			let id = entity.Id;
			messageHub.showDialogAsync(
				'Delete Inquiry?',
				`Are you sure you want to delete Inquiry? This action cannot be undone.`,
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
							messageHub.showAlertError("Inquiry", `Unable to delete Inquiry: '${response.message}'`);
							return;
						}
						$scope.loadPage($scope.dataPage);
						messageHub.postMessage("clearDetails");
					});
				}
			});
		};

		//----------------Dropdowns-----------------//
		$scope.optionsBuyer = [];
		$scope.optionsProduct = [];
		$scope.optionsUoMId = [];
		$scope.optionsCurrency = [];
		$scope.optionsCountry = [];
		$scope.optionsTrader = [];
		$scope.optionsInquiryStatus = [];

		$http.get("/services/js/codbex-agoreus/gen/api/entities/Partner.js").then(function (response) {
			$scope.optionsBuyer = response.data.map(e => {
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
			$scope.optionsCurrency = response.data.map(e => {
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
			$scope.optionsTrader = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$http.get("/services/js/codbex-agoreus/gen/api/entities/InquiryStatus.js").then(function (response) {
			$scope.optionsInquiryStatus = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});
		$scope.optionsBuyerValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsBuyer.length; i++) {
				if ($scope.optionsBuyer[i].value === optionKey) {
					return $scope.optionsBuyer[i].text;
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
		$scope.optionsCurrencyValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsCurrency.length; i++) {
				if ($scope.optionsCurrency[i].value === optionKey) {
					return $scope.optionsCurrency[i].text;
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
		$scope.optionsTraderValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsTrader.length; i++) {
				if ($scope.optionsTrader[i].value === optionKey) {
					return $scope.optionsTrader[i].text;
				}
			}
			return null;
		};
		$scope.optionsInquiryStatusValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsInquiryStatus.length; i++) {
				if ($scope.optionsInquiryStatus[i].value === optionKey) {
					return $scope.optionsInquiryStatus[i].text;
				}
			}
			return null;
		};
		//----------------Dropdowns-----------------//

	}]);
