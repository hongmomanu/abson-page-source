export function init() {
    try {
        const {
            remote
        } = require('electron')
        const {
            Menu,
            MenuItem
        } = remote

        const menu = new Menu()
        menu.append(new MenuItem({
            label: 'tools',
            submenu: [{
                    label: 'refresh',
                    click: () => {
                        location.reload(true);
                    }
                },
                {
                    label: 'owrner',
                    click: () => {
                        alert('Daisy:18621957893');
                    }
                },
                {
                    label: 'open dir',
                    click: () => {

                        const {
                            shell,
                            remote
                        } = require('electron')
                        const fs = require('fs');
                        const ospath = require('path');
                        const outputDir = remote.app.getPath('desktop');
                        const dir = ospath.resolve(outputDir, 'Abson');
                        if (!fs.existsSync(dir)) {
                            fs.mkdirSync(dir)
                        }
                        shell.openExternal(dir)
                    }
                }
            ]
        }))
        Menu.setApplicationMenu(menu)

    } catch (e) {

    }
}