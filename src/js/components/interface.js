// -------------------------------------------------------------------
// :: Interface
// -------------------------------------------------------------------

import Component from '../base/component'
import Inventory from './inventory'

export default class Interface extends Component {

	init() {

        this.inventory = new Inventory('[data-component="inventory"]')

        // this does not work as this loses its connection with the dom
        // this.$buttons = [...this.element.querySelectorAll('[data-button]')]

    }
    
    enable(name) {

        const $button = this._find(name)
        $button.removeAttribute('disabled')

    }

    disable(name) {

        const $button = this._find(name)
        $button.setAttribute('disabled', 'disabled')

    }

    _find(name) {

        return this.element.querySelector(`[data-button="${ name }"]`)
        // return this.$buttons.find(($button) => $button.dataset.button = name)

    }

	click(e) {

		if (e.target == this.element) e.preventDefault()

        switch (e.target.dataset.button) {
            case 'camera':
                GAME.player.toggleView()
                break
            case 'interact':
                break
            case 'inventory':
				this.inventory.toggle()
                break
            default: 
                return
        }

		this.onClick.notify({ action: e.target.dataset.button, e })

	}

}