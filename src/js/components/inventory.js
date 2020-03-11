// -------------------------------------------------------------------
// :: Inventory
// -------------------------------------------------------------------

import Component from '../base/component'
import Dispatcher from '../helpers/dispatcher'
import Item from './item'

export default class Inventory extends Component {

	init() {

        this.state = 0
        this.items = []
        this.maxItems = this.options.maxItems || 9

        this.$animation = document.querySelector('.inventory__animation')
        this.$animationImg = this.$animation.querySelector('img')

        this.onToggle = new Dispatcher()

        this.clear()

    }
    
    add(item, visibility = false) {

        if (this.items.length >= this.maxItems) {
            alert('Inventory full')
            return
        }

        this.$animationImg.src = item.icon.replace('../', '')
        this.$animation.classList.add('animate')
        this.$animationImg.addEventListener('animationend', (e) => this.$animation.classList.remove('animate'))

        this.items.push(item)
        this._fill()

        item.model.mesh.visible = visibility

    }

    remove(name) {

        for (let [item, index] of this.items.entries()) {

            if (item.name != name) continue

            this.items.splice(index, 1)
            break

        }

        this._fill()

    }

    clear() {

        this.items = []
        this._fill()

    }

    _fill() {

        // reset html

        this.element.innerHTML = ''

        // fill items

        for (let item of this.items) this.element.appendChild(item.element)

        // fill available space

        const empty = this.maxItems - this.items.length
        for (let i = 0; i < empty; i++) this.element.innerHTML += '<li></li>'

    }

	click(e) {

        if (!e.target.dataset || !e.target.dataset.name) return

        const name = e.target.dataset.name

        this.close()

        console.log(name)
		this.onClick.notify(name)

    }
    
    toggle() {

        if (!this.state) this.open()
        else this.close()

    }

    open() {

        this.state = 1
        this.element.classList.add('open')
        this.onToggle.notify(true)

    }

    close() {

        this.state = 0
        this.element.classList.remove('open')
        this.onToggle.notify(false)

    }

}