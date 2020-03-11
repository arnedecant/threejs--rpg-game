import Model from "../base/model"

// -------------------------------------------------------------------
// :: Environment
// -------------------------------------------------------------------

export default class Environment extends Model {

    init() {

        this.gates = []
        this.fans = []

    }

	setup(mesh) {

        mesh.receiveShadow = true
        mesh.scale.set(0.8, 0.8, 0.8)
        mesh.name = 'Environment'

        let gate = { trigger: null, proxy: [], doors: [] }
        
        mesh.traverse((child) => {

            let name = child.name.toLowerCase()

            if (name.includes('door-null')) gate.trigger = child

            if (!child.isMesh) return
            
            if (name.includes('main')) {
                child.castShadow = true
			    child.receiveShadow = true
            } else if (name.includes('environmentproxy')) {
                child.material.visible = false
                this.proxy = child
            } else if (name.includes('door-proxy')) {
                child.material.visible = false
                gate.proxy.push(child)
            } else if (name.includes('door')) {
                gate.doors.push(new Model({ name: 'door', mesh: child }))
            } else if (child.name.includes('fan')) {
                this.fans.push(new Model({ name: 'fan', mesh: child }))
            }

            if (name.includes('door')) gate = this.checkGate(gate)

        })
        
        ENGINE.scene.add(mesh)
        
        this.mesh = mesh
        this.onLoadingFinished.notify()

    }

    checkGate(gate) {

        if (gate.trigger !== null && gate.proxy.length == 2 && gate.doors.length == 2) {
            this.gates.push({ ...gate })
            gate = { trigger: null, proxy: [], doors: [] }
        }

        return gate

    }

    render(dt) {

        let fanVolume = 0

        this.fans.forEach((fan) => {

            const distance = fan.mesh.position.distanceTo(PLAYER.mesh.position)
            const tmpVolume = 1 - distance / 1000

            if (tmpVolume > fanVolume) fanVolume = tmpVolume

            fan.mesh.rotateZ(dt)

        })

        GAME.audio.fan.volume = fanVolume

    }

}