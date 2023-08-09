angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-agoreus.entities.PurchaseOrder';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/js/codbex-agoreus/gen/api/entities/PurchaseOrder.js";
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
					messageHub.showAlertError("PurchaseOrder", `Unable to count PurchaseOrder: '${response.message}'`);
					return;
				}
				$scope.dataCount = response.data;
				let offset = (pageNumber - 1) * $scope.dataLimit;
				let limit = $scope.dataLimit;
				entityApi.list(offset, limit).then(function (response) {
					if (response.status != 200) {
						messageHub.showAlertError("PurchaseOrder", `Unable to list PurchaseOrder: '${response.message}'`);
						return;
					}
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
			messageHub.showDialogWindow("PurchaseOrder-details", {
				action: "select",
				entity: entity,
				optionsOrderId: $scope.optionsOrderId,
				optionsQuotationId: $scope.optionsQuotationId,
			});
		};

		$scope.createEntity = function () {
			$scope.selectedEntity = null;
			messageHub.showDialogWindow("PurchaseOrder-details", {
				action: "create",
				entity: {},
				optionsOrderId: $scope.optionsOrderId,
				optionsQuotationId: $scope.optionsQuotationId,
			}, null, false);
		};

		$scope.updateEntity = function (entity) {
			messageHub.showDialogWindow("PurchaseOrder-details", {
				action: "update",
				entity: entity,
				optionsOrderId: $scope.optionsOrderId,
				optionsQuotationId: $scope.optionsQuotationId,
			}, null, false);
		};

		$scope.deleteEntity = function (entity) {
			let id = entity.Id;
			messageHub.showDialogAsync(
				'Delete PurchaseOrder?',
				`Are you sure you want to delete PurchaseOrder? This action cannot be undone.`,
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
							messageHub.showAlertError("PurchaseOrder", `Unable to delete PurchaseOrder: '${response.message}'`);
							return;
						}
						$scope.loadPage($scope.dataPage);
						messageHub.postMessage("clearDetails");
					});
				}
			});
		};

		//----------------Dropdowns-----------------//
		$scope.optionsOrderId = [];
		$scope.optionsQuotationId = [];

		$http.get("/services/js/codbex-agoreus/gen/api/order/Order.js").then(function (response) {
			$scope.optionsOrderId = response.data.map(e => {
				return {
					value: e.id,
					text: e.Name
				}
			});
		});

		$http.get("/services/js/codbex-agoreus/gen/api/quotation/Quotation.js").then(function (response) {
			$scope.optionsQuotationId = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});
		$scope.optionsOrderIdValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsOrderId.length; i++) {
				if ($scope.optionsOrderId[i].value === optionKey) {
					return $scope.optionsOrderId[i].text;
				}
			}
			return null;
		};
		$scope.optionsQuotationIdValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsQuotationId.length; i++) {
				if ($scope.optionsQuotationId[i].value === optionKey) {
					return $scope.optionsQuotationId[i].text;
				}
			}
			return null;
		};
		//----------------Dropdowns-----------------//

	}]);
