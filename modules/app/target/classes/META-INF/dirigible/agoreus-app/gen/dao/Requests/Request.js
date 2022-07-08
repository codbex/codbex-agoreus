var query = require("db/v4/query");
var producer = require("messaging/v4/producer");
var daoApi = require("db/v4/dao");
var EntityUtils = require("agoreus-app/gen/dao/utils/EntityUtils");

var dao = daoApi.create({
	table: "AGOREUS_REQUEST",
	properties: [
		{
			name: "Id",
			column: "REQUEST_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		}, {
			name: "RequestTypeId",
			column: "REQUEST_REQUESTTYPEID",
			type: "INTEGER",
		}, {
			name: "PartnerId",
			column: "REQUEST_PARTNERID",
			type: "INTEGER",
		}, {
			name: "Name",
			column: "REQUEST_NAME",
			type: "VARCHAR",
		}, {
			name: "Date",
			column: "REQUEST_CREATIONDATE",
			type: "DATE",
		}, {
			name: "RequestStatusId",
			column: "REQUEST_REQUESTSTATUSID",
			type: "INTEGER",
		}, {
			name: "ProductId",
			column: "REQUEST_PRODUCTID",
			type: "INTEGER",
		}, {
			name: "Quantity",
			column: "REQUEST_QUANTITY",
			type: "DOUBLE",
		}, {
			name: "UoMId",
			column: "REQUEST_UOMID",
			type: "INTEGER",
		}, {
			name: "CurrencyCode",
			column: "REQUEST_CURRENCYCODE",
			type: "CHAR",
		}, {
			name: "Price",
			column: "REQUEST_PRICE",
			type: "DOUBLE",
		}, {
			name: "Total",
			column: "REQUEST_TOTAL",
			type: "DOUBLE",
		}, {
			name: "DueDate",
			column: "REQUEST_DUEDATE",
			type: "DATE",
		}, {
			name: "Location",
			column: "REQUEST_LOCATION",
			type: "VARCHAR",
		}, {
			name: "CountryId",
			column: "REQUEST_COUNTRYID",
			type: "INTEGER",
		}, {
			name: "TraderId",
			column: "REQUEST_TRADERID",
			type: "INTEGER",
		}]
});

exports.list = function(settings) {
	return dao.list(settings).map(function(e) {
		EntityUtils.setLocalDate(e, "Date");
		EntityUtils.setLocalDate(e, "DueDate");
		return e;
	});
};

exports.get = function(id) {
	var entity = dao.find(id);
	EntityUtils.setLocalDate(entity, "Date");
	EntityUtils.setLocalDate(entity, "DueDate");
	return entity;
};

exports.create = function(entity) {
	EntityUtils.setLocalDate(entity, "Date");
	EntityUtils.setLocalDate(entity, "DueDate");
	var id = dao.insert(entity);
	triggerEvent("Create", {
		table: "AGOREUS_REQUEST",
		key: {
			name: "Id",
			column: "REQUEST_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	EntityUtils.setLocalDate(entity, "Date");
	EntityUtils.setLocalDate(entity, "DueDate");
	dao.update(entity);
	triggerEvent("Update", {
		table: "AGOREUS_REQUEST",
		key: {
			name: "Id",
			column: "REQUEST_ID",
			value: entity.Id
		}
	});
};

exports.delete = function(id) {
	dao.remove(id);
	triggerEvent("Delete", {
		table: "AGOREUS_REQUEST",
		key: {
			name: "Id",
			column: "REQUEST_ID",
			value: id
		}
	});
};

exports.count = function() {
	return dao.count();
};

exports.customDataCount = function() {
	var resultSet = query.execute("SELECT COUNT(*) AS COUNT FROM AGOREUS_REQUEST");
	if (resultSet !== null && resultSet[0] !== null) {
		if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
			return resultSet[0].COUNT;
		} else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
			return resultSet[0].count;
		}
	}
	return 0;
};

function triggerEvent(operation, data) {
	producer.queue("agoreus-app/Requests/Request/" + operation).send(JSON.stringify(data));
}