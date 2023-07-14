
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
        // obj.drawRect(-20,-20,40,40)
        obj.drawCircle(0, 0, 20);
        
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
            renderer : PIXI.WebGLRenderer,
            premultipliedAlpha : false,
            
            antialias: false
        });
        this.app = app;
        // this.app.renderer.resolution = window.devicePixelRatio
        
        document.body.appendChild(app.view);



        this.setupGUI();
        this.setInteraction();
        this.setBackground();
        this.setTicker();
        

    }
    setupGUI(){



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
            
            this.currPointers = [];
            
            for(let i = 0; i<this.pointerNum ; i++){
                const pointer = {
                    clientX :Math.random() * this.app.view.width,
                    clientY : Math.random() * this.app.view.height
                }
                this.currPointers.push(pointer);
            }
            
        }

		const gui = new dat.GUI();
		var guiElement = gui.domElement;
		this.auto = false;
		guiElement.style.position = 'absolute';  // 절대 위치 설정
		guiElement.style.top = '0';          // 원하는 상단 위치
		guiElement.style.right = '0';   
		guiElement.style.margin = '0';
		gui.add( this, 'auto' )
		.onChange( ()=> {
            if(this.auto){
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
            else{
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
		} );
        this.pointerNum = 4;
        gui.add( this, 'pointerNum',1,5 ).step(1).name("pointer number")
		.onChange( ()=> {
            
            if(this.auto){
               setAuto();
            }
		} );

        
    }

    setBackground(){
        const background = new PIXI.Graphics()
        
        background.lineStyle(0);
        background.beginFill(1);

        background.drawRect(0, 0, window.innerWidth, window.innerHeight);
        
        this.app.stage.addChild(background);
        
    }
    setTicker() {
        
        let counter = 0;
        const period = 10;
        this.currCircles = [];
        const circleContainer = new PIXI.Container()
        this.app.stage.addChild(circleContainer)




        // const edgeFilterGLSL = {
        //     vs : /*glsl*/`#version 300 es
        //     precision mediump float;
    
        //     in vec2 aVertexPosition; 
        //     in vec2 aTextureCoord;
    
        //     out vec2 vTextureCoord;

        //     uniform mat3 projectionMatrix;
    
            
    
        //     void main(void) {
    
        //         gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
        //         vTextureCoord = aTextureCoord;
                
        //     }`,
        //     fs : /*glsl*/`#version 300 es
        //     precision mediump float;
    
        //     in vec2 vTextureCoord;
        //     out vec4 fragColor;
    
    
        //     uniform sampler2D uSampler;
            
        //     float hue2rgb(float h, float p, float q)
        //     {
        //         if (h < 0.0) h += 1.0;
        //         if (h > 1.0) h -= 1.0;
            
        //         if (h < 1.0 / 6.0)
        //             return p + (q - p) * 6.0 * h;
        //         else if (h < 1.0 / 2.0)
        //             return q;
        //         else if (h < 2.0 / 3.0)
        //             return p + (q - p) * (2.0 / 3.0 - h) * 6.0;
        //         else
        //             return p;
        //     }
        //     vec3 hsl2rgb(vec3 hsl)
        //     {
        //         vec3 rgb;
        //         float h = hsl.x;
        //         float s = hsl.y;
        //         float l = hsl.z;
            
        //         float q = l < 0.5 ? l * (1.0 + s) : l + s - l * s;
        //         float p = 2.0 * l - q;
            
        //         rgb.r = hue2rgb(h + 1.0 / 3.0, p, q);
        //         rgb.g = hue2rgb(h, p, q);
        //         rgb.b = hue2rgb(h - 1.0 / 3.0, p, q);
            
        //         return rgb;
        //     }
            
    
        //     vec3 edgeDetect(){
        //         ivec2 pix = ivec2(gl_FragCoord.xy);
        //         vec4 s10 = texelFetchOffset(uSampler, pix, 0, ivec2(-2,0));
        //         vec4 s01 = texelFetchOffset(uSampler, pix, 0, ivec2(0,2));
        //         vec4 s21 = texelFetchOffset(uSampler, pix, 0, ivec2(0,-2));
        //         vec4 s12 = texelFetchOffset(uSampler, pix, 0, ivec2(2,0));
        //         if(all(equal(s10, vec4(0.0)))||all(equal(s01, vec4(0.0)))||all(equal(s21, vec4(0.0)))||all(equal(s12, vec4(0.0)))){
        //             return vec3(0.0,0.0,0.0);
        //         }
        //         if(any(notEqual(s10, s12)) || any(notEqual(s01, s21))){
        //             vec4 s = texelFetchOffset(uSampler, pix, 0, ivec2(0,0));
        //             vec3 hsl = vec3(mod(s.b * 10.0 ,1.0), 1.0, 0.7);
        //             return hsl2rgb(hsl);
        //             // return vec3(1.0,1.0,1.0);
                    
        //         }
        //         else{
        //             return vec3(0.0,0.0,0.0);
        //         }
        //     }
        //     void main(void) {
    
        //         fragColor = vec4(edgeDetect(), 1.0);
        //     }
        //     `
        // }


        const edgeFilterGLSL2 = {
            vs : /*glsl*/`
    
            attribute vec2 aVertexPosition; 
            attribute vec2 aTextureCoord; 
            uniform mat3 projectionMatrix;
            
            varying vec2 vUv;

    
            void main(void) {
    
                gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
                vUv = aTextureCoord;
                
            }`,
            fs : /*glsl*/`
    
            varying vec2 vUv;
            uniform float width;
            uniform float height;
            uniform sampler2D uSampler;

            
            // float hue2rgb(float h, float p, float q)
            // {
            //     if (h < 0.0) h += 1.0;
            //     if (h > 1.0) h -= 1.0;
            
            //     if (h < 1.0 / 6.0)
            //         return p + (q - p) * 6.0 * h;
            //     else if (h < 1.0 / 2.0)
            //         return q;
            //     else if (h < 2.0 / 3.0)
            //         return p + (q - p) * (2.0 / 3.0 - h) * 6.0;
            //     else
            //         return p;
            // }
            // vec3 hsl2rgb(vec3 hsl)
            // {
            //     vec3 rgb;
            //     float h = hsl.x;
            //     float s = hsl.y;
            //     float l = hsl.z;
            
            //     float q = l < 0.5 ? l * (1.0 + s) : l + s - l * s;
            //     float p = 2.0 * l - q;
            
            //     rgb.r = hue2rgb(h + 1.0 / 3.0, p, q);
            //     rgb.g = hue2rgb(h, p, q);
            //     rgb.b = hue2rgb(h - 1.0 / 3.0, p, q);
            
            //     return rgb;
            // }
            
    
            // vec3 edgeDetect(){


            //     vec2 size = vec2(width,height);
            //     vec4 s10 = texture2D(uSampler, vec2(gl_FragCoord.x - 2.0, gl_FragCoord.y) / size);
            //     vec4 s01 = texture2D(uSampler, vec2(gl_FragCoord.x, gl_FragCoord.y + 2.0) / size);
            //     vec4 s21 = texture2D(uSampler, vec2(gl_FragCoord.x, gl_FragCoord.y - 2.0) / size);
            //     vec4 s12 = texture2D(uSampler, vec2(gl_FragCoord.x + 2.0, gl_FragCoord.y) / size);

            //     if(any(notEqual(s10, s12)) || any(notEqual(s01, s21))){
            //         vec4 s = texture2D(uSampler, vec2(gl_FragCoord.x, gl_FragCoord.y) / size);
            //         vec3 hsl = vec3(mod(s.b * 10.0 ,1.0), 1.0, 0.7);
            //         return hsl2rgb(hsl);
                    
            //     }
            //     else{
            //         return vec3(0.0,0.0,0.0);
            //     }
            }
            void main(void) {
    
    
                gl_FragColor = vec4(1.0,1.0,0.0, 1.0);
            }
            `
        }
        const edgeFilter = new PIXI.Filter(edgeFilterGLSL2.vs, edgeFilterGLSL2.fs);
        edgeFilter.uniforms.width = window.innerWidth
        edgeFilter.uniforms.height = window.innerHeight

        
        this.hypot = Math.hypot(window.innerWidth, window.innerHeight)
        const discardCircle = () => {
            
            while(this.currCircles.length !== 0 && this.currCircles[0].radius > this.hypot){
                const circle = this.currCircles.shift();
                circle.obj.destroy()
            }
        }

        const ext = this.app.renderer.extract
        
        const makeCircle = delta => {
            counter += delta
            if (counter > period) {
                counter = 0;
                if(this.auto){
                    for(let i = 0; i < this.pointerNum / 2; i++){
                        const ran = Math.random()
                        const rani = Math.floor(ran * this.currPointers.length);
                        this.currPointers[rani].clientX = ran * window.innerWidth
                        this.currPointers[rani].clientY = Math.random() * window.innerHeight
                    }
                }
                    
                for (let pointer of this.currPointers) {
                    
                    
                    
                    
                    
                    const pixelData = ext.pixels(undefined, {
                        x : Math.floor(pointer.clientX), 
                        y : window.innerHeight - Math.floor(pointer.clientY), 
                        width : 1, 
                        height : 1})
                    
                    
                    const colorCode = (pixelData[0] << 16) + (pixelData[1] << 8) + pixelData[2]
                    
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
                circle.obj.scale.x = circle.radius/20
                circle.obj.scale.y = circle.radius/20

            }
        }


        const renderTarget = PIXI.RenderTexture.create({ width: window.innerWidth, height: window.innerHeight }); 
        let sprite =  new PIXI.Sprite(renderTarget)
        sprite.filters = [edgeFilter, new PIXI.FXAAFilter()];
        console.log(sprite.filters)
        const applyFilter = () => {
            
            
            this.app.renderer.render(this.app.stage, {renderTexture : renderTarget});
            sprite.texture = renderTarget
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
