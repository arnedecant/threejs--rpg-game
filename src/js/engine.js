import Preloader from "./helpers/preloader"

// -------------------------------------------------------------------
// :: Engine
// -------------------------------------------------------------------

// import * as THREE from 'three'

export default class Engine {

	constructor({ container = document.body, size = 1, background = null, debug = false }) {

		// set properties

		this.config = { container, size, background, debug }
		// this.config = arguments[0]
		
		this.mouse = new THREE.Vector2()
		this.raycaster = new THREE.Raycaster()
		this.container = container

		// init

		this.init()

	}

	init() {

		// set up scene, camera and renderer

		this.createScene()

		// setup loader

		this.loader = new THREE.FBXLoader()
		// this.preloader = new Preloader()

		// add events

		// window.addEventListener('resize', this.resize.bind(this), false)
		window.addEventListener('click', this.click.bind(this), false)
		window.addEventListener('mousemove', this.mousemove.bind(this), false)
		window.addEventListener('mousedown', this.mousedown.bind(this), false)
		window.addEventListener('mouseup', this.mouseup.bind(this), false)
		window.addEventListener('mousewheel', this.scroll.bind(this), { passive: true })

		// render

		this.render()

	}

	createScene() {

		this.$canvas = document.createElement('canvas')
		this.ctx = this.$canvas.getContext('2d')

		// create new scene

		this.scene = window.SCENE = new THREE.Scene()

		// set background color

		if (this.config.background) this.scene.background = new THREE.Color(this.config.background)

		// add fog to the scene

		this.scene.fog = new THREE.Fog(0x605050, 500, 1500)

		// create the renderer

		this.createRenderer()

		// create the camera

		this.createCamera()

		// add lights

		this.createLights()

		// add debug helpers

		if (this.config.debug) this.debug()

	}

	debug() {

		let axes = new THREE.AxesHelper(50)
		let grid = new THREE.GridHelper(2000, 40, 0x000000, 0x000000)

		grid.material.opacity = 0.2
		grid.material.transparent = true

		this.scene.add(axes)
		this.scene.add(grid)
		
		this.stats = new Stats()
		this.container.appendChild(this.stats.dom)

	}

	createCamera() {

		// set values to init the camera

		this.aspectRatio = this.width / this.height
		this.fieldOfView = 45
		this.nearPlane = 1
		this.farPlane = 2000

		// create a new camera

		this.camera = new THREE.PerspectiveCamera(
			this.fieldOfView,
			this.aspectRatio,
			this.nearPlane,
			this.farPlane
		)

		this.camera.position.set(240, 240, 240)

		// point the camera to the center

		this.camera.lookAt(this.scene.position)

	}

	createRenderer() {

		// create new renderer

		this.renderer = new THREE.WebGLRenderer({
			alpha: true,
			antialias: true
		})

		// set the size

		this.setSize()

		// enable shadowMap

		this.renderer.shadowMap.enabled = true

		// support for HDPI displays

		this.renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1)

		// append to DOM

		// this.container = document.querySelector('#world')
		this.container.appendChild(this.renderer.domElement)

	}

	createLights() {

		// create a new ambient light

		// this.ambientLight = new THREE.AmbientLight(0xffffff)

		// create a new hemisphere light

		this.hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444)
		this.hemisphereLight.position.set(0, 200, 0)

		// create a new shadow light

		this.directionalLight = new THREE.DirectionalLight(0x707070)
		this.directionalLight.position.set(0, 200, 100)
		this.directionalLight.shadow.camera.top = 3000
		this.directionalLight.shadow.camera.bottom = -3000
		this.directionalLight.shadow.camera.left = -3000
		this.directionalLight.shadow.camera.right = 3000
		this.directionalLight.shadow.mapSize.width = 2048
		this.directionalLight.shadow.mapSize.height = 2048
		this.directionalLight.castShadow = true

		// create a new back light

		// this.backLight = new THREE.DirectionalLight(0xffffff, 0.2)
		// this.backLight.position.set(-100, 200, 50)
		// this.backLight.castShadow = true

		// create a new spot light

		// this.spotLight = new THREE.SpotLight(0xffffff, 1, 80, Math.PI * 0.25, 1, 2)
		// this.spotLight.position.set(0, 40, 0)

		// add lights to the scene

		// this.scene.add(this.ambientLight)
		this.scene.add(this.hemisphereLight)
		this.scene.add(this.directionalLight)
		// this.scene.add(this.spotLight)
		// this.scene.add(this.shadowLight)
		// this.scene.add(this.backLight)

	}

	updateZoom(axis = 'y') {

		// no need to zoom when scrollSpeed hasn't been updated

		if (this.scrollSpeed == 0) return

		// zoom per frame

		let zpf = this.config.camera.zpf

		// min & max values

		let min = this.config.camera.min[axis],
			max = this.config.camera.max[axis]

		// smoother scrolling at the end of the animation
		// prevents zooms very small values, for example 1.2 ...

		if (Math.abs(this.scrollSpeed) < (2 * zpf)) {
			zpf = zpf / 2
		}

		// redefine the zoom per frame

		if (this.scrollSpeed > 0) {

			// zoom out

			if (this.scrollSpeed < zpf) {
				zpf = this.scrollSpeed
				this.scrollSpeed = 0
			} else {
				this.scrollSpeed -= zpf
			}

		} else if (this.scrollSpeed < 0) {

			// zoom in

			if (this.scrollSpeed > -zpf) {
				zpf = this.scrollSpeed
				this.scrollSpeed = 0
			} else {
				this.scrollSpeed += zpf
				zpf = -zpf
			}

		}

		// get new z-pos

		let pos = this.camera.position[axis] - zpf

		// set boundaries for z-pos

		pos = (pos > min) ? pos : min
		pos = (pos < max) ? pos : max

		// apply position if it's above threshold

		this.camera.position[axis] = pos

		// update controls

		// if (this.controls) this.controls.update()

	}

	setSize() {

		// set initial width and height

		this.width = this.container === document.body ? window.innerWidth : this.container.offsetWidth
		this.height = this.container === document.body ? window.innerHeight : this.container.offsetHeight

		// update according to size multiplier

		this.width *= this.config.size
		this.height *= this.config.size

		// set renderer dimensions

		this.renderer.setSize(this.width, this.height)

	}

	scroll(e) {

		// only store the scroll value
		// zoom will be handled in the render function

		this.scrollSpeed = e.deltaY / 2

	}

	click(e) {

		// e.preventDefault()

	}

	mousemove(e) {

		e.preventDefault()

		// calculate mouse position in normalized device coordinates
		// (-1 to +1) for both components

		this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1
		this.mouse.y = - (e.clientY / window.innerHeight) * 2 + 1

		// console.log({ x: this.mouse.x, y: this.mouse.y })

	}

	mousedown(e) {

		

	}

	mouseup(e) {

		

	}

	resize(e) {

		// set canvas dimensions

		this.setSize()

		// set camera

		this.aspectRatio = this.width / this.height
		this.camera.aspect = this.aspectRatio
		this.camera.updateProjectionMatrix()

		// render

		this.render()

	}

	add(mesh) { this.scene.add(mesh) }
	remove(mesh) { this.scene.remove(mesh) }

	render(dt) {

		// update zoom

		// this.updateZoom()
		if (this.controls) this.controls.update()
		if (this.stats) this.stats.update()

		// render

  		this.renderer.render(this.scene, this.camera)

	}

}
