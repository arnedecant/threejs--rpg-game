// -------------------------------------------------------------------
// :: Component
// -------------------------------------------------------------------

export default class Component {

	constructor(selector, init) {

        this.selector = selector
		this.element = selector
        
		if (typeof this.element === 'string') this.element = document.querySelector(this.element)
		
		if (!this.element) {
			console.warn(`No element found for selector: ${ selector }`)
			return
		}
		
		this.$template = document.querySelector(`template[data-name="${ this.element.dataset.component }"]`)

        this.element.addEventListener('click', this.click.bind(this))

        if (init) this.init()

	}

	init() {

		

	}

	click(e) {

		

	}

	render(timestamp) {

		// add self to the requestAnimationFrame

		window.requestAnimationFrame(this.render.bind(this))

	}

}