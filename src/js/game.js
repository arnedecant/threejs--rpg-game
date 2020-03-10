// -------------------------------------------------------------------
// :: Game
// -------------------------------------------------------------------

import Interface from './components/interface'
import Player from './models/player'
import Environment from './models/environment'
import JoyStick from './controls/joystick'
import Keyboard from './controls/keyboard'

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
        // this.animations = ['ascend-stairs', 'climb-ladder', 'climb-rope', 'gather-objects', 'look-around', 'punch', 'push-button', 'run', 'stumble-backwards']
        this.animations = ['ascend-stairs', 'gather-objects', 'look-around', 'push-button', 'run', 'stumble-backwards']
        this.assets = {}

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
            model: '../assets/environments/factory.fbx'
        })

        this.environment.onLoadingFinished.addListener(this.onEnvironmentLoaded.bind(this))
        
    }

    onPlayerLoaded() {

        delete this.assets

        PLAYER.action = 'look-around'
        GAME.mode = MODES.ACTIVE

    }

    onEnvironmentLoaded() {

        window.PLAYER = this.player = new Player({
            model: '../assets/models/girl.fbx',
            assets: this.assets
        })

        this.player.onLoadingFinished.addListener(this.onPlayerLoaded.bind(this))

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