const ApliancesTypes = require("./ApliancesTypes")
const Parameters = require("./ParametersTypes")
const getParamRegexes = require("./ParametersRegex")

module.exports = class Interface{
	constructor(apliance,name,parameters,vlanNumber,ip,mask){
		this.apliance = apliance
		this.name = name
		this.vlanNumber = vlanNumber
		this.ip = ip
		this.mask = mask
		this.parseParameters(parameters)
	}

	parseParameters(parameters){
		const parametersRegex = getParamRegexes()

		for(var i in parameters){
			let param = parameters[i]
			for(var y in parametersRegex){
				let regex = parametersRegex[y]
				let result = regex.regex.exec(param)
				if(result){
					this.parseParameter({parameter:regex.type,result})
				}
			}
		}
	}

	parseParameter(parsedResult){
		switch(parsedResult.parameter){
			case Parameters.TRUNK:
				this.trunk = true
				break;
		}
	}

	getConfigurationScript(){
		var script = ""

		if(this.name.match(/-/i))
			script += `\ninterface range ${this.name}`
		else{
			if(this.name.match(/vlan/i))
				script += `\ninterface vlan ${this.vlanNumber}`
			else
				script += `\ninterface ${this.name}`
		}

		if(this.vlanNumber && !this.name.match(/vlan/i) && !this.trunk){
			if(this.apliance.type == ApliancesTypes.ROUTER){
				if(this.apliance.nativeVlan == this.vlanNumber)
					script += `\nencapsulation dot1q ${this.vlanNumber} native`
				else
					script += `\nencapsulation dot1q ${this.vlanNumber}`
			} else if(this.apliance.type == ApliancesTypes.SWITCH){
				script += `\nswitchport mode access`
				script += `\nswitchport access vlan ${this.vlanNumber}`
			}
		}
		
		if(this.apliance.type == ApliancesTypes.SWITCH && this.trunk){
			script += `\nswitchport trunk encapsulation dot1q`
			script += `\nswitchport mode trunk`
			if(this.apliance.nativeVlan){
				script += `\nswitchport trunk native vlan ${this.apliance.nativeVlan}`
			}
		}

		if(this.ip && this.mask)
			script += `\nip address ${this.ip} ${this.mask}`

		if(this.apliance.attachedPool){
			let standbyNumber = this.vlanNumber+this.apliance.network.globalStandbyIncrement
			let poolInt = this.apliance.attachedPool.pool.getInterfaceByVlanNumber(this.vlanNumber)
			if(poolInt){
				let standByIp = poolInt.ip
				script += `\nstandby ${standbyNumber} ip ${standByIp}`
				script += `\nstandby ${standbyNumber} priority ${this.apliance.attachedPool.priority}`
				script += `\nstandby ${standbyNumber} preempt`
			}
		}

		script += `\nexit`
		return script
	}
}