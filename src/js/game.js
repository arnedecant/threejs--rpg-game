// -------------------------------------------------------------------
// :: Game
// -------------------------------------------------------------------

import Player from './models/player'
import Environment from './models/environment'
import JoyStick from './controls/joystick'
import Keyboard from './controls/keyboard'

export default class Game {

	constructor() {

        window.STOP = false

        window.CLOCK = new THREE.Clock()

        this.$interface = document.querySelector('main.interface')

        this.$buttons = {
            camera: this.$interface.querySelector('[data-button="camera"]'),
            interact: this.$interface.querySelector('[data-button="interact"]'),
            inventory: this.$interface.querySelector('[data-button="inventory"]')
        }

        this.MODES = window.MODES = Object.freeze({
            NONE: Symbol('none'),
			PRELOAD: Symbol('preload'),
			INITIALISING: Symbol('initialising'),
			CREATING_LEVEL: Symbol('creating_level'),
			ACTIVE: Symbol('active'),
			GAMEOVER: Symbol('gameover')
        })

        this.mode = this.MODES.NONE
        this.animations = ['running', 'running_backwards', 'gathering', 'looking_around', 'dying']
        this.assets = {}

        this.$interface.addEventListener('click', this.click.bind(this))

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

        PLAYER.action = 'looking_around'
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

        if (e.target == this.$interface) e.preventDefault()

        switch (e.target.dataset.button) {
            case 'camera':
                this.player.toggleView()
                break
            case 'interact':
                break
            case 'inventory':
                break
            default: 
                return
        }

    }

	render() {

        if (this.mode != MODES.ACTIVE) return

        const dt = CLOCK.getDelta()
        
        PLAYER.render(dt)
        ENGINE.render(dt)
		
    }
    
    

}