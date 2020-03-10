// -------------------------------------------------------------------
// :: Item
// -------------------------------------------------------------------

import Component from '../base/component'
import Dispatcher from '../helpers/dispatcher'
import Model from '../base/model'

export default class Item extends Component {

    constructor(name, options) {

        super()

        this.name = name
        this.icon = `../assets/icons/${ name }.jpg`
        this.model = new Model({
            name: name,
            path: `../assets/items/${ name }.fbx`,
            ...options
        })

        this.template = document.querySelector('template[data-name="item"]').content.cloneNode(true)
        this.element = this.template.querySelector('li')
        this.$img = this.element.querySelector('img')

        this.element.dataset.name = name
        this.$img.src = this.icon

        this.onLoadingFinished = new Dispatcher()
        this.model.onLoadingFinished.addListener(() => this.onLoadingFinished.notify())
        
    }

	init() {

        

	}

}