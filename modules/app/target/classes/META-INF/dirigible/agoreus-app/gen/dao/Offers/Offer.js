var query = require("db/v4/query");
var producer = require("messaging/v4/producer");
var daoApi = require("db/v4/dao");
var EntityUtils = require("agoreus-app/gen/dao/utils/EntityUtils");

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
			name: "PartnerId",
			column: "OFFER_PARTNERID",
			type: "INTEGER",
		}, {
			name: "RequestId",
			column: "OFFER_REQUESTID",
			type: "INTEGER",
		}, {
			name: "Name",
			column: "OFFER_NAME",
			type: "VARCHAR",
		}, {
			name: "Date",
			column: "OFFER_CREATIONDATE",
			type: "DATE",
		}, {
			name: "Quantity",
			column: "OFFER_QUANTITY",
			type: "DOUBLE",
		}, {
			name: "Price",
			column: "OFFER_PRICE",
			type: "DOUBLE",
		}, {
			name: "Total",
			column: "OFFER_TOTAL",
			type: "DOUBLE",
		}, {
			name: "ValidityDate",
			column: "OFFER_VALIDITYDATE",
			type: "DATE",
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
	return dao.list(settings).map(function(e) {
		EntityUtils.setLocalDate(e, "Date");
		EntityUtils.setLocalDate(e, "ValidityDate");
		return e;
	});
};

exports.get = function(id) {
	var entity = dao.find(id);
	EntityUtils.setLocalDate(entity, "Date");
	EntityUtils.setLocalDate(entity, "ValidityDate");
	return entity;
};

exports.create = function(entity) {
	EntityUtils.setLocalDate(entity, "Date");
	EntityUtils.setLocalDate(entity, "ValidityDate");
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
	EntityUtils.setLocalDate(entity, "Date");
	EntityUtils.setLocalDate(entity, "ValidityDate");
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