
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
        const circleContainer = new PIXI.Container()
        this.app.stage.addChild(circleContainer)



        // Fragment Shader
        var fragmentShader = /*glsl*/`
        varying vec2 vTextureCoord;
        uniform sampler2D uSampler;
        uniform vec4 inputSize;
        uniform float uCustomUniform;

        void main(void) {
            vec2 vUv = vTextureCoord;
            vec2 coord = vTextureCoord * inputSize.xy;

            vec4 color = texelFetch(uSampler, coord,2);
            // vec4 color = texture2D(uSampler, vUv);
            gl_FragColor = vec4(color.xyz, 1.0);
        }
        `;
        const filter = new PIXI.Filter(undefined, fragmentShader, {uCostomUniform : 1});
        filter.filterArea = this.app.renderer.screen

        
        const discardCircle = () => {
            
            while(this.currCircles.length !== 0 && this.currCircles[0].radius > Math.hypot(this.app.view.width, this.app.view.height)){
                const circle = this.currCircles.shift();
                
                if(circle.color > this.app.renderer.background.color){
                    this.app.renderer.background.color = circle.color;
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
                    const index = ((Math.floor(pointer.clientY)) * this.app.view.width + Math.floor(pointer.clientX)) * 4;
                    // 픽셀 데이터에서 해당 좌표의 채널(R, G, B, A) 값을 추출
                    
                    const colorCode = (pixelData[index] << 16) + (pixelData[index + 1] << 8) + pixelData[index + 2]
                    
                    
                    const circle = new Circle(pointer.clientX, pointer.clientY, colorCode + 100);
                    this.currCircles.push(circle);
                    
                    circle.obj.zIndex = circle.color


                    
                    circleContainer.addChild(circle.obj)
                    circleContainer.sortChildren()

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


        const renderTarget = PIXI.RenderTexture.create({ width: this.app.renderer.width, height: this.app.renderer.height }); 
        
        const applyFilter = () => {
            
            
            this.app.renderer.render(circleContainer, {renderTexture : renderTarget});
            
            const sprite = PIXI.Sprite.from(renderTarget)
            

            
            sprite.filters = [filter];
            this.app.stage.addChild(sprite);
        }

        this.app.ticker.add(delta => {
            this.app.stage.children.length = 1
            this.app.renderer.render(this.app.stage)
            makeCircle(delta);
            growCircle(delta);
            discardCircle()
            applyFilter();
        })



    }

}

new App()
