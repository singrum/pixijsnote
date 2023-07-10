
import PIXI from "../../node_modules/pixi.js/dist/pixi.js"

class Circle {
    constructor(centerX, centerY, isWhite) {
        this.centerX = centerX;
        this.centerY = centerY;
        this.radius = 0;
        this.isWhite = isWhite;
        this.obj = this.getObj();
    }
    addRad(x) {
        this.radius += x;
    }
    getObj() {



        const obj = new PIXI.Graphics()
        obj.lineStyle(0);
        obj.beginFill(this.isWhite ? 0xffffff : 0x000000, 1);

        obj.drawCircle(0, 0, 100);
        obj.x = this.centerX
        obj.y = this.centerY

        return obj;
    }
}

class App {

    constructor() {
        PIXI.settings.RESOLUTION = window.devicePixelRatio
        PIXI.GRAPHICS_CURVES.adaptive = false
        const app = new PIXI.Application({
            width: window.innerWidth, height: window.innerHeight,
            backgroundColor: 0x000000, // 배경 색상을 불투명한 검은색으로 설정합니다.
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
                window.addEventListener("touchmove", moveEvent, false);
                this.currPointers = e.targetTouches;
                

            }
            else {
                window.addEventListener("mousemove", moveEvent, false);
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
                window.removeEventListener("touchmove", moveEvent, false)
                const temp = [];
                for(let p of this.currPointers){
                    let include = false;
                    for(let c of e.changedTouches){
                        if(p === c){
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
                window.removeEventListener("mousemove", moveEvent, false)
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
    async setTicker() {
        let counter = 0;
        const period = 10;
        this.currCircles = [];


        
        const discardCircle = () => {
            if (this.currCircles.length === 0) { return; }

            if (this.currCircles[0].radius > Math.hypot(this.app.view.width, this.app.view.height)) {
                const circle = this.currCircles.shift();
                if (circle.isWhite) {
                    this.app.renderer.background.color = 0xffffff;
                }
                else {
                    this.app.renderer.background.color = 0x000000;
                }
                circle.obj.destroy()



            }
        }
        const makeCircle = delta => {
            counter += delta
            if (counter > period) {
                counter = 0;

                for (let pointer of this.currPointers) {
                    
                    const pixelData = this.app.renderer.extract.pixels();
                    const index = (pointer.clientY * this.app.view.width + pointer.clientX) * 4;
                    // 픽셀 데이터에서 해당 좌표의 채널(R, G, B, A) 값을 추출
                    const red = pixelData[index];
                    console.log(red)
                    
                    const circle = new Circle(pointer.clientX, pointer.clientY, red === 0 ? 1 : 0);
                    this.currCircles.push(circle);
                    this.app.stage.addChild(circle.obj)
                    
                    discardCircle();
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
