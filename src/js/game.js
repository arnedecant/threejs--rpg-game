// -------------------------------------------------------------------
// :: Game
// -------------------------------------------------------------------

import Interface from './components/interface'
import Player from './models/player'
import Environment from './models/environment'
import JoyStick from './controls/joystick'
import Keyboard from './controls/keyboard'
import Item from './components/item'
import Audio from './helpers/audio'

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
        this.audio = {}
        this.mute = true

        this.collectables = [] // all collectable items
        this.collect = null // to collect = first item from this.collectables within range
        this.interact = null

        this.range = {
            collect: 100,
            interact: 150
        }

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

        this.setupAudio()

        window.ENVIRONMENT = this.environment = new Environment({
            path: 'assets/environments/factory.fbx'
        })

        this.environment.onLoadingFinished.addListener(this.onEnvironmentLoaded.bind(this))
        this.environment.onCutscene.addListener(this.onCutscene.bind(this))
        
    }

    setupAudio() {

        this.audioContext = new AudioContext()

        const sounds = ['gliss', 'gates', 'factory', 'button', 'fan']
        
        sounds.forEach((sound) => {

            this.audio[sound] = new Audio({
                context: this.audioContext,
                name: sound,
                loop: (sound == 'factory' || sound == 'fan'),
                autoplay: false,
                volume: 0.3
            })
            
        })
        
        this.toggleAudio(true) // always muted at first

    }

    onEnvironmentLoaded() {

        window.PLAYER = this.player = new Player({
            path: '../assets/models/girl.fbx',
            assets: this.assets
        })

        this.player.onLoadingFinished.addListener(this.onPlayerLoaded.bind(this))
        this.player.onMove.addListener(this.onPlayerMove.bind(this))
        this.player.onAction.addListener(this.onPlayerAction.bind(this))

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

    onPlayerMove(player = PLAYER) {

        this.collect = this.collectables.find((item) => {

            if (!item.model.mesh.visible) return false
            if (player.mesh.position.distanceTo(item.model.mesh.position) > this.range.collect) return false

            return item

        })

        this.interact = ENVIRONMENT.gates.find((gate) => {

            // if (!gate.model.mesh.visible) return false
            if (!gate.trigger || !gate.trigger.position) return false
            if (player.mesh.position.distanceTo(gate.trigger.position) > this.range.interact) return false

            return gate

        })

        if (this.collect || this.interact) INTERFACE.enable('interact')
        else INTERFACE.disable('interact')

    }

    onPlayerAction({ name, state = 'finished' }) {

        if (state != 'finished') return

        switch (name) {

            case 'gather-objects':
                INTERFACE.inventory.add(this.collect)
                INTERFACE.enable()
                break
            case 'push-button':
                ENVIRONMENT.openGate(this.interact)
                break

        }

    }

    onCutscene({ name, status = 'end' }) {

        switch (status) {

            case 'start':

                INTERFACE.disable()

                if (name == 'gates') {
                    console.log('play gates')
                    this.audio.gates.play(1)
					this.audio.button.play(1)
                }

                break

            case 'end':

                INTERFACE.enable()
                PLAYER.view = 'back'

                break
        }

    }

    toggleAudio(mute) {

        this.mute = (mute !== undefined) ? mute : !this.mute 

        Object.values(this.audio).forEach((a) => a.stop())

        if (!this.mute) {

            this.audio.factory.play()
            this.audio.fan.play()

            this.audioContext.resume()

            return
        
        }
        
    }

    click({ action, e }) {

        switch (action) {

            case 'camera':
                PLAYER.toggleView()
                break
            case 'mute':
                this.toggleAudio()
                break
            case 'interact': 
                INTERFACE.disable()
                if (this.collect) PLAYER.action = 'gather-objects'
                if (this.interact) PLAYER.action = 'push-button'
                break

        }

    }

	render() {

        if (this.mode != MODES.ACTIVE) return

        const dt = CLOCK.getDelta()
        
        ENGINE.render(dt)
        ENVIRONMENT.render(dt)
        PLAYER.render(dt)
		
    }
    
    

}