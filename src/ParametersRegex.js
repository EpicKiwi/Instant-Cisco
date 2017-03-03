const Parameters = require("./ParametersTypes")

module.exports = () => {
		return [
			{regex:/native (\d+)/i,type:Parameters.NATIVE_VLAN},
			{regex:/trunk/i,type:Parameters.TRUNK},
		]
}