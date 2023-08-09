const query = require("db/query");
const producer = require("messaging/producer");
const daoApi = require("db/dao");

let dao = daoApi.create({
	table: "CODBEX_PARTNER",
	properties: [
		{
			name: "Id",
			column: "PARTNER_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "Name",
			column: "PARTNER_NAME",
			type: "VARCHAR",
		},
 {
			name: "PartnerTypeId",
			column: "PARTNER_PARTNERTYPEID",
			type: "INTEGER",
		},
 {
			name: "Address",
			column: "PARTNER_ADDRESS",
			type: "VARCHAR",
		},
 {
			name: "City",
			column: "PARTNER_CITY",
			type: "VARCHAR",
		},
 {
			name: "PostalCode",
			column: "PARTNER_POSTALCODE",
			type: "VARCHAR",
		},
 {
			name: "Email",
			column: "PARTNER_EMAIL",
			type: "VARCHAR",
		},
 {
			name: "Phone",
			column: "PARTNER_PHONE",
			type: "VARCHAR",
		},
 {
			name: "Fax",
			column: "PARTNER_FAX",
			type: "VARCHAR",
		},
 {
			name: "CountryId",
			column: "PARTNER_COUNTRYID",
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
		table: "CODBEX_PARTNER",
		key: {
			name: "Id",
			column: "PARTNER_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	dao.update(entity);
	triggerEvent("Update", {
		table: "CODBEX_PARTNER",
		key: {
			name: "Id",
			column: "PARTNER_ID",
			value: entity.Id
		}
	});
};

exports.delete = function(id) {
	dao.remove(id);
	triggerEvent("Delete", {
		table: "CODBEX_PARTNER",
		key: {
			name: "Id",
			column: "PARTNER_ID",
			value: id
		}
	});
};

exports.count = function() {
	return dao.count();
};

exports.customDataCount = function() {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PARTNER"');
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
	producer.queue("codbex-agoreus/entities/Partner/" + operation).send(JSON.stringify(data));
}