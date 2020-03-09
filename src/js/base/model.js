import Dispatcher from "../helpers/dispatcher"

// -------------------------------------------------------------------
// :: Model
// -------------------------------------------------------------------

export default class Model {

	constructor({ model }) {

        this.path = model
		this.onLoadingFinished = new Dispatcher()
        
		ENGINE.loader.load(model, this.setupModel.bind(this))

		this.init()

	}

	init() {

		

	}

	setupModel(model) {

        

    }

	render(dt) {

		

	}

}