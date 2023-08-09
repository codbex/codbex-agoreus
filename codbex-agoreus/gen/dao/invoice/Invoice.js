const query = require("db/query");
const producer = require("messaging/producer");
const daoApi = require("db/dao");
const EntityUtils = require("codbex-agoreus/gen/dao/utils/EntityUtils");

let dao = daoApi.create({
	table: "CODBEX_INVOICE",
	properties: [
		{
			name: "Id",
			column: "INVOICE_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "Date",
			column: "INVOICE_DATE",
			type: "DATE",
		},
 {
			name: "Quantity",
			column: "INVOICE_QUANTITY",
			type: "DOUBLE",
		},
 {
			name: "Price",
			column: "INVOICE_PRICE",
			type: "DOUBLE",
		},
 {
			name: "Total",
			column: "INVOICE_TOTAL",
			type: "DOUBLE",
		},
 {
			name: "UoM",
			column: "INVOICE_UOM",
			type: "INTEGER",
		},
 {
			name: "Product",
			column: "INVOICE_PRODUCT",
			type: "INTEGER",
		},
 {
			name: "CurrencyCode",
			column: "INVOICE_CURRENCYCODE",
			type: "VARCHAR",
		},
 {
			name: "Trader",
			column: "INVOICE_TRADER",
			type: "INTEGER",
		},
 {
			name: "Buyer",
			column: "INVOICE_BUYER",
			type: "INTEGER",
		},
 {
			name: "Supplier",
			column: "INVOICE_SUPPLIER",
			type: "INTEGER",
		}
]
});

exports.list = function(settings) {
	return dao.list(settings).map(function(e) {
		EntityUtils.setDate(e, "Date");
		return e;
	});
};

exports.get = function(id) {
	let entity = dao.find(id);
	EntityUtils.setDate(entity, "Date");
	return entity;
};

exports.create = function(entity) {
	EntityUtils.setLocalDate(entity, "Date");
	let id = dao.insert(entity);
	triggerEvent("Create", {
		table: "CODBEX_INVOICE",
		key: {
			name: "Id",
			column: "INVOICE_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	// EntityUtils.setLocalDate(entity, "Date");
	dao.update(entity);
	triggerEvent("Update", {
		table: "CODBEX_INVOICE",
		key: {
			name: "Id",
			column: "INVOICE_ID",
			value: entity.Id
		}
	});
};

exports.delete = function(id) {
	dao.remove(id);
	triggerEvent("Delete", {
		table: "CODBEX_INVOICE",
		key: {
			name: "Id",
			column: "INVOICE_ID",
			value: id
		}
	});
};

exports.count = function() {
	return dao.count();
};

exports.customDataCount = function() {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_INVOICE"');
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
	producer.queue("codbex-agoreus/invoice/Invoice/" + operation).send(JSON.stringify(data));
}