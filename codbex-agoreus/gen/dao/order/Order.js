const query = require("db/query");
const producer = require("messaging/producer");
const daoApi = require("db/dao");
const EntityUtils = require("codbex-agoreus/gen/dao/utils/EntityUtils");

let dao = daoApi.create({
	table: "CODBEX_ORDER",
	properties: [
		{
			name: "Id",
			column: "ORDER_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "Name",
			column: "ORDER_NAME",
			type: "VARCHAR",
		},
 {
			name: "Date",
			column: "ORDER_DATE",
			type: "DATE",
		},
 {
			name: "Quantity",
			column: "ORDER_QUANTITY",
			type: "DOUBLE",
		},
 {
			name: "Price",
			column: "ORDER_PRICE",
			type: "DOUBLE",
		},
 {
			name: "Double",
			column: "ORDER_DOUBLE",
			type: "DOUBLE",
		},
 {
			name: "Buyer",
			column: "ORDER_BUYER",
			type: "INTEGER",
		},
 {
			name: "Supplier",
			column: "ORDER_SUPPLIER",
			type: "INTEGER",
		},
 {
			name: "Product",
			column: "ORDER_PRODUCT",
			type: "INTEGER",
		},
 {
			name: "UoM",
			column: "ORDER_UOM",
			type: "INTEGER",
		},
 {
			name: "CurrencyCode",
			column: "ORDER_CURRENCYCODE",
			type: "VARCHAR",
		},
 {
			name: "ReferenceId",
			column: "ORDER_REFERENCEID",
			type: "INTEGER",
		},
 {
			name: "ReferenceNumber",
			column: "ORDER_REFERENCENUMBER",
			type: "VARCHAR",
		},
 {
			name: "ReferenceContext",
			column: "ORDER_REFERENCECONTEXT",
			type: "VARCHAR",
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
		table: "CODBEX_ORDER",
		key: {
			name: "Id",
			column: "ORDER_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	// EntityUtils.setLocalDate(entity, "Date");
	dao.update(entity);
	triggerEvent("Update", {
		table: "CODBEX_ORDER",
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
		table: "CODBEX_ORDER",
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
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_ORDER"');
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
	producer.queue("codbex-agoreus/order/Order/" + operation).send(JSON.stringify(data));
}