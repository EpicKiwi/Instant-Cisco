const ApliancesTypes = require("./ApliancesTypes")
const Parameters = require("./ParametersTypes")
const EtherChannelStates = require("./EtherChannelStates")
const getParamRegexes = require("./ParametersRegex")

module.exports = class Interface{
	constructor(apliance,name,parameters,vlanNumber,ip,mask){
		this.apliance = apliance
		this.name = name
		this.vlanNumber = vlanNumber
		this.ip = ip
		this.mask = mask
		this.shutdown = false
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
				break
			case Parameters.SHUTDOWN:
				this.shutdown = true
				break
			case Parameters.ETHERCHANNEL:
				this.etherchannel = {
					number: parseInt(parsedResult.result[1]),
					state: parsedResult.result[2].toLowerCase()
				}
				break
		}
	}

	getConfigurationScript(){
		var script = ""

		if(!this.etherchannel){
			script += this.getInterfaceDeclaration()
		} else {
			script += `\ninterface port-channel ${this.etherchannel.number}`
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

		if(this.shutdown)
			script += `\nshutdown`
		else
			script += `\nno shutdown`

		script += `\nexit`

		if(this.etherchannel){
			script += `\n${this.getInterfaceDeclaration()}`
			switch(this.etherchannel.state){
				case EtherChannelStates.ACTIVE:
				script += `\nchannel-group ${this.etherchannel.number} mode active`
					break
				case EtherChannelStates.PASSIVE:
				script += `\nchannel-group ${this.etherchannel.number} mode passive`
					break
				default:
					console.warn("[${this.apliance.name}/${this.name}] Invalid etherchannel name")
					break
			}
			if(this.shutdown)
				script += `\nshutdown`
			else
				script += `\nno shutdown`
			script += `\nexit`
		}

		return script
	}

	getInterfaceDeclaration(){
		var script  = ""
		if(this.name.match(/-/i))
			script += `\ninterface range ${this.name}`
		else{
			if(this.name.match(/vlan/i))
				script += `\ninterface vlan ${this.vlanNumber}`
			else
				script += `\ninterface ${this.name}`
		}
		return script
	}
}