var query = require("db/v4/query");
var producer = require("messaging/v4/producer");
var daoApi = require("db/v4/dao");
var EntityUtils = require("agoreus-app/gen/dao/utils/EntityUtils");

var dao = daoApi.create({
	table: "AGOREUS_INQUIRY",
	properties: [
		{
			name: "Id",
			column: "INQUIRY_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		}, {
			name: "Name",
			column: "INQUIRY_NAME",
			type: "VARCHAR",
		}, {
			name: "Date",
			column: "INQUIRY_CREATIONDATE",
			type: "DATE",
		}, {
			name: "BuyerId",
			column: "INQUIRY_BUYERID",
			type: "INTEGER",
		}, {
			name: "ProductId",
			column: "INQUIRY_PRODUCTID",
			type: "INTEGER",
		}, {
			name: "Quantity",
			column: "INQUIRY_QUANTITY",
			type: "DOUBLE",
		}, {
			name: "UoMId",
			column: "INQUIRY_UOMID",
			type: "INTEGER",
		}, {
			name: "CurrencyCode",
			column: "INQUIRY_CURRENCYCODE",
			type: "CHAR",
		}, {
			name: "Price",
			column: "INQUIRY_PRICE",
			type: "DOUBLE",
		}, {
			name: "Total",
			column: "INQUIRY_TOTAL",
			type: "DOUBLE",
		}, {
			name: "DueDate",
			column: "INQUIRY_DUEDATE",
			type: "DATE",
		}, {
			name: "Location",
			column: "INQUIRY_LOCATION",
			type: "VARCHAR",
		}, {
			name: "CountryId",
			column: "INQUIRY_COUNTRYID",
			type: "INTEGER",
		}, {
			name: "TraderId",
			column: "INQUIRY_TRADERID",
			type: "INTEGER",
		}, {
			name: "InquiryStatusId",
			column: "INQUIRY_INQUIRYSTATUSID",
			type: "INTEGER",
		}]
});

exports.list = function(settings) {
	return dao.list(settings).map(function(e) {
		EntityUtils.setLocalDate(e, "Date");
		EntityUtils.setLocalDate(e, "DueDate");
		return e;
	});
};

exports.get = function(id) {
	var entity = dao.find(id);
	EntityUtils.setLocalDate(entity, "Date");
	EntityUtils.setLocalDate(entity, "DueDate");
	return entity;
};

exports.create = function(entity) {
	EntityUtils.setLocalDate(entity, "Date");
	EntityUtils.setLocalDate(entity, "DueDate");
	var id = dao.insert(entity);
	triggerEvent("Create", {
		table: "AGOREUS_INQUIRY",
		key: {
			name: "Id",
			column: "INQUIRY_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	EntityUtils.setLocalDate(entity, "Date");
	EntityUtils.setLocalDate(entity, "DueDate");
	dao.update(entity);
	triggerEvent("Update", {
		table: "AGOREUS_INQUIRY",
		key: {
			name: "Id",
			column: "INQUIRY_ID",
			value: entity.Id
		}
	});
};

exports.delete = function(id) {
	dao.remove(id);
	triggerEvent("Delete", {
		table: "AGOREUS_INQUIRY",
		key: {
			name: "Id",
			column: "INQUIRY_ID",
			value: id
		}
	});
};

exports.count = function() {
	return dao.count();
};

exports.customDataCount = function() {
	var resultSet = query.execute("SELECT COUNT(*) AS COUNT FROM AGOREUS_INQUIRY");
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
	producer.queue("agoreus-app/Inquiries/Inquiry/" + operation).send(JSON.stringify(data));
}