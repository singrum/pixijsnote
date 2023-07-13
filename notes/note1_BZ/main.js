
// import PIXI from "../../node_modules/pixi.js/dist/pixi.js"


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
            backgroundColor: 1, // 배경 색상을 불투명한 검은색으로 설정합니다.
            transparent: false,
            renderer : PIXI.WebGLRenderer
        });
        this.app = app;
        // this.app.renderer.resolution = window.devicePixelRatio
        
        document.body.appendChild(app.view);
        this.setInteraction();
        this.setBackground();
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
            this.app.view.addEventListener('touchstart', downEvent,false);
            this.app.view.addEventListener('touchend', upEvent,false);
        }
        else {

            this.app.view.addEventListener('mousedown', downEvent,false);
            this.app.view.addEventListener('mouseup', upEvent,false);
        }


        const setAuto = ()=>{
            this.auto = true;
            this.currPointers = [];
            const pointerLen = 6;
            for(let i = 0; i<pointerLen ; i++){
                const pointer = {
                    clientX :Math.random() * this.app.view.width,
                    clientY : Math.random() * this.app.view.height
                }
                this.currPointers.push(pointer);
            }
            
        }

        this.checkBox = document.querySelector("#auto");
        this.checkBox.addEventListener('click', ()=>{
            if(this.checkBox.checked){
                this.auto = true;
                setAuto();

                if ('ontouchstart' in window) {
                    this.app.view.removeEventListener('touchstart', downEvent,false);
                    this.app.view.removeEventListener('touchend', upEvent,false);
                }
                else {
        
                    this.app.view.removeEventListener('mousedown', downEvent,false);
                    this.app.view.removeEventListener('mouseup', upEvent,false);
                }

            }
            else {
                this.auto = false;
                this.currPointers = [];


                if ('ontouchstart' in window) {
                    this.app.view.addEventListener('touchstart', downEvent,false);
                    this.app.view.addEventListener('touchend', upEvent,false);
                }
                else {
        
                    this.app.view.addEventListener('mousedown', downEvent,false);
                    this.app.view.addEventListener('mouseup', upEvent,false);
                }
            };
        });


    }

    setBackground(){
        const background = new PIXI.Graphics()
        
        background.lineStyle(0);
        background.beginFill(1);

        background.drawRect(0, 0, window.innerWidth, window.innerHeight);
        
        this.app.stage.addChild(background);
        
    }
    setTicker() {
        let uTime = 0;
        let counter = 0;
        const period = 10;
        this.currCircles = [];
        const circleContainer = new PIXI.Container()
        this.app.stage.addChild(circleContainer)




        const edgeFilterGLSL = {
            vs : /*glsl*/`#version 300 es
            precision highp float; 
    
            in vec2 aVertexPosition; 
            in vec2 aTextureCoord;
    
            uniform mat3 projectionMatrix;
    
            out vec2 vTextureCoord;
            
    
            void main(void) {
    
                gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
                vTextureCoord = aTextureCoord;
                
            }`,
            fs : /*glsl*/`#version 300 es
            precision highp float; 
    
            in vec2 vTextureCoord;
            out vec4 fragColor;
    
    
            uniform sampler2D uSampler;
            
            float hue2rgb(float h, float p, float q)
            {
                if (h < 0.0) h += 1.0;
                if (h > 1.0) h -= 1.0;
            
                if (h < 1.0 / 6.0)
                    return p + (q - p) * 6.0 * h;
                else if (h < 1.0 / 2.0)
                    return q;
                else if (h < 2.0 / 3.0)
                    return p + (q - p) * (2.0 / 3.0 - h) * 6.0;
                else
                    return p;
            }
            vec3 hsl2rgb(vec3 hsl)
            {
                vec3 rgb;
                float h = hsl.x;
                float s = hsl.y;
                float l = hsl.z;
            
                float q = l < 0.5 ? l * (1.0 + s) : l + s - l * s;
                float p = 2.0 * l - q;
            
                rgb.r = hue2rgb(h + 1.0 / 3.0, p, q);
                rgb.g = hue2rgb(h, p, q);
                rgb.b = hue2rgb(h - 1.0 / 3.0, p, q);
            
                return rgb;
            }
            
    
            vec3 edgeDetect(){
                ivec2 pix = ivec2(gl_FragCoord.xy);
                vec4 s10 = texelFetchOffset(uSampler, pix, 0, ivec2(-2,0));
                vec4 s01 = texelFetchOffset(uSampler, pix, 0, ivec2(0,2));
                vec4 s21 = texelFetchOffset(uSampler, pix, 0, ivec2(0,-2));
                vec4 s12 = texelFetchOffset(uSampler, pix, 0, ivec2(2,0));
                if(all(equal(s10, vec4(0.0)))||all(equal(s01, vec4(0.0)))||all(equal(s21, vec4(0.0)))||all(equal(s12, vec4(0.0)))){
                    return vec3(0.0,0.0,0.0);
                }
                if(any(notEqual(s10, s12)) || any(notEqual(s01, s21))){
                    vec4 s = texelFetchOffset(uSampler, pix, 0, ivec2(0,0));
                    vec3 hsl = vec3(mod(s.b * 10.0 ,1.0), 1.0, 0.7);
                    return hsl2rgb(hsl);
                    // return vec3(1.0,1.0,1.0);
                    
                }
                else{
                    return vec3(0.0,0.0,0.0);
                }
            }
            void main(void) {
                vec2 vUv = vTextureCoord;
    
    
                fragColor = vec4(edgeDetect(), 1.0);
            }
            `
        }

        const bloomFilterGLSL = {
            vs : /*glsl*/`#version 300 es
            precision highp float; 
    
            in vec2 aVertexPosition; 
            in vec2 aTextureCoord;
    
            uniform mat3 projectionMatrix;
    
            out vec2 vTextureCoord;
            
    
            void main(void) {
    
                gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
                vTextureCoord = aTextureCoord;
                
            }`,
            fs : /*glsl*/`#version 300 es
            precision highp float; 
            in vec2 vTextureCoord;
            out vec4 pixel;

            uniform sampler2D uEdgeTex;
            uniform sampler2D uSampler;
            void main() {
                

                pixel = texture(uEdgeTex, vTextureCoord);
            }`
        }



        const edgeFilter = new PIXI.Filter(edgeFilterGLSL.vs, edgeFilterGLSL.fs);
        // const bloomFilter = new PIXI.Filter(bloomFilterGLSL.vs, bloomFilterGLSL.fs);
        
        
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
                if(this.auto){
                    for(let i = 0; i < 3; i++){
                        const rani = Math.floor(Math.random() * this.currPointers.length);
                        this.currPointers[rani].clientX = Math.random() * this.app.view.width
                        this.currPointers[rani].clientY = Math.random() * this.app.view.height
                    }
                    

                }
                    

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
                circle.addRad(delta * 1.5);
                circle.obj.scale.x = circle.radius/100
                circle.obj.scale.y = circle.radius/100

            }
        }


        const renderTarget = PIXI.RenderTexture.create({ width: this.app.renderer.width, height: this.app.renderer.height }); 
        // const renderTargetEdge = PIXI.RenderTexture.create({ width: this.app.renderer.width, height: this.app.renderer.height }); 
        let sprite =  new PIXI.Sprite(renderTarget)
        sprite.filters = [edgeFilter, new PIXI.FXAAFilter()];
        const applyFilter = () => {
            
            
            this.app.renderer.render(this.app.stage, {renderTexture : renderTarget});
            
            
            
            

            // this.app.renderer.render(this.app.stage, {renderTexture : renderTargetEdge});
            // sprite = PIXI.Sprite.from(renderTargetEdge)

            // bloomFilter.uniforms.uEdgeTex = renderTargetEdge
            // sprite.filters = [edgeFilter, new PIXI.BlurFilter(), bloomFilter];

            
            


            // sprite.anchor.y = 1; 
            // sprite.scale.y *= -1; 
            this.app.stage.addChild(sprite);
        }

        this.app.ticker.add(delta => {
            this.app.stage.children.length = 2
            this.app.renderer.render(this.app.stage)
            
            makeCircle(delta);
            growCircle(delta);
            discardCircle()
            applyFilter();
        })



    }

}

new App()
