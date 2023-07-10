import PIXI from "../../node_modules/pixi.js/dist/pixi.js"






class Circle {
	constructor(centerX, centerY, BWflag){
		this.centerX = centerX;
		this.centerY = centerY;
		this.radius = 0;
		this.BWflag = BWflag;
        this.obj = this.getObj();
	}
	addRad(x){
		this.radius += x;
	}
    getObj(){
        const obj = new PIXI.Graphics()
        obj.lineStyle(0); // draw a circle, set the lineStyle to zero so the circle doesn't have an outline
        obj.beginFill(0xffffff, 1);
        obj.drawCircle(0,0,10);
        obj.endFill();
        return obj;
    }
}

class App{

    constructor(){
        const app = new PIXI.Application({ width: window.innerWidth, height: window.innerHeight });
        this.app = app;
        const canvas = document.createElement('canvas');
        canvas.width = app.renderer.width;
        canvas.height = app.renderer.height;
        this.canvas = canvas
        const ctx2d = canvas.getContext("2d", {willReadFrequently : true})
        this.ctx2d = ctx2d;
        document.body.appendChild(this.canvas);
        
        // document.body.appendChild(app.view);
        this.setInteraction();
        this.setTicker();
        console.log(app.renderer)

    }
    setInteraction(){
        this.currPointers = [];
        const downEvent = e => {
            
			if ('ontouchstart' in window) {
                this.canvas.addEventListener("touchmove", moveEvent,false);
                this.currPointers = e.targetTouches;
                
            }
            else {
                this.canvas.addEventListener("mousemove", moveEvent,false);
                this.currPointers = [e];
                
            }
		}
		const moveEvent = e=>{
			if ('ontouchstart' in window) {
				this.currPointers = e.targetTouches

			}
			else {
				this.currPointers = [e]

			}
		}
		const upEvent = e => {
			if ('ontouchstart' in window) {
                this.canvas.removeEventListener("touchmove", moveEvent,false)
                for (let touch of e.changedTouches) {
					this.currPointers = this.currPointers.filter(e => e !== touch);
				}
            }
            else {
                this.canvas.removeEventListener("mousemove", moveEvent,false)
                this.currPointers = []
            }

		}


		if ('ontouchstart' in window) {
            this.canvas.addEventListener('touchstart', downEvent);
            this.canvas.addEventListener('touchend', upEvent);
        }
		else {
            
            this.canvas.addEventListener('mousedown', downEvent);
            this.canvas.addEventListener('mouseup', upEvent);
        }

    }
    setTicker(){
        let counter = 0;
        const period = 10;
        this.currCircles = [];
        const makeCircle = delta => {
            counter += delta
            if(counter > period){
                counter = 0;

                for(let pointer of this.currPointers){
                    const pxData = this.ctx2d.getImageData(pointer.clientX, pointer.clientY, 1, 1).data
                    // console.log(pxData)
                    const circle = new Circle(pointer.clientX, pointer.clientY, 1);
                    this.currCircles.push(circle);
                    this.app.stage.addChild(circle.obj)
                    circle.obj.x = circle.centerX;
                    circle.obj.y = circle.centerY;
                    
                }

            }
        }
        const growCircle = delta => {
            for(let circle of this.currCircles){
                circle.addRad(delta * 0.1);
                circle.obj.scale.x = circle.radius
                circle.obj.scale.y = circle.radius
            }
        }


        this.app.ticker.add(delta=>{
            this.app.renderer.render(this.app, this.canvas);
            
            makeCircle(delta);
            growCircle(delta);
            
        })

        
    }

}

new App()