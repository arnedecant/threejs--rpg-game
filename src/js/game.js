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

        this.createDummyEnvironment()

        this.player.onLoadingFinished.addListener(this.onPlayerLoaded.bind(this))

        // this.render()
        
    }

    onPlayerLoaded() {

        delete this.assets
        PLAYER.action = 'looking_around'
        GAME.mode = MODES.ACTIVE

    }

    createDummyEnvironment() {

		const env = new THREE.Group()
		env.name = "Environment"
		ENGINE.scene.add(env)
		
		const geometry = new THREE.BoxBufferGeometry(150, 150, 150)
		const material = new THREE.MeshBasicMaterial({ color: 0x333333 })
		
		for (let x = -1000; x < 1000; x += 300) {
			for (let z =- 1000; z < 1000; z += 300) {

				const block = new THREE.Mesh(geometry, material)
                
                block.position.set(x, 75, z)
				env.add(block)
            
            }
		}
		
        this.environmentProxy = env
        
    }

    checkIntersection(options = {}) {

        let playerPos = options.playerPos || PLAYER.model.position.clone()
        let direction = options.direction || PLAYER.model.getWorldDirection()
        let threshold = options.threshold || 50

        let modifier = options.playerPosMod || { x: 0, y: 0, z: 0 }
        
        for (let axis in modifier) playerPos[axis] += modifier[axis]

        const raycaster = new THREE.Raycaster(playerPos, direction)
        
        for (let box of this.environmentProxy.children) {

            const intersect = raycaster.intersectObject(box)

            if (intersect.length <= 0) continue
            if (intersect[0].distance < threshold) return intersect[0]

        }

        return false

    }
    
    movePlayer(dt) {
        
        let intersect = false
        let playerPos = PLAYER.model.position.clone()
        let direction = PLAYER.model.getWorldDirection()

        playerPos.y += 60

        // front
        
        intersect = this.checkIntersection({ playerPos, direction })
        if (!intersect && this.player.move.z > 0) this.player.model.translateZ(dt * 100)
        
        // left

        // direction.set(-1, 0, 0)
        // direction.applyMatrix4(this.player.model.matrix)
        // direction.normalize()

        // intersect = this.checkIntersection({ playerPos, direction, threshold: 80 })
        // if (!intersect) this.player.model.translateX(0 - (intersect.distance - 80))

        // // right

        // direction.set(1, 0, 0)
		// direction.applyMatrix4(this.player.model.matrix)
        // direction.normalize()
        
        // intersect = this.checkIntersection({ playerPos, direction, threshold: 80 })
        // if (!intersect) this.player.model.translateX(intersect.distance - 80)

    }

	render() {

        const dt = CLOCK.getDelta()

        if (this.player.mixer && this.mode == MODES.ACTIVE) this.player.mixer.update(dt)
		
		if (this.player.move && this.player.model) {
            this.movePlayer(dt)
			// if (this.player.move.z > 0) this.player.model.translateZ(dt * 100)
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