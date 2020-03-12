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

        if (name) this._enableButton(name)
        else this.element.removeAttribute('disabled')

    }

    disable(name) {

        if (name) this._disableButton(name)
        else this.element.setAttribute('disabled', 'disabled')

    }

    toggle(name) {

        let $button = this._find(name)
        
        if ($button.hasAttribute('disabled')) this.enable($button)
        else this.disable($button)

    }

    _find(name) {

        return this.element.querySelector(`[data-button="${ name }"]`)
        // return this.$buttons.find(($button) => $button.dataset.button = name)

    }

    _enableButton(name) {

        let $button = name
        if (typeof $button === 'string') $button = this._find(name)

        $button.removeAttribute('disabled')

    }

    _disableButton(name) {

        let $button = name
        if (typeof $button === 'string') $button = this._find(name)

        $button.setAttribute('disabled', 'disabled')

    }

    toggleAudio() {

        let $icon = this.element.querySelector('[data-button="mute"] > i')

        if ($icon.classList.contains('fa-volume-up')) {
            $icon.classList.remove('fa-volume-up')
            $icon.classList.add('fa-volume-mute')
        } else {
            $icon.classList.remove('fa-volume-mute')
            $icon.classList.add('fa-volume-up')
        }

    }

	click(e) {

		if (e.target == this.element) e.preventDefault()

        switch (e.target.dataset.button) {

            case 'inventory':
				this.inventory.toggle()
                break
            case 'mute':
                this.toggleAudio()
                break
                
        }

		this.onClick.notify({ action: e.target.dataset.button, e })

	}

}