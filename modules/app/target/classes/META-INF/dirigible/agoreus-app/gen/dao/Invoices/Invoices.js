var query = require("db/v4/query");
var producer = require("messaging/v4/producer");
var daoApi = require("db/v4/dao");
var EntityUtils = require("agoreus-app/gen/dao/utils/EntityUtils");

var dao = daoApi.create({
	table: "AGOREUS_INVOICES",
	properties: [
		{
			name: "Id",
			column: "INVOICES_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		}, {
			name: "Date",
			column: "INVOICES_DATE",
			type: "DATE",
		}, {
			name: "OfferId",
			column: "INVOICES_OFFERID",
			type: "INTEGER",
		}, {
			name: "ProductId",
			column: "INVOICES_PRODUCTID",
			type: "INTEGER",
		}, {
			name: "Quantity",
			column: "INVOICES_QUANTITY",
			type: "DOUBLE",
		}, {
			name: "UoMId",
			column: "INVOICES_UOMID",
			type: "INTEGER",
		}, {
			name: "CurrencyCode",
			column: "INVOICES_CURRENCYCODE",
			type: "CHAR",
		}, {
			name: "Price",
			column: "INVOICES_PRICE",
			type: "DOUBLE",
		}, {
			name: "Total",
			column: "INVOICES_TOTAL",
			type: "DOUBLE",
		}, {
			name: "BuyerId",
			column: "INVOICES_BUYERID",
			type: "INTEGER",
		}, {
			name: "SupplierId",
			column: "INVOICES_SUPPLIERID",
			type: "INTEGER",
		}, {
			name: "TraderId",
			column: "INVOICES_TRADERID",
			type: "INTEGER",
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
		table: "AGOREUS_INVOICES",
		key: {
			name: "Id",
			column: "INVOICES_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	EntityUtils.setLocalDate(entity, "Date");
	dao.update(entity);
	triggerEvent("Update", {
		table: "AGOREUS_INVOICES",
		key: {
			name: "Id",
			column: "INVOICES_ID",
			value: entity.Id
		}
	});
};

exports.delete = function(id) {
	dao.remove(id);
	triggerEvent("Delete", {
		table: "AGOREUS_INVOICES",
		key: {
			name: "Id",
			column: "INVOICES_ID",
			value: id
		}
	});
};

exports.count = function() {
	return dao.count();
};

exports.customDataCount = function() {
	var resultSet = query.execute("SELECT COUNT(*) AS COUNT FROM AGOREUS_INVOICES");
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
	producer.queue("agoreus-app/Invoices/Invoices/" + operation).send(JSON.stringify(data));
}