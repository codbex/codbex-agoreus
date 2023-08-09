const query = require("db/query");
const producer = require("messaging/producer");
const daoApi = require("db/dao");

let dao = daoApi.create({
	table: "CODBEX_CURRENCY",
	properties: [
		{
			name: "Code",
			column: "CURRENCY_CODE",
			type: "VARCHAR",
			id: true,
			autoIncrement: false,
		},
 {
			name: "Name",
			column: "CURRENCY_NAME",
			type: "VARCHAR",
		},
 {
			name: "Numeric",
			column: "CURRENCY_NUMERIC",
			type: "VARCHAR",
		},
 {
			name: "Rounding",
			column: "CURRENCY_ROUNDING",
			type: "INTEGER",
		},
 {
			name: "Active",
			column: "CURRENCY_ACTIVE",
			type: "INTEGER",
		}
]
});

exports.list = function(settings) {
	return dao.list(settings);
};

exports.get = function(id) {
	return dao.find(id);
};

exports.create = function(entity) {
	let id = dao.insert(entity);
	triggerEvent("Create", {
		table: "CODBEX_CURRENCY",
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
		table: "CODBEX_CURRENCY",
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
		table: "CODBEX_CURRENCY",
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
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_CURRENCY"');
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
	producer.queue("codbex-agoreus/entities/Currency/" + operation).send(JSON.stringify(data));
}