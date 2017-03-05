module.exports = class Network {
	constructor(vlans){
		this.apliances = []
		this.vlans = vlans
	}

	findApliance(hostname){
		for(var i in this.apliances){
			if(this.apliances[i].name == hostname)
				return this.apliances[i]
		}
		return null
	}
}