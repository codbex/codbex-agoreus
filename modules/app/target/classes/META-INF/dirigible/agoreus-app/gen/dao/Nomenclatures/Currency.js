var query = require("db/v4/query");
var producer = require("messaging/v4/producer");
var daoApi = require("db/v4/dao");

var dao = daoApi.create({
	table: "AGOREUS_CURRENCY",
	properties: [
		{
			name: "Code",
			column: "CURRENCY_CODE",
			type: "CHAR",
			id: true,
			autoIncrement: true,
		}, {
			name: "Name",
			column: "CURRENCY_NAME",
			type: "VARCHAR",
		}, {
			name: "Numeric",
			column: "CURRENCY_NUMERIC",
			type: "CHAR",
		}, {
			name: "Rounding",
			column: "CURRENCY_ROUNDING",
			type: "INTEGER",
		}, {
			name: "Active",
			column: "CURRENCY_ACTIVE",
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
		table: "AGOREUS_CURRENCY",
		key: {
			name: "Code",
			column: "CURRENCY_CODE",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	dao.update(entity);
	triggerEvent("Update", {
		table: "AGOREUS_CURRENCY",
		key: {
			name: "Code",
			column: "CURRENCY_CODE",
			value: entity.Code
		}
	});
};

exports.delete = function(id) {
	dao.remove(id);
	triggerEvent("Delete", {
		table: "AGOREUS_CURRENCY",
		key: {
			name: "Code",
			column: "CURRENCY_CODE",
			value: id
		}
	});
};

exports.count = function() {
	return dao.count();
};

exports.customDataCount = function() {
	var resultSet = query.execute("SELECT COUNT(*) AS COUNT FROM AGOREUS_CURRENCY");
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
	producer.queue("agoreus-app/Nomenclatures/Currency/" + operation).send(JSON.stringify(data));
}