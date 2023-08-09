const query = require("db/query");
const producer = require("messaging/producer");
const daoApi = require("db/dao");
const EntityUtils = require("codbex-agoreus/gen/dao/utils/EntityUtils");

let dao = daoApi.create({
	table: "CODBEX_OFFER",
	properties: [
		{
			name: "Id",
			column: "OFFER_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "Name",
			column: "OFFER_NAME",
			type: "VARCHAR",
		},
 {
			name: "Date",
			column: "OFFER_DATE",
			type: "DATE",
		},
 {
			name: "ExpiryDate",
			column: "OFFER_EXPIRYDATE",
			type: "DATE",
		},
 {
			name: "Quantity",
			column: "OFFER_QUANTITY",
			type: "DOUBLE",
		},
 {
			name: "Price",
			column: "OFFER_PRICE",
			type: "DOUBLE",
		},
 {
			name: "Total",
			column: "OFFER_TOTAL",
			type: "DOUBLE",
		},
 {
			name: "Location",
			column: "OFFER_LOCATION",
			type: "VARCHAR",
		},
 {
			name: "Product",
			column: "OFFER_PRODUCT",
			type: "INTEGER",
		},
 {
			name: "UoMId",
			column: "OFFER_UOMID",
			type: "INTEGER",
		},
 {
			name: "CurrencyCode",
			column: "OFFER_CURRENCYCODE",
			type: "VARCHAR",
		},
 {
			name: "Country",
			column: "OFFER_COUNTRY",
			type: "INTEGER",
		},
 {
			name: "Supplier",
			column: "OFFER_SUPPLIER",
			type: "INTEGER",
		},
 {
			name: "Trader",
			column: "OFFER_TRADER",
			type: "INTEGER",
		},
 {
			name: "OfferStatus",
			column: "OFFER_OFFERSTATUS",
			type: "INTEGER",
		}
]
});

exports.list = function(settings) {
	return dao.list(settings).map(function(e) {
		EntityUtils.setDate(e, "Date");
		EntityUtils.setDate(e, "ExpiryDate");
		return e;
	});
};

exports.get = function(id) {
	let entity = dao.find(id);
	EntityUtils.setDate(entity, "Date");
	EntityUtils.setDate(entity, "ExpiryDate");
	return entity;
};

exports.create = function(entity) {
	EntityUtils.setLocalDate(entity, "Date");
	EntityUtils.setLocalDate(entity, "ExpiryDate");
	let id = dao.insert(entity);
	triggerEvent("Create", {
		table: "CODBEX_OFFER",
		key: {
			name: "Id",
			column: "OFFER_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	// EntityUtils.setLocalDate(entity, "Date");
	// EntityUtils.setLocalDate(entity, "ExpiryDate");
	dao.update(entity);
	triggerEvent("Update", {
		table: "CODBEX_OFFER",
		key: {
			name: "Id",
			column: "OFFER_ID",
			value: entity.Id
		}
	});
};

exports.delete = function(id) {
	dao.remove(id);
	triggerEvent("Delete", {
		table: "CODBEX_OFFER",
		key: {
			name: "Id",
			column: "OFFER_ID",
			value: id
		}
	});
};

exports.count = function() {
	return dao.count();
};

exports.customDataCount = function() {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_OFFER"');
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
	producer.queue("codbex-agoreus/offer/Offer/" + operation).send(JSON.stringify(data));
}