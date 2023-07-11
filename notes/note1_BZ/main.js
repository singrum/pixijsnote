
import PIXI from "../../node_modules/pixi.js/dist/pixi.js"
// import {BloomFilter} from '../../node_modules/@pixi/filter-bloom/dist/filter-bloom.js';

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

        // V Shader
        const vertexShader = /*glsl*/`#version 300 es
        precision highp float; 

        in vec2 aVertexPosition; 
        in vec2 aTextureCoord;

        uniform mat3 projectionMatrix;

        out vec2 vTextureCoord;
        

        void main(void) {

            gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
            vTextureCoord = aTextureCoord;
            
        }`

        // Fragment Shader
        var fragmentShader = /*glsl*/`#version 300 es
        precision highp float; 

        in vec2 vTextureCoord;
        out vec4 fragColor;


        uniform sampler2D uSampler;
        
        uniform float uCustomUniform;

        vec3 edgeDetect(){
            ivec2 pix = ivec2(gl_FragCoord.xy);
            // vec4 s00 = texelFetchOffset(uSampler, pix, 0, ivec2(-1,1));
            vec4 s10 = texelFetchOffset(uSampler, pix, 0, ivec2(-1,0));
            // vec4 s20 = texelFetchOffset(uSampler, pix, 0, ivec2(-1,-1));
            vec4 s01 = texelFetchOffset(uSampler, pix, 0, ivec2(0,1));
            vec4 s21 = texelFetchOffset(uSampler, pix, 0, ivec2(0,-1));
            // vec4 s02 = texelFetchOffset(uSampler, pix, 0, ivec2(1,1));
            vec4 s12 = texelFetchOffset(uSampler, pix, 0, ivec2(1,0));
            // vec4 s22 = texelFetchOffset(uSampler, pix, 0, ivec2(1,-1));
            if(any(notEqual(s10, s12)) || any(notEqual(s01, s21))){
                return vec3(1.0,1.0,1.0);
            }
            else{
                return vec3(0.0,0.0,0.0);
            }
        }
        void main(void) {
            vec2 vUv = vTextureCoord;
            // vec4 color = texture2D(uSampler, vUv);


            fragColor = vec4(edgeDetect(), 1.0);
        }
        `;
        const filter = new PIXI.Filter(vertexShader, fragmentShader, {uCostomUniform : 1});
        filter.filterArea = this.app.renderer.screen

        
        const discardCircle = () => {
            
            while(this.currCircles.length !== 0 && this.currCircles[0].radius > Math.hypot(this.app.view.width, this.app.view.height)){
                const circle = this.currCircles.shift();
                
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
                    
                    
                    const circle = new Circle(pointer.clientX, pointer.clientY, colorCode + 1);
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
            
            sprite.filters = [filter, new PIXI.BlurFilter()];

            // sprite.anchor.y = 1;     /* 0 = top, 0.5 = center, 1 = bottom */
            // sprite.scale.y *= -1; 
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
