module.exports = {
    packagerConfig: {
        /**
         *
         * @param {string} path
         * @returns {boolean}
         */
        ignore: path => {
            if (path.length === 0) {
                return false
            }
            if (/\/dist/.test(path)) {
                return false
            }
            if (/\/package.json/.test(path)) {
                return false
            }
            return true
        }
    }
}
