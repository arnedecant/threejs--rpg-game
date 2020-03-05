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

		window.ENGINE = new Engine({ container: document.body, debug: true })
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

		this.preload()

	}

	preload() {

		GAME.mode = GAME.MODES.PRELOAD
		GAME.animations.forEach((anim) => GAME.assets.push(`../assets/animations/${ anim }.fbx`))

		this.preloader = new Preloader({ assets: GAME.assets, oncomplete: this.init.bind(this) })

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

		console.log('render app')

		ENGINE.render(timestamp)
		GAME.render(timestamp)

		window.requestAnimationFrame(this.render.bind(this))

	}

}

export default new App()

window.onError = function(error){
	console.error(JSON.stringify(error));
}