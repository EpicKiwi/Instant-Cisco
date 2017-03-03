const xlsx = require('node-xlsx')
const fs = require('fs')
const Apliance = require("./Apliance")
const Interface = require("./Interface")

module.exports = (settings) => {
	const xlsFile = xlsx.parse(fs.readFileSync("./"+settings.srcfile))
	const data = xlsFile[0].data

	var apliances = []

	var currentApliance = null

	for(var i = 1; i<data.length; i++){
		var row = data[i]
		if(row[0]){
			if(currentApliance)
				apliances.push(currentApliance)
			currentApliance = new Apliance(row[0],
				row.slice(6),
				settings.autosave,
				settings.vtpclient,
				settings.banner,
				settings.domain,
				settings.enablesecret,
				settings.consolesecret,
				settings.telnet,
				settings.ssh,
				settings.admin)
		}
		if(currentApliance && row[1]){
			currentApliance.interfaces.push(new Interface(currentApliance,row[1],row.slice(6),row[2],row[3],row[4]))
		}

	}

	return apliances
}