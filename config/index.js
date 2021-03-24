/**
 * Makes all configurations available through a single require.
 */

module.exports = {
	constants: require('./constants'),
	emailConf: require('./email-conf'),
	pushConf: require('./push-conf'),
	storageConf: require('./storage-conf'),
	dbConf: require('./db-conf')
};