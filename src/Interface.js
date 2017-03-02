const ApliancesTypes = require("./ApliancesTypes")

module.exports = class Interface{
	constructor(apliance,name,vlanNumber,ip,mask){
		this.apliance = apliance
		this.name = name
		this.vlanNumber = vlanNumber
		this.ip = ip
		this.mask = mask
	}

	getConfigurationScript(){
		var script = ""

		if(this.name.match(/-/i))
			script += `\ninterface range ${this.name}`
		else
			script += `\ninterface ${this.name}`

		if(this.ip && this.mask)
			script += `\nip address ${this.ip} ${this.mask}`

		if(this.vlanNumber && !this.name.match(/vlan/i)){
			if(this.apliance.type == ApliancesTypes.ROUTER){
				script += `\nencapsulation dot1q ${this.vlanNumber}`
			} else if(this.apliance.type == ApliancesTypes.SWITCH){
				script += `\nswitchport mode access`
				script += `\nswitchport access vlan ${this.vlanNumber}`
			}
		}

		script += `\nexit`
		return script
	}
}