import Model from "../base/model"
import Dispatcher from '../helpers/dispatcher'
import Tween from '../helpers/tween'

// -------------------------------------------------------------------
// :: Environment
// -------------------------------------------------------------------

export default class Environment extends Model {

    init() {

        this.gates = []
        this.fans = []
        this.tweens = []

        this.onCutscene = new Dispatcher()

    }

	setup(mesh) {

        mesh.receiveShadow = true
        mesh.scale.set(0.8, 0.8, 0.8)
        mesh.name = this.name = 'Environment'

        let gate = this.newGate()
        
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

            if (name.includes('door')) gate = this.setupGate(gate)

        })
        
        ENGINE.scene.add(mesh)
        
        this.mesh = mesh
        this.onLoadingFinished.notify()

    }

    newGate() {

        return { trigger: null, proxy: [], doors: [] }

    }

    setupGate(gate) {

        if (!gate.trigger) return gate
        if (gate.proxy.length !== 2) return gate
        if (gate.doors.length !== 2) return gate

        this.gates.push({ ...gate })
        
        return this.newGate()

        // if (gate.trigger !== null && gate.proxy.length == 2 && gate.doors.length == 2) {
        //     this.gates.push({ ...gate })
        //     gate = { trigger: null, proxy: [], doors: [] }
        // }

        // return gate

    }

    openGate(gate) {

        this.onCutscene.notify({ status: 'start', name: 'gates' })

        let gates = this.gates
        if (gate) gates = [gate]

        gates.forEach((gate) => {

            // this.sfx.door.play()
            // this.sfx.button.play()

            const left = gate.doors[0]
            const right = gate.doors[1]
            const leftProxy = gate.proxy[0]
            const rightProxy = gate.proxy[1]

            let camera = { 
                position: left.mesh.position.clone(), 
                target: right.mesh.position.clone() 
            }

            camera.position.y += 150
            camera.position.x -= 950

            ENGINE.camera.position.copy(camera.position)
            ENGINE.camera.lookAt(camera.target)

            const leftTween = new Tween({
                target: left.mesh.position,
                channel: 'z',
                endValue: left.mesh.position.z - 240,
                duration: 2000
            })

            const rightTween = new Tween({
                target: right.mesh.position,
                channel: 'z',
                endValue: right.mesh.position.z + 240,
                duration: 2000
            })

            const leftIndex = this.tweens.push(leftTween) - 1
            const rightIndex = this.tweens.push(rightTween) - 1

            leftTween.onComplete.addListener(() => {

                this.tweens.splice(leftIndex, 1)
                leftProxy.position.copy(left.mesh.position)

            })

            rightTween.onComplete.addListener(() => {

                this.tweens.splice(rightIndex, 1)
                rightProxy.position.copy(right.mesh.position)

                delete gate.trigger
                this.onCutscene.notify({ status: 'end', name: 'gates' })
                
            })

        })

    }

    render(dt) {
        
        this.tweens.forEach((tween) => tween.update(dt))
        this.renderFans(dt)

    }

    renderFans(dt) {

        let volume = 0

        this.fans.forEach((fan) => {

            const distance = fan.mesh.position.distanceTo(PLAYER.mesh.position)
            const tmpVolume = 1 - distance / 1000

            if (tmpVolume > volume) volume = tmpVolume

            fan.mesh.rotateZ(dt)

        })

        if (GAME.audio.fan) GAME.audio.fan.volume = volume

    }

}