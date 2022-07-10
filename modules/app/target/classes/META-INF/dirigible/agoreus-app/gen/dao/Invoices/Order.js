var query = require("db/v4/query");
var producer = require("messaging/v4/producer");
var daoApi = require("db/v4/dao");
var EntityUtils = require("agoreus-app/gen/dao/utils/EntityUtils");

var dao = daoApi.create({
	table: "AGOREUS_ORDER",
	properties: [
		{
			name: "Id",
			column: "ORDER_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		}, {
			name: "BuyerId",
			column: "ORDER_BUYERID",
			type: "INTEGER",
		}, {
			name: "SupplierId",
			column: "ORDER_SUPPLIERID",
			type: "INTEGER",
		}, {
			name: "Name",
			column: "ORDER_NAME",
			type: "VARCHAR",
		}, {
			name: "Date",
			column: "ORDER_DATE",
			type: "DATE",
		}, {
			name: "ProductId",
			column: "ORDER_PRODUCTID",
			type: "INTEGER",
		}, {
			name: "Quantity",
			column: "ORDER_QUANTITY",
			type: "DOUBLE",
		}, {
			name: "UoMId",
			column: "ORDER_UOMID",
			type: "INTEGER",
		}, {
			name: "CurrencyCode",
			column: "ORDER_CURRENCYCODE",
			type: "CHAR",
		}, {
			name: "Price",
			column: "ORDER_PRICE",
			type: "DOUBLE",
		}, {
			name: "Total",
			column: "ORDER_TOTAL",
			type: "DOUBLE",
		}]
});

exports.list = function(settings) {
	return dao.list(settings).map(function(e) {
		EntityUtils.setLocalDate(e, "Date");
		return e;
	});
};

exports.get = function(id) {
	var entity = dao.find(id);
	EntityUtils.setLocalDate(entity, "Date");
	return entity;
};

exports.create = function(entity) {
	EntityUtils.setLocalDate(entity, "Date");
	var id = dao.insert(entity);
	triggerEvent("Create", {
		table: "AGOREUS_ORDER",
		key: {
			name: "Id",
			column: "ORDER_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	EntityUtils.setLocalDate(entity, "Date");
	dao.update(entity);
	triggerEvent("Update", {
		table: "AGOREUS_ORDER",
		key: {
			name: "Id",
			column: "ORDER_ID",
			value: entity.Id
		}
	});
};

exports.delete = function(id) {
	dao.remove(id);
	triggerEvent("Delete", {
		table: "AGOREUS_ORDER",
		key: {
			name: "Id",
			column: "ORDER_ID",
			value: id
		}
	});
};

exports.count = function() {
	return dao.count();
};

exports.customDataCount = function() {
	var resultSet = query.execute("SELECT COUNT(*) AS COUNT FROM AGOREUS_ORDER");
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
	producer.queue("agoreus-app/Invoices/Order/" + operation).send(JSON.stringify(data));
}