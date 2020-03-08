// -------------------------------------------------------------------
// :: Game
// -------------------------------------------------------------------

import Player from './player'
import JoyStick from './controls/joystick'
import Keyboard from './controls/keyboard'

export default class Game {

	constructor() {

        window.STOP = false

        window.CLOCK = new THREE.Clock()
        window.KEYBOARD = new Keyboard()
        window.JOYSTICK = new JoyStick()

        this.MODES = window.MODES = Object.freeze({
            NONE: Symbol('none'),
			PRELOAD: Symbol('preload'),
			INITIALISING: Symbol('initialising'),
			CREATING_LEVEL: Symbol('creating_level'),
			ACTIVE: Symbol('active'),
			GAMEOVER: Symbol('gameover')
        })

        this.mode = this.MODES.NONE
        this.animations = ['running', 'running_backwards', 'gathering', 'looking_around']
        this.assets = {}

    }

	init() {

        this.mode = MODES.INITIALISING

        let geometry = new THREE.PlaneBufferGeometry(2000, 2000)
        let material = new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false })
        let mesh = new THREE.Mesh(geometry, material)

        mesh.rotation.x = - Math.PI / 2
        mesh.receiveShadow = true
        
        ENGINE.scene.add(mesh)

        window.PLAYER = this.player = new Player({
            model: '../assets/models/girl.fbx',
            assets: this.assets
        })

        this.player.onLoadingFinished.addListener(this.onPlayerLoaded.bind(this))

        // this.render()
        
    }

    onPlayerLoaded() {

        delete this.assets
        PLAYER.action = 'looking_around'
        GAME.mode = MODES.ACTIVE

    }

	render() {

        const dt = CLOCK.getDelta()

        if (this.player.mixer && this.mode == MODES.ACTIVE) this.player.mixer.update(dt)
		
		if (this.player.move && this.player.model) {
			if (this.player.move.z > 0) this.player.model.translateZ(dt * 100)
			this.player.model.rotateY(this.player.move.x * -dt)
        }
        
		if (this.player.viewpoints && this.player.viewpoint && this.player.viewpoint){
			ENGINE.camera.position.lerp(this.player.viewpoint.getWorldPosition(new THREE.Vector3()), 0.05)
            ENGINE.camera.quaternion.slerp(this.player.viewpoint.getWorldQuaternion(new THREE.Quaternion()), 0.05)
            ENGINE.camera.updateProjectionMatrix()
        }
        
        PLAYER.render()
        ENGINE.render()

        // window.requestAnimationFrame(this.render.bind(this))
		
    }
    
    

}