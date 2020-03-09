import Model from "../base/model"

// -------------------------------------------------------------------
// :: Player
// -------------------------------------------------------------------

export default class Player extends Model {

	constructor({ model, assets }) {

		super({ model })

		KEYBOARD.onDirection.addListener(this.OnControlsInput.bind(this))
		JOYSTICK.onDirection.addListener(this.OnControlsInput.bind(this))

		this.direction = KEYBOARD.direction

		this._animations = {}
		this._animation
		this._viewpoints = {}
		this._viewpoint

		this.assets = assets
		this.animations = {}

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
        this._animations.walking = model.animations[0]

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

				this._animations[key] = object.animations[0]

				if (key == last) {
					this.action = key
					// this.resetPosition()
					this.onLoadingFinished.notify()
				}
			})
		}

	}

	resetPosition() {

		if (!GAME.environment.proxy) setTimeout(() => this.resetPosition.bind(this), 500)

		const dir = new THREE.Vector3(0, -1, 0) // cast down
		const pos = this.model.position.clone()

		pos.y += 200

		const raycaster = new THREE.Raycaster(pos, dir)
		const box = GAME.environment.proxy
		
		const intersect = raycaster.intersectObject(box)

		if (intersect.length <= 0) return
		this.mesh.position.y = pos.y - intersect[0].distance

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
        
		this._viewpoints = { front, back, wide, overhead, collect }
		this._viewpoint = this._viewpoints.back

	}
    
    OnControlsInput({ x, y, z }) {

		if (z > 0 && this._animation != 'walking') this.action = 'walking'
        else if (z <= 0 && this._animation == 'walking') this.action = 'looking_around'
        
		this.direction = { x, y, z }
        
	}

	toggleView() {

		let keys = Object.keys(this._viewpoints)
		let next = 0

		keys.forEach((key, i) => {
			if (this._viewpoint == this._viewpoints[key]) next = i + 1
		})

		this.view = keys[next]

	}

	get action() { return this._animation }
	set action(name){

		if (!this._animations[name]) name = 'walking'

		const anim = this._animations[name]
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

		this.velocity = (name == 'running') ? 300 : 100
		
		this.actionTime = Date.now()
        
	}

	get view() { return this._viewpoint }
	set view(name) {

		this._viewpoint = this._viewpoints[name] ? this._viewpoints[name] : this._viewpoints.back

	}

	checkIntersection(options = {}) {

		return false

		let position = options.position || this.model.position.clone()
        let direction = options.direction || this.model.getWorldDirection(new THREE.Vector3())
		let threshold = options.threshold || 50
		let environment = options.environment || GAME.environmentProxy
        let modifier = options.modifier || { x: 0, y: 0, z: 0 }
        
        for (let axis in modifier) position[axis] += modifier[axis]

        const raycaster = new THREE.Raycaster(position, direction)
        
        for (let box of environment.children) {

            const intersect = raycaster.intersectObject(box)

            if (intersect.length <= 0) continue
            if (intersect[0].distance < threshold) return intersect[0]

        }

        return false

	}

	move(dt) {

		const threshold = 80
		const environment = GAME.environmentProxy
		
		let intersect = false
		let position = this.model.position.clone()
		let direction = this.model.getWorldDirection(new THREE.Vector3())
		
		position.y += 60

        // front boundary & move across z-axis
        
        intersect = this.checkIntersection({ position, direction, environment })
        if (!intersect && this.direction.z > 0) this.model.translateZ(dt * this.velocity)

        // rotate around x-axis

        this.model.rotateY(this.direction.x * -dt)
        
        // left boundary

        // direction.set(-1, 0, 0)
        // direction.applyMatrix4(this.model.matrix)
        // direction.normalize()

        // intersect = this.checkIntersection({ position, direction, environment, threshold })
        // if (intersect) this.model.translateX(0 - (intersect.distance - threshold))

        // right boundary

        // direction.set(1, 0, 0)
		// direction.applyMatrix4(this.model.matrix)
        // direction.normalize()
        
        // intersect = this.checkIntersection({ position, direction, environment, threshold })
        // if (intersect) this.model.translateX(intersect.distance - threshold)

	}

	render(dt) {

		if (!this.model) return

		if (this.action == 'walking') {
			const elapsedTime = Date.now() - this.actionTime
			console.log(elapsedTime)
			if (elapsedTime > 1000 && this.direction.z > 0) this.action = 'running'
		}

		// update animation and movement

		if (this.mixer) this.mixer.update(dt)
		if (this.direction) this.move(dt)

		// update camera

		if (!this._viewpoint) return

		ENGINE.camera.position.lerp(this._viewpoint.getWorldPosition(new THREE.Vector3()), 0.05)
		ENGINE.camera.quaternion.slerp(this._viewpoint.getWorldQuaternion(new THREE.Quaternion()), 0.05)
		ENGINE.camera.updateProjectionMatrix()

	}

}