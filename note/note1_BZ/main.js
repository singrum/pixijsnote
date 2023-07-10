import PIXI from "../../node_modules/pixi.js/dist/pixi.js"






class Circle {
	constructor(centerX, centerY, isWhite){
		this.centerX = centerX;
		this.centerY = centerY;
		this.radius = 0;
		this.isWhite = isWhite;
        this.obj = this.getObj();
	}
	addRad(x){
		this.radius += x;
	}
    getObj(){
        const obj = new PIXI.Graphics()
        obj.lineStyle(0); // draw a circle, set the lineStyle to zero so the circle doesn't have an outline
        obj.beginFill(this.isWhite ? 0xffffff : 0x000000, 1);
        obj.drawCircle(0,0,10);
        obj.endFill();
        return obj;
    }
}

class App{

    constructor(){
        const app = new PIXI.Application({ 
            width: window.innerWidth, height: window.innerHeight,
            backgroundColor: 0x000000, // 배경 색상을 불투명한 검은색으로 설정합니다.
            transparent: false, 
        });
        this.app = app;
        
        
        document.body.appendChild(app.view);
        this.setInteraction();
        this.setTicker();
        console.log(app.renderer)

    }
    setInteraction(){
        this.currPointers = [];
        const downEvent = e => {
            
			if ('ontouchstart' in window) {
                window.addEventListener("touchmove", moveEvent,false);
                this.currPointers = e.targetTouches;
                
            }
            else {
                window.addEventListener("mousemove", moveEvent,false);
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
                window.removeEventListener("touchmove", moveEvent,false)
                for (let touch of e.changedTouches) {
					this.currPointers = this.currPointers.filter(e => e !== touch);
				}
            }
            else {
                window.removeEventListener("mousemove", moveEvent,false)
                this.currPointers = []
            }

		}


		if ('ontouchstart' in window) {
            window.addEventListener('touchstart', downEvent);
            window.addEventListener('touchend', upEvent);
        }
		else {
            
            window.addEventListener('mousedown', downEvent);
            window.addEventListener('mouseup', upEvent);
        }

    }
    async setTicker(){
        let counter = 0;
        const period = 10;
        this.currCircles = [];
        const makeCircle = delta => {
            counter += delta
            if(counter > period){
                counter = 0;

                for(let pointer of this.currPointers){
                    const pixelData = this.app.renderer.extract.pixels ();
                    const index = (pointer.clientY * this.app.view.width + pointer.clientX) * 4;
                    // 픽셀 데이터에서 해당 좌표의 채널(R, G, B, A) 값을 추출
                    const red = pixelData[index];
                    console.log(red)
                    const circle = new Circle(pointer.clientX, pointer.clientY, red === 0? true : false);
                    this.currCircles.push(circle);
                    this.app.stage.addChild(circle.obj)
                    circle.obj.x = circle.centerX;
                    circle.obj.y = circle.centerY;
                    
                }

            }
        }
        const growCircle = delta => {
            for(let circle of this.currCircles){
                circle.addRad(delta * 0.3);
                circle.obj.scale.x = circle.radius
                circle.obj.scale.y = circle.radius
            }
        }


        this.app.ticker.add(delta=>{
            this.app.renderer.render(this.app.stage)
            makeCircle(delta);
            growCircle(delta);
            
        })

        
    }

}

new App()