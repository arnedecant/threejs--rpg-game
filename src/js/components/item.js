// -------------------------------------------------------------------
// :: Item
// -------------------------------------------------------------------

import Component from '../base/component'
import Dispatcher from '../helpers/dispatcher'

export default class Item extends Component {

    constructor(name) {

        super()

        this.name = name
        this.icon = `../assets/icons/${ name }.jpg`
        this.model = `../assets/items/${ name }.fbx`

        this.template = document.querySelector('template[data-name="item"]').content.cloneNode(true)
        this.element = this.template.querySelector('li')
        this.$img = this.element.querySelector('img')

        this.element.dataset.name = name
        this.$img.src = this.icon
        
    }

	init() {

        

	}

}