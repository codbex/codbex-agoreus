var query = require("db/v4/query");
var producer = require("messaging/v4/producer");
var daoApi = require("db/v4/dao");
var EntityUtils = require("agoreus-app/gen/dao/utils/EntityUtils");

var dao = daoApi.create({
	table: "AGOREUS_BID",
	properties: [
		{
			name: "Id",
			column: "BID_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		}, {
			name: "OfferId",
			column: "BID_OFFERID",
			type: "INTEGER",
		}, {
			name: "Name",
			column: "BID_NAME",
			type: "VARCHAR",
		}, {
			name: "Date",
			column: "BID_DATE",
			type: "VARCHAR",
		}, {
			name: "ValidityDate",
			column: "BID_VALIDITYDATE",
			type: "DATE",
		}, {
			name: "ProductId",
			column: "BID_PRODUCTID",
			type: "INTEGER",
		}, {
			name: "Quantity",
			column: "BID_QUANTITY",
			type: "DOUBLE",
		}, {
			name: "UoMId",
			column: "BID_UOMID",
			type: "INTEGER",
		}, {
			name: "CurrencyCode",
			column: "BID_CURRENCYCODE",
			type: "CHAR",
		}, {
			name: "Price",
			column: "BID_PRICE",
			type: "DOUBLE",
		}, {
			name: "Total",
			column: "BID_TOTAL",
			type: "DOUBLE",
		}, {
			name: "BuyerId",
			column: "BID_BUYERID",
			type: "INTEGER",
		}, {
			name: "TraderId",
			column: "BID_TRADERID",
			type: "INTEGER",
		}, {
			name: "BidStatusId",
			column: "BID_BIDSTATUSID",
			type: "INTEGER",
		}]
});

exports.list = function(settings) {
	return dao.list(settings).map(function(e) {
		EntityUtils.setLocalDate(e, "ValidityDate");
		return e;
	});
};

exports.get = function(id) {
	var entity = dao.find(id);
	EntityUtils.setLocalDate(entity, "ValidityDate");
	return entity;
};

exports.create = function(entity) {
	EntityUtils.setLocalDate(entity, "ValidityDate");
	var id = dao.insert(entity);
	triggerEvent("Create", {
		table: "AGOREUS_BID",
		key: {
			name: "Id",
			column: "BID_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	EntityUtils.setLocalDate(entity, "ValidityDate");
	dao.update(entity);
	triggerEvent("Update", {
		table: "AGOREUS_BID",
		key: {
			name: "Id",
			column: "BID_ID",
			value: entity.Id
		}
	});
};

exports.delete = function(id) {
	dao.remove(id);
	triggerEvent("Delete", {
		table: "AGOREUS_BID",
		key: {
			name: "Id",
			column: "BID_ID",
			value: id
		}
	});
};

exports.count = function() {
	return dao.count();
};

exports.customDataCount = function() {
	var resultSet = query.execute("SELECT COUNT(*) AS COUNT FROM AGOREUS_BID");
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
	producer.queue("agoreus-app/Offers/Bid/" + operation).send(JSON.stringify(data));
}