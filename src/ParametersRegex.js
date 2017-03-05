const Parameters = require("./ParametersTypes")

module.exports = () => {
		return [
			{regex:/native (\d+)/i,type:Parameters.NATIVE_VLAN},
			{regex:/trunk/i,type:Parameters.TRUNK},
			{regex:/for (.+) priority (\d+)/i,type:Parameters.STANDBY_POOL_AP},
			{regex:/vtp server/i,type:Parameters.VTP_SERVER},
			{regex:/vtp transparent/i,type:Parameters.VTP_TRANSPARENT},
			{regex:/etherchannel (\d+) (.+)/i,type:Parameters.ETHERCHANNEL},
			{regex:/shutdown/i,type:Parameters.SHUTDOWN},
			{regex:/number (\d+)/,type:Parameters.POOL_NUMBER}
		]
}