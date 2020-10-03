const shell = require('shelljs')

class FemtoDev {
    constructor(name, branch) {
        this.name = name
        this.branch = branch
    }

    check() {
        return this.name === 'popey456963/femtodev' && this.branch === 'main'
    }

    update() {
        shell.cd('/var/www/femtodev')
        shell.exec('git pull')
        shell.exec('hugo')
        console.log('updated')
    }
}

module.exports = FemtoDev