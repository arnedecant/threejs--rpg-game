// -------------------------------------------------------------------
// :: Player
// -------------------------------------------------------------------

export default class Player {

	constructor() {

		this.move = {forward: 0, turn: 0}

		this.init()

	}

	init() {

	}
	
	createViewpoints(parent = this.model) {

		const front = new THREE.Object3D()
		front.position.set(112, 100, 200)
		front.quaternion.set(0.07133122876303646, -0.17495722675648318, -0.006135162916936811, -0.9819695435118246)
        front.parent = parent
        
		const back = new THREE.Object3D()
		back.position.set(0, 100, -250)
		back.quaternion.set(-0.001079297317118498, -0.9994228131639347, -0.011748701462123836, -0.031856610911161515)
        back.parent = parent
        
		const wide = new THREE.Object3D()
		wide.position.set(178, 139, 465)
		wide.quaternion.set(0.07133122876303646, -0.17495722675648318, -0.006135162916936811, -0.9819695435118246)
        wide.parent = parent
        
		const overhead = new THREE.Object3D()
		overhead.position.set(0, 400, 0)
		overhead.quaternion.set(0.02806727427333993, 0.7629212874133846, 0.6456029820939627, 0.018977008134915086)
        overhead.parent = parent
        
		const collect = new THREE.Object3D()
		collect.position.set(40, 82, 94)
		collect.quaternion.set(0.07133122876303646, -0.17495722675648318, -0.006135162916936811, -0.9819695435118246)
        collect.parent = parent
        
		this.viewpoints = { front, back, wide, overhead, collect }
		this.viewpoint = this.viewpoints.front

	}
    
    onMove() {
        
	}

	render() {



	}

}