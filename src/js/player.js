import Dispatcher from "./helpers/dispatcher"

// -------------------------------------------------------------------
// :: Player
// -------------------------------------------------------------------

export default class Player {

	constructor({ model, assets }) {

		KEYBOARD.onDirection.addListener(this.onMove.bind(this))
		// JOYSTICK.onDirection.addListener(this.onMove.bind(this))

		this.onLoadingFinished = new Dispatcher()

		this.move = KEYBOARD.direction
		this._animation

		this.assets = assets
		this.animations = {}

		ENGINE.loader.load(model, this.setupModel.bind(this))

	}

	init() {

	}

	setupModel(model) {

        model.mixer = new THREE.AnimationMixer(model)
        this.mixer = model.mixer
        this.root = model.mixer.getRoot()
        
        model.name = 'Character'
        
        model.traverse((child) => {
            if (!child.isMesh) return
            child.castShadow = true
            child.receiveShadow = true
        })
        
		ENGINE.scene.add(model)
		
        this.model = model
        this.walking = model.animations[0]

        // this.joystick = new JoyStick({ onMove: this.playerControl.bind(this), game: this })
        
        this.createViewpoints(model)

		// this.loadNextAnimation()
		
		this.loadAnimations()

	}

	loadAnimations() {

		let keys = Object.keys(this.assets)
		let last = keys[keys.length - 1]

		for (let key in this.assets) {

			ENGINE.loader.load(this.assets[key], (object) => {

				this[key] = object.animations[0]

				if (key == last) {
					this.action = key
					this.onLoadingFinished.notify()
				}
			})
		}

	}
	
	createViewpoints(parent = this.model) {

		const front = new THREE.Object3D()
		front.position.set(112, 100, 200)
		front.quaternion.set(0.07133122876303646, -0.17495722675648318, -0.006135162916936811, -0.9819695435118246)
        front.parent = parent
        
		const back = new THREE.Object3D()
		back.position.set(0, 100, -250)
		back.quaternion.set(-0.001079297317118498, -0.9994228131639347, -0.011748701462123836, -0.031856610911161515)
        back.parent = parent
        
		const wide = new THREE.Object3D()
		wide.position.set(178, 139, 465)
		wide.quaternion.set(0.07133122876303646, -0.17495722675648318, -0.006135162916936811, -0.9819695435118246)
        wide.parent = parent
        
		const overhead = new THREE.Object3D()
		overhead.position.set(0, 400, 0)
		overhead.quaternion.set(0.02806727427333993, 0.7629212874133846, 0.6456029820939627, 0.018977008134915086)
        overhead.parent = parent
        
		const collect = new THREE.Object3D()
		collect.position.set(40, 82, 94)
		collect.quaternion.set(0.07133122876303646, -0.17495722675648318, -0.006135162916936811, -0.9819695435118246)
        collect.parent = parent
        
		this.viewpoints = { front, back, wide, overhead, collect }
		this.viewpoint = this.viewpoints.back

	}
    
    onMove({ x, y, z }) {

		if (z > 0 && this._animation != 'walking') this.action = 'walking'
        else if (z <= 0 && this._animation == 'walking') this.action = 'looking_around'
        
		this.move = { x, y, z }
        
	}

	set action(name){

		const anim = this[name]
        const action = this.mixer.clipAction(anim,  this.root)
        
        action.time = 0

        this.mixer.stopAllAction()
        
        // if (this.player.action == 'gathering') {
        //     delete this.player.mixer._listeners['finished']
        // }

        // if (name=='gathering'){
        //     action.loop = THREE.LoopOnce
        //     const game = this
        //     this.player.mixer.addEventListener('finished', () => game.action = 'looking_around')
        // }

		this._animation = name
		action.fadeIn(0.5)
        action.play()
        
	}

	render() {



	}

}