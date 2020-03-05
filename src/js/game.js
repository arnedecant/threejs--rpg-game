// -------------------------------------------------------------------
// :: Game
// -------------------------------------------------------------------

import Player from './player'
import JoyStick from './helpers/joystick'

export default class Game {

	constructor() {

        this.clock = new THREE.Clock()

        this.MODES = window.MODES = Object.freeze({
            NONE: Symbol("none"),
			PRELOAD: Symbol("preload"),
			INITIALISING: Symbol("initialising"),
			CREATING_LEVEL: Symbol("creating_level"),
			ACTIVE: Symbol("active"),
			GAMEOVER: Symbol("gameover")
        })

        this.mode = this.MODES.NONE
        this.animations = ['walking', 'running', 'running_backwards', 'gathering']
        this.assets = []

        this.player = new Player()
		

	}

	init() {

        this.mode = MODES.INITIALISING

        let geometry = new THREE.PlaneBufferGeometry(2000, 2000)
        let material = new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false })
        let mesh = new THREE.Mesh(geometry, material)

        mesh.rotation.x = - Math.PI / 2
        mesh.receiveShadow = true
        
        ENGINE.scene.add(mesh)

        ENGINE.loader.load('../assets/models/girl.fbx', this.setupModel.bind(this))
    }

    setupModel(model) {

        model.mixer = new THREE.AnimationMixer(model)
        this.player.mixer = model.mixer
        this.player.root = model.mixer.getRoot()
        
        model.name = "Character"
        
        model.traverse((child) => {
            if (!child.isMesh) return
            child.castShadow = true
            child.receiveShadow = true
        })

        model.position.set(0,0,0)
        // model.rotation.x = 0
        // model.rotation.y = 0
        // model.rotation.z = 0
        
        ENGINE.scene.add(model)
        this.player.model = model
        this.player.walk = model.animations[0]

        // const g = new THREE.BoxGeometry(1,1,1)
        // const m = new THREE.MeshPhongMaterial({ color: 0xaaaaff })
        // const cube = new THREE.Mesh(g, m)
        // ENGINE.scene.add(cube)

        this.joystick = new JoyStick({ onMove: this.playerControl.bind(this), game: this })
        
        this.player.createViewpoints(model)

        this.loadNextAnim()

    }

    // set action(name){
	// 	const anim = this.player[name];
	// 	const action = this.player.mixer.clipAction( anim,  this.player.root );
    //     action.time = 0;
	// 	this.player.mixer.stopAllAction();
    //     if (this.player.action == 'gather-objects'){
    //         delete this.player.mixer._listeners['finished'];
    //     }
    //     if (name=='gather-objects'){
    //         action.loop = THREE.LoopOnce;
    //         const game = this;
    //         this.player.mixer.addEventListener('finished', function(){ 
    //             console.log("gather-objects animation finished");
    //             game.action = 'look-around'; 
    //         });
    //     }
	// 	this.player.action = name;
	// 	action.fadeIn(0.5);	
	// 	action.play();
	// }
    
    initViewpoints() {

        

    }

    loadNextAnim() {

        let anim = this.assets.pop();

		const game = this;
		ENGINE.loader.load( anim, function( object ){
            game.player[anim] = object.animations[0];
            if (game.assets.length>0){
				game.loadNextAnim();
			}else{
				delete game.assets;
				game.action = "look-around";
                game.mode = MODES.ACTIVE;
                
                ENGINE.resize()
			}
        });	
        

    }

    playerControl(forward, turn) {

        // console.log(`playerControl(${forward}, ${turn})`);
        
		if (forward>0){
			if (this.player.action!='walk') this.action = 'walk';
		}else{
			if (this.player.action=="walk") this.action = 'look-around';
        }
        
		if (forward==0 && turn==0){
			delete this.player.move
		}else{
			this.player.move = { forward, turn }; 
		}

    }

	render() {

        const dt = this.clock.getDelta()
        
        // console.log(dt)


		if (this.player.mixer!=undefined && this.mode==MODES.ACTIVE) this.player.mixer.update(dt)
		
		if (this.player.move && this.player.model) {
			if (this.player.move.forward > 0) this.player.model.translateZ(dt*100)
			this.player.model.rotateY(this.player.move.turn*dt)
        }
        
		
		if (this.player.viewpoints && this.player.viewpoint && this.player.viewpoint){
			ENGINE.camera.position.lerp(this.player.viewpoint.getWorldPosition(new THREE.Vector3()), 0.05)
            ENGINE.camera.quaternion.slerp(this.player.viewpoint.getWorldQuaternion(new THREE.Quaternion()), 0.05)
            ENGINE.camera.updateProjectionMatrix()
		}
		
	}

}