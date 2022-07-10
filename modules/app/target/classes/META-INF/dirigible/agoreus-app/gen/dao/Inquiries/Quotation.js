var query = require("db/v4/query");
var producer = require("messaging/v4/producer");
var daoApi = require("db/v4/dao");
var EntityUtils = require("agoreus-app/gen/dao/utils/EntityUtils");

var dao = daoApi.create({
	table: "AGOREUS_QUOTATION",
	properties: [
		{
			name: "Id",
			column: "OFFER_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		}, {
			name: "InquiryId",
			column: "OFFER_INQUIRYID",
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
			name: "ValidityDate",
			column: "OFFER_VALIDITYDATE",
			type: "DATE",
		}, {
			name: "ProductId",
			column: "AGOREUS_QUOTATION_PRODUCTID",
			type: "INTEGER",
		}, {
			name: "Quantity",
			column: "OFFER_QUANTITY",
			type: "DOUBLE",
		}, {
			name: "UoMId",
			column: "AGOREUS_QUOTATION_UOMID",
			type: "INTEGER",
		}, {
			name: "CurrencyCode",
			column: "AGOREUS_QUOTATION_CURRENCYCODE",
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
			name: "TraderId",
			column: "OFFER_TRADERID",
			type: "INTEGER",
		}, {
			name: "SupplierId",
			column: "AGOREUS_OFFER_SUPPLIERID",
			type: "INTEGER",
		}, {
			name: "QuotationStatusId",
			column: "QUOTATION_QUOTATIONSTATUSID",
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
		table: "AGOREUS_QUOTATION",
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
		table: "AGOREUS_QUOTATION",
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
		table: "AGOREUS_QUOTATION",
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
	var resultSet = query.execute("SELECT COUNT(*) AS COUNT FROM AGOREUS_QUOTATION");
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
	producer.queue("agoreus-app/Inquiries/Quotation/" + operation).send(JSON.stringify(data));
}