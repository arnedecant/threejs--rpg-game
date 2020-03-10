// -------------------------------------------------------------------
// :: Game
// -------------------------------------------------------------------

import Interface from './components/interface'
import Player from './models/player'
import Environment from './models/environment'
import JoyStick from './controls/joystick'
import Keyboard from './controls/keyboard'
import Item from './components/item'

export default class Game {

	constructor() {

        window.STOP = false

        window.CLOCK = new THREE.Clock()

        window.INTERFACE = new Interface('main.interface')
        INTERFACE.onClick.addListener(this.click.bind(this))

        window.MODES = Object.freeze({
            NONE: Symbol('none'),
			PRELOAD: Symbol('preload'),
			INITIALISING: Symbol('initialising'),
			CREATING_LEVEL: Symbol('creating_level'),
			ACTIVE: Symbol('active'),
			GAMEOVER: Symbol('gameover')
        })

        this.mode = MODES.NONE

        this.assets = {}

        this.collectables = []

    }

	init() {

        window.KEYBOARD = new Keyboard()
        window.JOYSTICK = new JoyStick()

        this.mode = MODES.INITIALISING

        let geometry = new THREE.PlaneBufferGeometry(2000, 2000)
        let material = new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false })
        let mesh = new THREE.Mesh(geometry, material)

        mesh.rotation.x = - Math.PI / 2
        mesh.receiveShadow = true
        
        ENGINE.scene.add(mesh)

        window.ENVIRONMENT = this.environment = new Environment({
            path: '../assets/environments/factory.fbx'
        })

        this.environment.onLoadingFinished.addListener(this.onEnvironmentLoaded.bind(this))
        
    }

    onEnvironmentLoaded() {

        window.PLAYER = this.player = new Player({
            path: '../assets/models/girl.fbx',
            assets: this.assets
        })

        this.player.onLoadingFinished.addListener(this.onPlayerLoaded.bind(this))
        this.player.onMove.addListener(this.onPlayerMove.bind(this))

    }

    onPlayerLoaded() {

        delete this.assets
        GAME.mode = MODES.ACTIVE

        const usb = new Item('usb', {
            position: { x: -416, y: 3, z: -472 },
            scale: 0.3
        })

        usb.onLoadingFinished.addListener(() => this.collectables.push(usb))

    }

    onPlayerMove(player) {

        // console.log('onPlayerMove', player)

    }

    click(e) {

        

    }

	render() {

        if (this.mode != MODES.ACTIVE) return

        const dt = CLOCK.getDelta()
        
        PLAYER.render(dt)
        ENGINE.render(dt)
		
    }
    
    

}