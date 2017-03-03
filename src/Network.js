module.exports = class Network {
	constructor(apliances){
		if(apliances){
			this.apliances = apliances
		} else {
			this.apliances = []
		}
		this.globalStandbyIncrement = 0
	}

	findApliance(hostname){
		for(var i in this.apliances){
			if(this.apliances[i].name == hostname)
				return this.apliances[i]
		}
		return null
	}
}