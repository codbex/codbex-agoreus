var query = require("db/v4/query");
var producer = require("messaging/v4/producer");
var daoApi = require("db/v4/dao");

var dao = daoApi.create({
	table: "AGOREUS_OFFER",
	properties: [
		{
			name: "Id",
			column: "OFFER_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		}, {
			name: "Name",
			column: "OFFER_NAME",
			type: "VARCHAR",
		}, {
			name: "Date",
			column: "OFFER_DATE",
			type: "VARCHAR",
		}, {
			name: "ExpiryDate",
			column: "OFFER_EXPIRYDATE",
			type: "VARCHAR",
		}, {
			name: "ProductId",
			column: "OFFER_PRODUCTID",
			type: "INTEGER",
		}, {
			name: "Quantity",
			column: "OFFER_QUANTITY",
			type: "DOUBLE",
		}, {
			name: "UoMId",
			column: "OFFER_UOMID",
			type: "INTEGER",
		}, {
			name: "CurrencyCode",
			column: "OFFER_CURRENCYCODE",
			type: "CHAR",
		}, {
			name: "Price",
			column: "OFFER_PRICE",
			type: "DOUBLE",
		}, {
			name: "Total",
			column: "OFFER_TOTAL",
			type: "DOUBLE",
		}, {
			name: "Location",
			column: "OFFER_LOCATION",
			type: "VARCHAR",
		}, {
			name: "CountryId",
			column: "OFFER_COUNTRYID",
			type: "INTEGER",
		}, {
			name: "SupplierId",
			column: "OFFER_SUPPLIERID",
			type: "INTEGER",
		}, {
			name: "OfferStatusId",
			column: "OFFER_OFFERSTATUSID",
			type: "INTEGER",
		}, {
			name: "TraderId",
			column: "OFFER_TRADERID",
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
		table: "AGOREUS_OFFER",
		key: {
			name: "Id",
			column: "OFFER_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	dao.update(entity);
	triggerEvent("Update", {
		table: "AGOREUS_OFFER",
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
		table: "AGOREUS_OFFER",
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
	var resultSet = query.execute("SELECT COUNT(*) AS COUNT FROM AGOREUS_OFFER");
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
	producer.queue("agoreus-app/Offers/Offer/" + operation).send(JSON.stringify(data));
}