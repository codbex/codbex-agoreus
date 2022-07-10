var query = require("db/v4/query");
var producer = require("messaging/v4/producer");
var daoApi = require("db/v4/dao");

var dao = daoApi.create({
	table: "AGOREUS_PAYMENT",
	properties: [
		{
			name: "Id",
			column: "PAYMENT_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		}, {
			name: "InvoicesId",
			column: "PAYMENT_INVOICESID",
			type: "INTEGER",
		}, {
			name: "CurrencyCode",
			column: "PAYMENT_CURRENCYCODE",
			type: "CHAR",
		}, {
			name: "Amount",
			column: "PAYMENT_AMOUNT",
			type: "VARCHAR",
		}, {
			name: "TraderId",
			column: "PAYMENT_TRADERID",
			type: "INTEGER",
		}, {
			name: "BuyerId",
			column: "PAYMENT_BUYERID",
			type: "INTEGER",
		}, {
			name: "SupplierId",
			column: "PAYMENT_SUPPLIERID",
			type: "INTEGER",
		}]
});

exports.list = function(settings) {
	return dao.list(settings);
};

exports.get = function(id) {
	return dao.find(id);
};

exports.create = function(entity) {
	var id = dao.insert(entity);
	triggerEvent("Create", {
		table: "AGOREUS_PAYMENT",
		key: {
			name: "Id",
			column: "PAYMENT_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	dao.update(entity);
	triggerEvent("Update", {
		table: "AGOREUS_PAYMENT",
		key: {
			name: "Id",
			column: "PAYMENT_ID",
			value: entity.Id
		}
	});
};

exports.delete = function(id) {
	dao.remove(id);
	triggerEvent("Delete", {
		table: "AGOREUS_PAYMENT",
		key: {
			name: "Id",
			column: "PAYMENT_ID",
			value: id
		}
	});
};

exports.count = function() {
	return dao.count();
};

exports.customDataCount = function() {
	var resultSet = query.execute("SELECT COUNT(*) AS COUNT FROM AGOREUS_PAYMENT");
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
	producer.queue("agoreus-app/Invoices/Payment/" + operation).send(JSON.stringify(data));
}