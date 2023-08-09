const query = require("db/query");
const producer = require("messaging/producer");
const daoApi = require("db/dao");
const EntityUtils = require("codbex-agoreus/gen/dao/utils/EntityUtils");

let dao = daoApi.create({
	table: "CODBEX_ENTITY15",
	properties: [
		{
			name: "Id",
			column: "ENTITY15_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "Name",
			column: "ENTITY15_NAME",
			type: "VARCHAR",
		},
 {
			name: "Date",
			column: "ENTITY15_DATE",
			type: "DATE",
		},
 {
			name: "ValidityDate",
			column: "ENTITY15_VALIDITYDATE",
			type: "DATE",
		},
 {
			name: "Quantity",
			column: "ENTITY15_QUANTITY",
			type: "DOUBLE",
		},
 {
			name: "Price",
			column: "ENTITY15_PRICE",
			type: "DOUBLE",
		},
 {
			name: "Total",
			column: "ENTITY15_TOTAL",
			type: "DOUBLE",
		},
 {
			name: "Offer",
			column: "ENTITY15_OFFER",
			type: "INTEGER",
		},
 {
			name: "Product",
			column: "ENTITY15_PRODUCT",
			type: "INTEGER",
		},
 {
			name: "UoMId",
			column: "ENTITY15_UOMID",
			type: "INTEGER",
		},
 {
			name: "CurrencyCode",
			column: "ENTITY15_CURRENCYCODE",
			type: "VARCHAR",
		},
 {
			name: "Buyer",
			column: "ENTITY15_BUYER",
			type: "INTEGER",
		},
 {
			name: "Trader",
			column: "ENTITY15_TRADER",
			type: "INTEGER",
		}
]
});

exports.list = function(settings) {
	return dao.list(settings).map(function(e) {
		EntityUtils.setDate(e, "Date");
		EntityUtils.setDate(e, "ValidityDate");
		return e;
	});
};

exports.get = function(id) {
	let entity = dao.find(id);
	EntityUtils.setDate(entity, "Date");
	EntityUtils.setDate(entity, "ValidityDate");
	return entity;
};

exports.create = function(entity) {
	EntityUtils.setLocalDate(entity, "Date");
	EntityUtils.setLocalDate(entity, "ValidityDate");
	let id = dao.insert(entity);
	triggerEvent("Create", {
		table: "CODBEX_ENTITY15",
		key: {
			name: "Id",
			column: "ENTITY15_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	// EntityUtils.setLocalDate(entity, "Date");
	// EntityUtils.setLocalDate(entity, "ValidityDate");
	dao.update(entity);
	triggerEvent("Update", {
		table: "CODBEX_ENTITY15",
		key: {
			name: "Id",
			column: "ENTITY15_ID",
			value: entity.Id
		}
	});
};

exports.delete = function(id) {
	dao.remove(id);
	triggerEvent("Delete", {
		table: "CODBEX_ENTITY15",
		key: {
			name: "Id",
			column: "ENTITY15_ID",
			value: id
		}
	});
};

exports.count = function() {
	return dao.count();
};

exports.customDataCount = function() {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_ENTITY15"');
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
	producer.queue("codbex-agoreus/bid/Bid/" + operation).send(JSON.stringify(data));
}