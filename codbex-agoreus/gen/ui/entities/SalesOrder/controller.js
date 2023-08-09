angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-agoreus.entities.SalesOrder';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/js/codbex-agoreus/gen/api/entities/SalesOrder.js";
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
					messageHub.showAlertError("SalesOrder", `Unable to count SalesOrder: '${response.message}'`);
					return;
				}
				$scope.dataCount = response.data;
				let offset = (pageNumber - 1) * $scope.dataLimit;
				let limit = $scope.dataLimit;
				entityApi.list(offset, limit).then(function (response) {
					if (response.status != 200) {
						messageHub.showAlertError("SalesOrder", `Unable to list SalesOrder: '${response.message}'`);
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
			messageHub.showDialogWindow("SalesOrder-details", {
				action: "select",
				entity: entity,
				optionsOrder: $scope.optionsOrder,
				optionsBid: $scope.optionsBid,
			});
		};

		$scope.createEntity = function () {
			$scope.selectedEntity = null;
			messageHub.showDialogWindow("SalesOrder-details", {
				action: "create",
				entity: {},
				optionsOrder: $scope.optionsOrder,
				optionsBid: $scope.optionsBid,
			}, null, false);
		};

		$scope.updateEntity = function (entity) {
			messageHub.showDialogWindow("SalesOrder-details", {
				action: "update",
				entity: entity,
				optionsOrder: $scope.optionsOrder,
				optionsBid: $scope.optionsBid,
			}, null, false);
		};

		$scope.deleteEntity = function (entity) {
			let id = entity.Id;
			messageHub.showDialogAsync(
				'Delete SalesOrder?',
				`Are you sure you want to delete SalesOrder? This action cannot be undone.`,
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
							messageHub.showAlertError("SalesOrder", `Unable to delete SalesOrder: '${response.message}'`);
							return;
						}
						$scope.loadPage($scope.dataPage);
						messageHub.postMessage("clearDetails");
					});
				}
			});
		};

		//----------------Dropdowns-----------------//
		$scope.optionsOrder = [];
		$scope.optionsBid = [];

		$http.get("/services/js/codbex-agoreus/gen/api/order/Order.js").then(function (response) {
			$scope.optionsOrder = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$http.get("/services/js/codbex-agoreus/gen/api/bid/Bid.js").then(function (response) {
			$scope.optionsBid = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});
		$scope.optionsOrderValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsOrder.length; i++) {
				if ($scope.optionsOrder[i].value === optionKey) {
					return $scope.optionsOrder[i].text;
				}
			}
			return null;
		};
		$scope.optionsBidValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsBid.length; i++) {
				if ($scope.optionsBid[i].value === optionKey) {
					return $scope.optionsBid[i].text;
				}
			}
			return null;
		};
		//----------------Dropdowns-----------------//

	}]);
