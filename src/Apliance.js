const ApliancesTypes = require("./ApliancesTypes")

module.exports = class Apliance {
	constructor(name,
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
		this.interfaces = []
		this.type = null
		this.refreshType()
		this.autosave = autosave
		this.vtpSetting = vtpSetting
		this.bannerSetting = bannerSetting
		this.domainSetting = domainSetting
		this.enableSecretSetting = enableSecretSetting
		this.consoleSetting = consoleSetting
		this.telnetSetting = telnetSetting
		this.sshSetting = sshSetting
		this.adminSetting = adminSetting
	}

	refreshType(){
		if(this.name.match(/router/i))
			this.type = ApliancesTypes.ROUTER
		else if(this.name.match(/switch/i))
			this.type = ApliancesTypes.SWITCH
		else if(this.name.match(/pool/i))
			this.type = ApliancesTypes.STANDBY_POOL
		else
			this.type = ApliancesTypes.OTHER
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
			script += `\nvtp mode transparent`
			script += `\nvtp mode client`
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
		return script
	}
}