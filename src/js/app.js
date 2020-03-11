// -------------------------------------------------------------------
// :: App
// -------------------------------------------------------------------

import Engine from './engine'
import Game from './game'
import Preloader from './helpers/preloader'

class App {

	constructor() {

		// create new engine: setup scene, camera & lighting
		// and load vertex and fragment shaders in memory

		window.ENGINE = new Engine({ container: document.body })
		window.GAME = new Game()
		window.APP = this
		window.SHADERS = {
			vertex: document.querySelector('[data-shader="vertex"]').textContent,
			fragment: document.querySelector('[data-shader="fragment"]').textContent
		}

		// elements

		// properties

		// events

		window.addEventListener('resize', this.resize.bind(this), false)
		window.addEventListener('mousemove', this.mousemove.bind(this))
		document.body.addEventListener('click', this.click.bind(this))

		// init

		// this.animations = ['ascend-stairs', 'climb-ladder', 'climb-rope', 'gather-objects', 'look-around', 'punch', 'push-button', 'run', 'stumble-backwards']
        this.animations = ['ascend-stairs', 'gather-objects', 'look-around', 'push-button', 'run', 'stumble-backwards']
        this.models = ['girl']
        this.items = ['usb']
        this.environments = ['factory']

		this.preload()

	}

	preload() {

		GAME.mode = MODES.PRELOAD

		this.animations.forEach((anim) => GAME.assets[anim] = `../assets/animations/${ anim }.fbx`)
		this.models.forEach((model) => GAME.assets[model] = `../assets/models/${ model }.fbx`)
		this.items.forEach((item) => GAME.assets[item] = `../assets/items/${ item }.fbx`)
		this.environments.forEach((env) => GAME.assets[env] = `../assets/environments/${ env }.fbx`)

		this.preloader = new Preloader({ assets: Object.values(GAME.assets), oncomplete: this.init.bind(this) })

	}

	init() {

		ENGINE.scene.background = new THREE.Color(0xa0a0a0)
		ENGINE.scene.fog = new THREE.Fog(0xa0a0a0, 200, 1000)
		
		GAME.init()
	
		this.render()

	}

	resize(e) {

		ENGINE.resize()

	}

	mousemove(e) {

	}

	click(e) {

	}

	render(timestamp) {

        if (window.STOP) return

		window.requestAnimationFrame(this.render.bind(this))

		if (GAME.mode != MODES.ACTIVE) return

		GAME.render(timestamp)
		ENGINE.render(timestamp)

	}

}

export default new App()

// debugging helpers

window.onError = (error) => console.error(JSON.stringify(error))
window.stop = () => window.STOP = true
window.start = (once = false) => {
	if (!once) window.STOP = false
	GAME.render()
}