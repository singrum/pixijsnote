const rectSample = new PIXI.Graphics()
rectSample.lineStyle(0);
rectSample.beginFill(0xffffff);
rectSample.drawCircle(0, 0, 50);
function sign(x){
    if(x >=0) return 1;
    else return -1;
}
class Circle {
    constructor(centerX, centerY, color) {


        this.obj = this.getObj()
        this.setInfo(centerX, centerY, color)

    }
    addRad(x) {
        this.radius += x;
    }
    getObj() {

        
        const outer = new PIXI.Graphics(rectSample.geometry)
        const inner = new PIXI.Graphics(rectSample.geometry)
        return [inner,outer];
    }
    setInfo(centerX, centerY, color){
        this.centerX = centerX
        this.centerY = centerY
        this.radius = 0;
        this.color = color
        this.setObjInfo()
    }
    setObjInfo(){
        this.obj[0].tint = 0xffffff
        this.obj[1].tint = this.color
        this.obj[0].x = this.centerX; this.obj[1].x = this.centerX
        this.obj[0].y = this.centerY; this.obj[1].y = this.centerY
    }
}

class App {

    constructor() {
        const renderer = new PIXI.Renderer({
            resolution: devicePixelRatio,
            powerPreference :"high-performance"
        })
        
        
        const app = new PIXI.Application({
            width: window.innerWidth, height: window.innerHeight,
            backgroundColor: 1,
            transparent: false,
            renderer : renderer,
            premultipliedAlpha : false,
            antialias: false
        });
        this.app = app;
        
        
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
        this.autoPointers = []
        const downEvent = e => {

            if ('ontouchstart' in window) {
                this.app.view.addEventListener("touchmove", moveEvent, false);
                this.currPointers = []
                for(let p of e.targetTouches){
                    this.currPointers.push(p);
                }
                
                

            }
            else {
                this.app.view.addEventListener("mousemove", moveEvent, false);
                this.currPointers = [e];
                

            }
        }
        const moveEvent = e => {
            if ('ontouchstart' in window) {
                this.currPointers = [];
                for(let p of e.targetTouches){
                    this.currPointers.push(p)
                }
                

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
                this.currPointers = temp
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
            
            this.autoPointers = [];
            
            for(let i = 0; i<this.pointerNum ; i++){
                const pointer = {
                    clientX :Math.random() * this.app.view.width,
                    clientY : Math.random() * this.app.view.height
                }
                this.autoPointers.push(pointer);
            }
            
        }

		const gui = new dat.GUI();
		var guiElement = gui.domElement;
		this.auto = false;
		guiElement.style.position = 'absolute'; 
		guiElement.style.top = '0'; 
		guiElement.style.right = '0';   
		guiElement.style.margin = '0';
		gui.add( this, 'auto' )
		.onChange( ()=> {
            if(this.auto){
               setAuto();
               

            }
            else{
                this.currPointers = [];
                this.autoPointers = [];

            };
		} ).name("Auto")
        this.pointerNum = 4;
        gui.add( this, 'pointerNum',1,20 ).step(1).name("Pointer Number")
		.onChange( ()=> {
            
            if(this.auto){
               setAuto();
            }
		} );
        this.growingSpeed = 1.5
        gui.add( this, 'growingSpeed',1, 3).step(0.1).name("Growing Speed")
        this.frequency = 1.0
        gui.add( this, 'frequency', 0.3, 1.8).step(0.1).name("Frequency")
        


        
    }

    setBackground(){
        const background = new PIXI.Graphics()
        
        background.lineStyle(0);
        background.beginFill(0xffffff);

        background.drawRect(0, 0, window.innerWidth, window.innerHeight);
        background.tint = 1
        this.app.stage.addChild(background);
        this.background = background
        
    }
    setTicker() {
        
        let counter = 0;
        const currCircles = [];
        const surplusCircleObj = [];
        const circleContainer = new PIXI.Container()
        this.app.stage.addChild(circleContainer)


        // const edgeFilterGLSL2 = {
        //     vs : /*glsl*/`
    
        //     attribute vec2 aVertexPosition; 
        //     attribute vec2 aTextureCoord; 
        //     uniform mat3 projectionMatrix;
            
        //     varying vec2 vUv;

    
        //     void main(void) {
    
        //         gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
        //         vUv = aTextureCoord;
                
        //     }`,
        //     fs : /*glsl*/`
    
        //     varying vec2 vTextureCoord;
        //     uniform float width;
        //     uniform float height;
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


        //         vec2 size = vec2(width,height);
        //         vec4 s10 = texture2D(uSampler, vec2(gl_FragCoord.x - 2.0, gl_FragCoord.y) / size);
        //         vec4 s01 = texture2D(uSampler, vec2(gl_FragCoord.x, gl_FragCoord.y + 2.0) / size);
        //         vec4 s21 = texture2D(uSampler, vec2(gl_FragCoord.x, gl_FragCoord.y - 2.0) / size);
        //         vec4 s12 = texture2D(uSampler, vec2(gl_FragCoord.x + 2.0, gl_FragCoord.y) / size);
        //         vec4 s = texture2D(uSampler, vec2(gl_FragCoord.x, gl_FragCoord.y) / size);
        //         if((any(notEqual(s10, s12)) || any(notEqual(s01, s21)))){
                    
                    
        //             vec3 hsl = vec3(mod(s.b * 4.0 ,1.0), 1.0, 0.7);
        //             return hsl2rgb(hsl);
                    
        //         }
        //         else{
                    
        //             return vec3(0.1,0.1,0.1);
                    
        //         }
        //     }
        //     void main(void) {
    
    
        //         gl_FragColor = vec4(edgeDetect(), 1.0);
        //     }
        //     `
        // }
        const edgeFilterGLSL2 = {
            fs : /*glsl*/`
    
            varying vec2 vTextureCoord;
            uniform float width;
            uniform float height;
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
            
    
            vec3 color(){
                vec2 size = vec2(width,height);
                vec4 s = texture2D(uSampler, vec2(gl_FragCoord.x, gl_FragCoord.y) / size);
                if(any(notEqual(s, vec4(1.0,1.0,1.0,1.0)))){
                    return vec3(0.1,0.1,0.1);
                }
                else{
                    return vec3(1.0,1.0,1.0);
                }
            }
            void main(void) {
    
    
                gl_FragColor = vec4(color(), 1.0);
            }
            `
        }
        const edgeFilter = new PIXI.Filter(undefined, edgeFilterGLSL2.fs);
        edgeFilter.uniforms.width = window.innerWidth
        edgeFilter.uniforms.height = window.innerHeight
        const fxaaFilter = new PIXI.FXAAFilter()
        const ext = this.app.renderer.extract
        let colorPointer = 0

        const discardCircle = () => {
            const pixels = ext.pixels()
            const len = pixels.length
            while(colorPointer < len){
                const colorCode = (pixels[colorPointer] << 16) + (pixels[colorPointer + 1] << 8) + pixels[colorPointer + 2]
                if(colorCode === this.background.tint){
                    return;
                }
                colorPointer += 4;
            }
            colorPointer = 0;
            this.background.tint++;
            let i = 0;

            // while(currCircles.length !== 0 && currCircles[0].color === this.background.tint){
            //     circleContainer.removeChildren(0,2);
            //     const circle = currCircles.shift();
            //     surplusCircleObj.push(circle)
            // }
            while(currCircles.length !== i && currCircles[i].color === this.background.tint){
                i++
            }
            circleContainer.removeChildren(0,2 * i);
            for(;i>0;i--){
                const circle = currCircles.shift();
                surplusCircleObj.push(circle)
            }
            
            
            
        }
        const getCircle = (x,y,color) => {  
            if(surplusCircleObj.length === 0){
                return new Circle(x,y,color)
            }
            else{
                const circle = surplusCircleObj.pop() 
                circle.setInfo(x,y,color)
                return circle
            }

        }
        
        
        const makeCircle = delta => {
            counter += delta
            if (counter > 10 / this.frequency) {
                counter %= 10 / this.frequency;
                if(this.auto){
                    for(let i = 0; i < this.pointerNum / 2; i++){
                        const ran = Math.random()
                        const rani = Math.floor(ran * this.autoPointers.length);
                        this.autoPointers[rani].clientX = ran * window.innerWidth
                        this.autoPointers[rani].clientY = Math.random() * window.innerHeight
                    }
                }
                    
                
                
                
                for (let pointer of this.currPointers.concat(this.autoPointers)) {
                    
                    const pixelData = ext.pixels(undefined, {
                        x : Math.floor(pointer.clientX), 
                        y : window.innerHeight - 1 - Math.floor(pointer.clientY), 
                        width : 1, 
                        height : 1})

                    
                    const colorCode = (pixelData[0] << 16) + (pixelData[1] << 8) + pixelData[2]
                    if(colorCode === 0xffffff) {
                        continue
                    }
                    const circle = getCircle(pointer.clientX, pointer.clientY, colorCode + 1);
                    
                    let i = currCircles.length
                    while(i!==0 && currCircles[i-1].color > circle.color){
                        i--;
                    }
                    let j = i;
                    while(j!==0 && currCircles[j-1].color == circle.color){
                        j--;
                    }
                    //j < i
                    //i는 circle.tint + 1인 최초의 인덱스
                    //j는 circle.tint인 최초의 인덱스
                    
                    currCircles.splice(i,0,circle)
                    circleContainer.addChildAt(circle.obj[1], i * 2)
                    circleContainer.addChildAt(circle.obj[0], j * 2)
                    // console.log(currCircles.length)                    
                    // console.log(circleContainer.children.length)
                    
                }
            }
        }

        const growCircle = delta => {
            
            for (let circle of currCircles) {
                circle.addRad(delta * this.growingSpeed);
                circle.obj[0].scale.x = circle.radius/50;circle.obj[1].scale.x = (circle.radius - 3)/50
                circle.obj[0].scale.y = circle.radius/50;circle.obj[1].scale.y = (circle.radius - 3)/50;

            }
        }

        const renderTarget = PIXI.RenderTexture.create({ width: window.innerWidth, height: window.innerHeight }); 
        let sprite =  new PIXI.Sprite(renderTarget)
        sprite.filters = [edgeFilter, fxaaFilter];
        
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
