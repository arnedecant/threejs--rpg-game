// -------------------------------------------------------------------
// :: Game
// -------------------------------------------------------------------

import Player from './player'
import JoyStick from './helpers/joystick'

export default class Game {

	constructor() {

        window.STOP = false

        this.clock = new THREE.Clock()

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
        this.assets = []

        this.player = new Player()
		

    }

	init() {

        this.mode = MODES.INITIALISING

        let geometry = new THREE.PlaneBufferGeometry(2000, 2000)
        let material = new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false })
        let mesh = new THREE.Mesh(geometry, material)

        mesh.rotation.x = - Math.PI / 2
        mesh.receiveShadow = true
        
        ENGINE.scene.add(mesh)

        ENGINE.loader.load('../assets/models/girl.fbx', this.setupModel.bind(this))

        this.render()
        
    }

    setupModel(model) {

        model.mixer = new THREE.AnimationMixer(model)
        this.player.mixer = model.mixer
        this.player.root = model.mixer.getRoot()
        
        model.name = 'Character'
        
        model.traverse((child) => {
            if (!child.isMesh) return
            child.castShadow = true
            child.receiveShadow = true
        })
        
        ENGINE.scene.add(model)
        this.player.model = model
        this.player.walking = model.animations[0]

        this.joystick = new JoyStick({ onMove: this.playerControl.bind(this), game: this })
        
        this.player.createViewpoints(model)

        this.loadNextAnim()

    }

    loadNextAnim() {

        let anim = this.animations.pop()
        let asset = this.assets.pop()

        const game = this
        
		ENGINE.loader.load(asset, (object) => {

            game.player[anim] = object.animations[0]
            
            if (game.assets.length > 0) game.loadNextAnim()
            else {
				delete game.assets;
				game.action = 'looking_around'
                game.mode = MODES.ACTIVE
			}
        })
        
    }

    playerControl(forward, turn) {
        
        if (forward > 0 && this.player.action != 'walking') this.action = 'walking'
        else if (forward <= 0 && this.player.action == 'walking') this.action = 'looking_around'
        
		this.player.move = { forward, turn }

    }

	render() {

        const dt = this.clock.getDelta()

        if (this.player.mixer && this.mode == MODES.ACTIVE) this.player.mixer.update(dt)
		
		if (this.player.move && this.player.model) {
			if (this.player.move.forward > 0) this.player.model.translateZ(dt * 100)
			this.player.model.rotateY(this.player.move.turn * dt)
        }
        
		if (this.player.viewpoints && this.player.viewpoint && this.player.viewpoint){
			ENGINE.camera.position.lerp(this.player.viewpoint.getWorldPosition(new THREE.Vector3()), 0.05)
            ENGINE.camera.quaternion.slerp(this.player.viewpoint.getWorldQuaternion(new THREE.Quaternion()), 0.05)
            ENGINE.camera.updateProjectionMatrix()
        }
        
        ENGINE.render()

        if (window.STOP) return

        window.requestAnimationFrame(this.render.bind(this))
		
    }
    
    set action(name){

        const anim = this.player[name]
        const action = this.player.mixer.clipAction(anim,  this.player.root)
        
        action.time = 0

        this.player.mixer.stopAllAction()
        
        // if (this.player.action == 'gathering') {
        //     delete this.player.mixer._listeners['finished']
        // }

        // if (name=='gathering'){
        //     action.loop = THREE.LoopOnce
        //     const game = this
        //     this.player.mixer.addEventListener('finished', () => game.action = 'looking_around')
        // }

		this.player.action = name
		action.fadeIn(0.5)
		action.play()
	}

}