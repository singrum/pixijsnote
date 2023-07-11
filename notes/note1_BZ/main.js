
import PIXI from "../../node_modules/pixi.js/dist/pixi.js"

class Circle {
    constructor(centerX, centerY, color) {
        this.centerX = centerX;
        this.centerY = centerY;
        this.radius = 0;
        this.color = color
        this.obj = this.getObj();
    }
    addRad(x) {
        this.radius += x;
    }
    getObj() {



        const obj = new PIXI.Graphics()
        obj.lineStyle(0);
        obj.beginFill(this.color);

        obj.drawCircle(0, 0, 100);
        obj.x = this.centerX
        obj.y = this.centerY

        return obj;
    }
}

class App {

    constructor() {
        PIXI.settings.RESOLUTION = window.devicePixelRatio
    
        const app = new PIXI.Application({
            width: window.innerWidth, height: window.innerHeight,
            backgroundColor: 0, // 배경 색상을 불투명한 검은색으로 설정합니다.
            transparent: false,
            renderer : PIXI.WebGLRenderer
        });
        this.app = app;


        document.body.appendChild(app.view);
        this.setInteraction();
        this.setTicker();
        

    }
    setInteraction() {
        this.currPointers = [];
        const downEvent = e => {

            if ('ontouchstart' in window) {
                this.app.view.addEventListener("touchmove", moveEvent, false);
                this.currPointers = e.targetTouches;
                

            }
            else {
                this.app.view.addEventListener("mousemove", moveEvent, false);
                this.currPointers = [e];
                

            }
        }
        const moveEvent = e => {
            if ('ontouchstart' in window) {
                this.currPointers = e.targetTouches

            }
            else {
                this.currPointers = [e]

            }
        }
        const upEvent = e => {
            if ('ontouchstart' in window) {
                this.app.view.removeEventListener("touchmove", moveEvent, false)
                const temp = [];
                for(let p of this.currPointers){
                    let include = false;
                    for(let c of e.changedTouches){
                        if(p.identifier === c.identifier){
                            include = true;
                        }
                    }
                    if(!include){
                        temp.push(p)
                    }
                }
                this.currPointers = temp;
            }
            else {
                this.app.view.removeEventListener("mousemove", moveEvent, false)
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
    async setTicker() {
        let counter = 0;
        const period = 10;
        this.currCircles = [];
        

        
        const discardCircle = () => {
            if (this.currCircles.length === 0) { return; }
            let i = 0;
            while(this.currCircles[0].radius > Math.hypot(this.app.view.width, this.app.view.height)){
                const circle = this.currCircles.shift();
                if(circle.color > this.app.renderer.background.color){
                    this.app.renderer.background.color = circle.color;
                }
                circle.obj.destroy()
                this.app.stage.removeChild(circle)
                
                
                i++
            }



            }

        
        const makeCircle = delta => {
            counter += delta
            if (counter > period) {
                counter = 0;

                for (let pointer of this.currPointers) {
                    
                    const pixelData = this.app.renderer.extract.pixels();
                    const index = ((Math.floor(pointer.clientY)) * this.app.view.width + Math.floor(pointer.clientX)) * 4;
                    // 픽셀 데이터에서 해당 좌표의 채널(R, G, B, A) 값을 추출
                    
                    const colorCode = (pixelData[index] << 16) + (pixelData[index + 1] << 8) + pixelData[index + 2]
                    
                    
                    const circle = new Circle(pointer.clientX, pointer.clientY, colorCode + 100);
                    this.currCircles.push(circle);
                    
                    circle.obj.zIndex = circle.color



                    // if(this.currCircles.length === 0){
                    //     this.currCircles.push(circle)
                    // }
                    // for(let i = this.currCircles.length - 1; i >=0; i--){
                    //     if(this.currCircles[i].color < circle.color){
                    //         this.currCircles.splice(i + 1, 0, circle);
                    //         break;
                    //     }
                    // }
                    

                    
                    this.app.stage.addChild(circle.obj)
                    
                    discardCircle()
                    this.app.stage.sortChildren()
                    // console.log(this.app.stage.children.map(e=>e.zindex))

                }

                
            }
        }

        const growCircle = delta => {
            for (let circle of this.currCircles) {
                circle.addRad(delta * 2);
                circle.obj.scale.x = circle.radius/100
                circle.obj.scale.y = circle.radius/100

            }
        }


        // const filter = new PIXI.Filter(myShaderVert, myShaderFrag, { myUniform: 0.5 });

        const applyFilter = () => {
            

        }

        this.app.ticker.add(delta => {
            this.app.renderer.render(this.app.stage)
            makeCircle(delta);
            growCircle(delta);
            applyFilter();
        })



    }

}

new App()
