import Model from "../base/model"
import Dispatcher from "../helpers/dispatcher"

// -------------------------------------------------------------------
// :: Player
// -------------------------------------------------------------------

export default class Player extends Model {

	constructor({ path, assets }) {

		super({ path, name: 'Character' })

		this.onMove = new Dispatcher()
		this.onAction = new Dispatcher()

		KEYBOARD.onDirection.addListener(this.onControlsInput.bind(this))
		JOYSTICK.onDirection.addListener(this.onControlsInput.bind(this))

		this.direction = KEYBOARD.direction

		this.loopOnce = ['push-button', 'gather-objects']

		this._animations = {}
		this._animation
		this._viewpoints = {}
		this._viewpoint

		this.assets = assets
		this.animations = {}

	}

	setup(mesh) {

        mesh.mixer = new THREE.AnimationMixer(mesh)
        this.mixer = mesh.mixer
        this.root = mesh.mixer.getRoot()
        
        mesh.name = this.name
        
        mesh.traverse((child) => {

			if (!child.isMesh) return
			
            child.castShadow = true
			child.receiveShadow = true
			
        })
        
		ENGINE.scene.add(mesh)
		
        this.mesh = mesh
        this._animations['walk'] = mesh.animations[0]
        
        this.createViewpoints(mesh)
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
					this.resetPosition()
					this.onLoadingFinished.notify()
				}
			})
		}

	}

	resetPosition() {

		this.action = 'look-around'

		const position = this.mesh.position.clone()
		const direction = new THREE.Vector3(0, -1, 0) // cast down

		position.y += 200

		const intersect = this.checkIntersection({ position, direction })
		if (intersect) this.mesh.position.y = position.y - intersect.distance

	}
	
	createViewpoints(parent = this.mesh) {

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
		collect.position.set(40, 62, 124)
		collect.quaternion.set(0.07133122876303646, -0.17495722675648318, -0.006135162916936811, -0.9819695435118246)
        collect.parent = parent
        
		this._viewpoints = { front, back, wide, overhead, collect, none: null }
		this._viewpoint = this._viewpoints.back

	}
    
    onControlsInput({ x, y, z }) {
        
		this.direction = { x, y, z }

		if (z != 0 && (this.action != 'walk' && this.action != 'run')) this.action = 'walk'
        else if (z == 0 && (this.action == 'walk' || this.action == 'run')) this.action = 'look-around'
        
	}

	toggleView() {

		let keys = Object.keys(this._viewpoints)
		let next = 0

		for (let [i, key] of keys.entries()) {

			if (this.view != this._viewpoints[key]) continue
			if (keys[i + 1] == 'collect' || keys[i + 1] == 'none') continue

			next = i + 1
			break

		}

		this.view = keys[next]

	}

	get action() { return this._animation }
	set action(name) {

		if (!this._animations[name]) name = 'walk'

		const anim = this._animations[name]
        const action = this.mixer.clipAction(anim,  this.root)

		this.mixer.stopAllAction()
		
		if (this.loopOnce.includes(this.action)) delete this.mixer._listeners['finished']
        if (this.action == 'gather-objects') this.view = 'back'
		if (this.action == 'push-button') this.view = 'none'

        if (this.loopOnce.includes(name)) {

			action.loop = THREE.LoopOnce

			this.mixer.addEventListener('finished', () => {
				this.onAction.notify({ name })
				this.action = 'look-around'
			})
		}

		if (name == 'gather-objects') this.view = 'front'

		this._animation = name

		action.timeScale = (name == 'walk' && this.direction.z < 0) ? -0.75 : 1
		action.fadeIn(0.5)
        action.time = 0
		action.play()

		this.velocity = (name == 'run') ? 250 : 100
		
		this.actionTime = Date.now()

	}

	get view() { return this._viewpoint }
	set view(name) {

		this._viewpoint = (name in this._viewpoints) ? this._viewpoints[name] : this._viewpoints.back

	}

	checkIntersection(options = {}) {

		const position = options.position || this.mesh.position.clone()
        const direction = options.direction || this.mesh.getWorldDirection(new THREE.Vector3())
		const threshold = options.threshold || undefined
		const environment = options.environment || GAME.environment.proxy

		if (options.modifier) Object.keys(options.modifier).forEach((key) => position[key] += options.modifier[key])

		const raycaster = new THREE.Raycaster(position, direction)
		const intersect = raycaster.intersectObject(environment)

		if (intersect.length <= 0) return false
		if (!threshold) return intersect[0]
		
		if (intersect[0].distance < threshold) return intersect[0]

        return false

	}

	move(dt) {

		// dt = 0.01

		const threshold = 80
		const gravity = 30
		const environment = GAME.environment.proxy
		
		let intersect = false
		let position = this.mesh.position.clone()
		let direction = this.mesh.getWorldDirection(new THREE.Vector3())
		
		position.y += 60
		if (this.direction.z < 0) direction.negate()

        // front boundary & move across z-axis
        
        intersect = this.checkIntersection({ position, direction, environment, threshold: 50 })
		if (!intersect && this.direction.z > 0) this.mesh.translateZ(dt * this.velocity)
		else if (!intersect && this.direction.z < 0) this.mesh.translateZ(-dt * 75)

        // rotate around x-axis

		if (this.direction.x != 0) this.mesh.rotateY(this.direction.x * -dt)
        
        // left boundary

        direction.set(-1, 0, 0)
        direction.applyMatrix4(this.mesh.matrix)
        direction.normalize()

        intersect = this.checkIntersection({ position, direction, environment, threshold })
        if (intersect) this.mesh.translateX(0 - (intersect.distance - threshold))

        // right boundary

        direction.set(1, 0, 0)
		direction.applyMatrix4(this.mesh.matrix)
        direction.normalize()
        
        intersect = this.checkIntersection({ position, direction, environment, threshold })
		if (intersect) this.mesh.translateX(intersect.distance - threshold)

		// bottom boundary

		direction.set(0, -1, 0)
		position.y += 200
		intersect = this.checkIntersection({ position, direction, environment })

		if (intersect) {

			const targetY = position.y - intersect.distance

			if (targetY > this.mesh.position.y) {

				// going up

				this.mesh.position.y = 0.8 * this.mesh.position.y + 0.2 * targetY
				this.velocityY = 0

			}else if (targetY < this.mesh.position.y){

				// falling down

				if (this.velocityY == undefined) this.velocityY = 0

				this.velocityY += dt * gravity
				this.mesh.position.y -= this.velocityY

				if (this.mesh.position.y < targetY) {
					this.velocityY = 0
					this.mesh.position.y = targetY
				}
			}

		}

		// notify listeners

		this.onMove.notify(this)

		// apply running animation if the player
		// has been walking for over a second
		
		if (this.action != 'walk' || this.direction.z <= 0) return
		
		const elapsedTime = Date.now() - this.actionTime
		if (elapsedTime > 1000) this.action = 'run'

	}

	render(dt) {

		if (!this.mesh) return

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