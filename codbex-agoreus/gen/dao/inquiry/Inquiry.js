const query = require("db/query");
const producer = require("messaging/producer");
const daoApi = require("db/dao");
const EntityUtils = require("codbex-agoreus/gen/dao/utils/EntityUtils");

let dao = daoApi.create({
	table: "CODBEX_INQUIRY",
	properties: [
		{
			name: "Id",
			column: "INQUIRY_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "Name",
			column: "INQUIRY_NAME",
			type: "VARCHAR",
		},
 {
			name: "Date",
			column: "INQUIRY_DATE",
			type: "DATE",
		},
 {
			name: "Quantity",
			column: "INQUIRY_QUANTITY",
			type: "DOUBLE",
		},
 {
			name: "Price",
			column: "INQUIRY_PRICE",
			type: "DOUBLE",
		},
 {
			name: "Total",
			column: "INQUIRY_TOTAL",
			type: "DOUBLE",
		},
 {
			name: "DueDate",
			column: "INQUIRY_DUEDATE",
			type: "DATE",
		},
 {
			name: "Location",
			column: "INQUIRY_LOCATION",
			type: "VARCHAR",
		},
 {
			name: "Buyer",
			column: "INQUIRY_BUYERID",
			type: "INTEGER",
		},
 {
			name: "Product",
			column: "INQUIRY_PRODUCTID",
			type: "INTEGER",
		},
 {
			name: "UoMId",
			column: "INQUIRY_UOMID",
			type: "INTEGER",
		},
 {
			name: "Currency",
			column: "INQUIRY_CURRENCYCODE",
			type: "VARCHAR",
		},
 {
			name: "Country",
			column: "INQUIRY_COUNTRYID",
			type: "INTEGER",
		},
 {
			name: "Trader",
			column: "INQUIRY_TRADER",
			type: "INTEGER",
		},
 {
			name: "InquiryStatus",
			column: "INQUIRY_INQUIRYSTATUS",
			type: "INTEGER",
		}
]
});

exports.list = function(settings) {
	return dao.list(settings).map(function(e) {
		EntityUtils.setDate(e, "Date");
		EntityUtils.setDate(e, "DueDate");
		return e;
	});
};

exports.get = function(id) {
	let entity = dao.find(id);
	EntityUtils.setDate(entity, "Date");
	EntityUtils.setDate(entity, "DueDate");
	return entity;
};

exports.create = function(entity) {
	EntityUtils.setLocalDate(entity, "Date");
	EntityUtils.setLocalDate(entity, "DueDate");
	let id = dao.insert(entity);
	triggerEvent("Create", {
		table: "CODBEX_INQUIRY",
		key: {
			name: "Id",
			column: "INQUIRY_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	// EntityUtils.setLocalDate(entity, "Date");
	// EntityUtils.setLocalDate(entity, "DueDate");
	dao.update(entity);
	triggerEvent("Update", {
		table: "CODBEX_INQUIRY",
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
		table: "CODBEX_INQUIRY",
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
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_INQUIRY"');
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
	producer.queue("codbex-agoreus/inquiry/Inquiry/" + operation).send(JSON.stringify(data));
}