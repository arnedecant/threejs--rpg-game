import Model from "../base/model"

// -------------------------------------------------------------------
// :: Environment
// -------------------------------------------------------------------

export default class Environment extends Model {

    init() {

        this.doors = []
        this.fans = []

    }

	setupModel(model) {

        model.receiveShadow = true
        model.scale.set(0.8, 0.8, 0.8)
        model.name = 'Environment'

        let door = { trigger: null, proxy: [], doors: [] }
        
        model.traverse((child) => {

            let name = child.name.toLowerCase()

            if (name.includes('door-null')) door.trigger = child

            if (!child.isMesh) return
            
            if (name.includes('main')) {
                child.castShadow = true
			    child.receiveShadow = true
            } else if (name.includes('door-proxy')) {
                child.material.visible = false
                door.proxy.push(child)
            } else if (name.includes('proxy')) {
                child.material.visible = false
                this.proxy = child
            } else if (name.includes('door')) {
                door.doors.push(child)
            } else if (child.name.includes('fan')) {
                this.fans.push(child)
            }

            if (name.includes('door')) door = this.checkDoor(door)

        })
        
        ENGINE.scene.add(model)
        
        this.model = model
        this.onLoadingFinished.notify()

    }

    checkDoor(door) {

        if (door.trigger !== null && door.proxy.length == 2 && door.doors.length == 2) {
            this.doors.push({...door})
            door = { trigger: null, proxy: [], doors: [] }
        }

        return door

    }

}