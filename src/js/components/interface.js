// -------------------------------------------------------------------
// :: Interface
// -------------------------------------------------------------------

import Component from '../base/component'
import Inventory from './inventory'

export default class Interface extends Component {

	init() {

		this.inventory = new Inventory('[data-component="inventory"]')

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

		this.onClick.notify(e.target)

	}

}