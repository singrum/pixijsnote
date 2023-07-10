import PIXI from "../../node_modules/pixi.js/dist/pixi.js"







class App{
    constructor(){
        const app = new PIXI.Application({ width: window.innerWidth, height: window.innerHeight });
        this.app = app;
        document.body.appendChild(app.view);
        this.setInteraction();
        this.setTicker();

    }
    setInteraction(){
        this.currPointers = [];
        const downEvent = e => {
            
			if ('ontouchstart' in window) {
                this.app.view.addEventListener("touchmove", moveEvent,false);
                this.currPointers = e.targetTouches;
                
            }
            else {
                this.app.view.addEventListener("mousemove", moveEvent,false);
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
                this.app.view.removeEventListener("touchmove", moveEvent,false)
                for (let touch of e.changedTouches) {
					this.currPointers = this.currPointers.filter(e => e !== touch);
				}
            }
            else {
                this.app.view.removeEventListener("mousemove", moveEvent,false)
                this.currPointers = []
            }

		}


		if ('ontouchstart' in window) {
            this.app.view.addEventListener('touchstart', downEvent);
            this.app.view.addEventListener('touchend', upEvent);
        }
		else {
            
            this.app.view.addEventListener('mousedown', downEvent);
            this.app.view.addEventListener('mouseup', upEvent);
        }

    }
    setTicker(){
        let counter = 0;
        const period = 0.4;
        const makeCircle = delta => {
            counter += delta
            if(counter > period){
                counter = 0;

                console.log(this.currPointers)

            }
        }
        const growCircle = delta => {

        }
        const drawCircle = delta => {

        }


        this.app.ticker.add(delta=>{
            makeCircle(delta);
            growCircle(delta);
            drawCircle(delta);
            
        })

        
    }

}

new App()