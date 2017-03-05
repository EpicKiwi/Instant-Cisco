const parseApliances = require("./parseApliances")
const ApliancesTypes = require("./ApliancesTypes")
const fs = require('fs-extra')

console.info("Script de génération des commandes cisco")
console.info("Les scripts seront généré dans le dossier 'scripts'")
console.info("\nCe script ne permet PAS de :")
console.info("\t- Configurer les ACL")
console.info("\t- Configurer les Firewalls")
console.info("")

const settings = JSON.parse(fs.readFileSync("./settings.json","utf8"))

const network = parseApliances(settings)

console.info("Netoyage des anciens scripts")
fs.removeSync("./scripts")
fs.mkdirSync("./scripts")
for(let i in network.apliances){
	var apliance = network.apliances[i]
	if(apliance.type == ApliancesTypes.STANDBY_POOL)
		continue
	console.info(`Génération de ${apliance.name}.cisco`)
	fs.writeFileSync(`./scripts/${apliance.name}.cisco`,apliance.getConfigurationScript(settings.vtpclient))
}
console.info("Génération terminée")