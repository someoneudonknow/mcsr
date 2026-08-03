local core = require("apisix.core")

local PLUGIN_NAME = "rsa-auth"

local SCHEMA = {
	type = "object",
	properties = {
		auth_key = {
			type = "string",
			default = "Authorization",
		},
		client_id_key = {
			type = "string",
			default = "X-Client-ID",
		},
		forwarding_sub_key = {
			type = "string",
			default = "X-User-ID",
		},
	},
}

local _M = {
	version = 0.1,
	priority = 1000,
	name = PLUGIN_NAME,
	schema = SCHEMA,
}

function _M.check_schema(conf)
	return core.schema.check(_M.schema, conf)
end

function _M.access(conf, ctx)

end

return _M
