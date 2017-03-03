const ApliancesTypes = require("./ApliancesTypes")
const Parameters = require("./ParametersTypes")
const getParamRegexes = require("./ParametersRegex")
const VtpStates = require("./VtpStates")

module.exports = class Apliance {
	constructor(network,
		name,
		parameters,
		autosave,
		vtpSetting,
		bannerSetting,
		domainSetting,
		enableSecretSetting,
		consoleSetting,
		telnetSetting,
		sshSetting,
		adminSetting){

		this.name = name
		this.network = network
		this.interfaces = []
		this.type = null
		this.refreshType()
		this.vtpState = VtpStates.CLIENT
		this.autosave = autosave
		this.vtpSetting = vtpSetting
		this.bannerSetting = bannerSetting
		this.domainSetting = domainSetting
		this.enableSecretSetting = enableSecretSetting
		this.consoleSetting = consoleSetting
		this.telnetSetting = telnetSetting
		this.sshSetting = sshSetting
		this.adminSetting = adminSetting
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
			case Parameters.NATIVE_VLAN:
				this.nativeVlan = parseInt(parsedResult.result[1])
				break;
			case Parameters.STANDBY_POOL_AP:
				if(this.type == ApliancesTypes.STANDBY_POOL){
					if(!this.attachedApliances)
						this.attachedApliances = []
					let attached = this.network.findApliance(parsedResult.result[1])
					if(attached){
						this.attachedApliances.push(attached)
						attached.setAttachedPool({pool:this,priority:parseInt(parsedResult.result[2])})
					}else
						console.warn(`[${this.name}] Can't find the apliance ${parsedResult.result[1]} maybe the pool is defined before it`)
				} else
					console.warn(`[${this.name}] Usage of 'for' parameter outside a standby apliance, ignoring`)
				break;
			case Parameters.VTP_SERVER:
				this.vtpState = VtpStates.SERVER
				break;
			case Parameters.VTP_TRANSPARENT:
				this.vtpState = VtpStates.TRANSPARENT
				break;
		}
	}

	refreshType(){
		if(this.name.match(/pool$/i))
			this.type = ApliancesTypes.STANDBY_POOL
		else if(this.name.match(/router/i))
			this.type = ApliancesTypes.ROUTER
		else if(this.name.match(/switch/i))
			this.type = ApliancesTypes.SWITCH
		else
			this.type = ApliancesTypes.OTHER
	}

	setAttachedPool(pool){
		this.attachedPool = pool
	}

	getConfigurationScript(){
		var script = `enable`
		script += `\nconfigure terminal`
		script += `\nhostname ${this.name}\n`
		if(this.bannerSetting.enable){
			script += `\nbanner motd #${this.bannerSetting.text}#\n`
		}
		if(this.domainSetting.enable){
			script += `\nip domain-name ${this.domainSetting.domain}\n`
		}
		if(this.enableSecretSetting.enable){
			script += `\nenable secret ${this.enableSecretSetting.password}\n`
		}
		if(this.consoleSetting.enable){
			script += `\nline con 0`
			script += `\npassword ${this.consoleSetting.password}`
			script += `\nlogin`
			script += `\nexit\n`
		}
		if(this.telnetSetting.enable){
			script += `\nline vty 0 15`
			script += `\npassword ${this.telnetSetting.password}`
			script += `\nlogin local`
			script += `\ntransport input ssh`
			script += `\nexit\n`
		}
		if(this.vtpSetting.enable && this.type == ApliancesTypes.SWITCH){
			script += `\nvtp domain ${this.vtpSetting.domain}`
			script += `\nvtp version 2`
			switch(this.vtpState){
				case VtpStates.CLIENT:
					script += `\nvtp mode transparent`
					script += `\nvtp mode client`
					break
				case VtpStates.SERVER:
					script += `\nvtp mode transparent`
					script += `\nvtp mode server`
					break
				case VtpStates.transparent:
					script += `\nvtp mode transparent`
					break
			}
			script += `\nvtp password ${this.vtpSetting.password}\n`
		}
		if(this.sshSetting.enable){
			script += `\ncrypto key generate rsa\n${this.sshSetting.keylength}`
			script += `\nip ssh version 2`
			script += `\nip ssh time-out ${this.sshSetting.timeout}`
			script += `\nip ssh authentication-retries ${this.sshSetting.loginAttempts}\n`
		}
		if(this.adminSetting.enable){
			script += `\nusername ${this.adminSetting.username} secret ${this.adminSetting.password}\n`
		}

		for(var i in this.interfaces){
			script += this.interfaces[i].getConfigurationScript()+"\n"
		}

		script += "\nexit"
		if(this.autosave){
			script += "\nwrite memory"
		}
		script += "\ndisable"

		if(this.attachedPool){
			this.network.globalStandbyIncrement++
		}

		return script
	}

	getInterfaceByVlanNumber(vlanNumber){
		for(var i in this.interfaces){
			let inte = this.interfaces[i]
			if(inte.vlanNumber == vlanNumber){
				return inte
			}
		}
		return null
	}
}