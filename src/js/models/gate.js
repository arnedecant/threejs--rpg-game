// -------------------------------------------------------------------
// :: Game
// -------------------------------------------------------------------

import Model from '../base/model'

export default class Gate extends Model {

    constructor({ name }) {

        this.doors = { left: null, right: null }
        this.proxy = { left: null, right: null }

        this.trigger
        this.viewpoint
        this.sfx

    }

    open() {



    }

    close() {


        
    }

}