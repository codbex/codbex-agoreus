var query = require("db/v4/query");
var producer = require("messaging/v4/producer");
var daoApi = require("db/v4/dao");

var dao = daoApi.create({
	table: "AGOREUS_COUNTRY",
	properties: [
		{
			name: "Id",
			column: "COUNTRY_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		}, {
			name: "Name",
			column: "COUNTRY_NAME",
			type: "VARCHAR",
		}, {
			name: "Code2",
			column: "COUNTRY_CODE2",
			type: "VARCHAR",
		}, {
			name: "Code3",
			column: "COUNTRY_CODE3",
			type: "VARCHAR",
		}, {
			name: "Numeric",
			column: "COUNTRY_NUMERIC",
			type: "VARCHAR",
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
		table: "AGOREUS_COUNTRY",
		key: {
			name: "Id",
			column: "COUNTRY_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	dao.update(entity);
	triggerEvent("Update", {
		table: "AGOREUS_COUNTRY",
		key: {
			name: "Id",
			column: "COUNTRY_ID",
			value: entity.Id
		}
	});
};

exports.delete = function(id) {
	dao.remove(id);
	triggerEvent("Delete", {
		table: "AGOREUS_COUNTRY",
		key: {
			name: "Id",
			column: "COUNTRY_ID",
			value: id
		}
	});
};

exports.count = function() {
	return dao.count();
};

exports.customDataCount = function() {
	var resultSet = query.execute("SELECT COUNT(*) AS COUNT FROM AGOREUS_COUNTRY");
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
	producer.queue("agoreus-app/Nomenclatures/Country/" + operation).send(JSON.stringify(data));
}