import Dispatcher from "../helpers/dispatcher";

export default class JoyStick {

	constructor(options = {}) {

		this.$template = document.querySelector('template[data-name="joystick"]')
		this.$joystick = this.$template.content.cloneNode(true)
		this.$thumb = this.$joystick.querySelector('.joystick__thumb')

		document.body.appendChild(this.$joystick)

		this.onDirection = new Dispatcher()
        
        this.domElement = this.$thumb
		this.maxRadius = options.maxRadius || 40
		this.maxRadiusSquared = this.maxRadius * this.maxRadius
		this.onMove = options.onMove
		this.game = options.game || window.GAME
		this.origin = { left: this.domElement.offsetLeft, top: this.domElement.offsetTop }
        
        if (!this.domElement) return

        this.domElement.addEventListener('touchstart', this.tap.bind(this))
		this.domElement.addEventListener('mousedown', this.tap.bind(this))
		
	}
	
	getMousePosition(e = window.event) {

		let x = e.targetTouches ? e.targetTouches[0].pageX : e.clientX
		let y = e.targetTouches ? e.targetTouches[0].pageY : e.clientY

		return { x, y }

	}
	
	tap(e = window.event) {
		
		// get the mouse cursor position at startup:

		this.offset = this.getMousePosition(e)

		document.ontouchmove = this.move.bind(this)
		document.ontouchend =  this.up.bind(this)

		document.onmousemove = this.move.bind(this)
		document.onmouseup = this.up.bind(this)

	}
	
	move(e = window.event) {
		
		const mouse = this.getMousePosition(e)

		// calculate the new cursor position:

		let left = mouse.x - this.offset.x
		let top = mouse.y - this.offset.y
		
		const sqMag = left * left + top * top

		if (sqMag > this.maxRadiusSquared) {

			// To the power of 0.5 is equal to square 
			// root, but a tad more performant

			const magnitude = Math.pow(sqMag, 0.5)

			left /= magnitude
			top /= magnitude
			left *= this.maxRadius
			top *= this.maxRadius

		}
        
		// set the element's new position:

		this.domElement.style.top = `${ top + this.domElement.clientHeight / 2 }px`
		this.domElement.style.left = `${ left + this.domElement.clientWidth / 2 }px`
		
		const x = (left - this.origin.left + this.domElement.clientWidth / 2) / this.maxRadius
		const z = 0 - (top - this.origin.top + this.domElement.clientHeight / 2) / this.maxRadius

		this.onDirection.notify({ x, y: 0, z })

	}
	
	up(e = window.event) {

		document.ontouchmove = null
		document.touchend = null
		document.onmousemove = null
		document.onmouseup = null

		this.domElement.style.top = `${ this.origin.top }px`
		this.domElement.style.left = `${ this.origin.left }px`

		this.onDirection.notify({ x: 0, y: 0, z: 0 })

	}
}