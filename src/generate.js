const parseApliances = require("./parseApliances")
const ApliancesTypes = require("./ApliancesTypes")
const fs = require('fs-extra')

console.info("Script de génération des commandes cisco")
console.info("Les scripts seront généré dans le dossier 'scripts'")
console.info("\nCe script ne permet PAS de :")
console.info("\t- Activer le mode trunk des interfaces")
console.info("\t- Définir le VLAN natif\n")

const settings = JSON.parse(fs.readFileSync("./settings.json","utf8"))

const apliances = parseApliances(settings)

console.log(apliances[3])

console.info("Netoyage")
fs.removeSync("./scripts")
fs.mkdirSync("./scripts")
for(let i in apliances){
	var apliance = apliances[i]
	if(apliance.type == ApliancesTypes.STANDBY_POOL)
		continue
	console.info(`Génération de ${apliance.name}.cisco`)
	fs.writeFileSync(`./scripts/${apliance.name}.cisco`,apliance.getConfigurationScript(settings.vtpclient))
}
console.info("Génération terminée")