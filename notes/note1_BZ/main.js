const rectSample = new PIXI.Graphics()
rectSample.lineStyle(0);
rectSample.beginFill(0xffffff);
rectSample.drawCircle(0, 0, 50);
// const circleTexture =PIXI.Texture.from('circleTexture.png');
// const circleSprite = PIXI.Sprite.from('circleTexture.png');

class Circle {
    constructor(centerX, centerY, color) {
        

        this.obj = this.getObj()
        this.setInfo(centerX, centerY, color)

    }
    addRad(x) {
        this.radius += x;
    }
    getObj() {



        const obj = new PIXI.Graphics(rectSample.geometry)
        // const obj = PIXI.Sprite.from(circleTexture)
        // obj.anchor(0.5)
        return obj;
    }
    setInfo(centerX, centerY, color){
        this.centerX = centerX
        this.centerY = centerY
        this.radius = 0;
        this.color = color
        const xInCartesian = centerX - window.innerWidth / 2
        const yInCartesian = centerY - window.innerHeight / 2 
        this.totalLife = Math.hypot(xInCartesian + Math.sign(xInCartesian) * window.innerWidth / 2, yInCartesian + Math.sign(yInCartesian) * window.innerHeight / 2)
        this.setObjInfo()
    }
    setObjInfo(){
        this.obj.tint = this.color
        this.obj.x = this.centerX
        this.obj.y = this.centerY
    }
    getRemainingLife(){
        return this.totalLife - this.radius
    }
}

class App {

    constructor() {
        PIXI.settings.RESOLUTION = window.devicePixelRatio
    
        const app = new PIXI.Application({
            width: window.innerWidth, height: window.innerHeight,
            backgroundColor: 1,
            transparent: false,
            renderer : PIXI.WebGLRenderer,
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
		guiElement.style.position = 'absolute'; 
		guiElement.style.top = '0'; 
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
		} ).name("Auto")
        this.pointerNum = 4;
        gui.add( this, 'pointerNum',1,5 ).step(1).name("Pointer Number")
		.onChange( ()=> {
            
            if(this.auto){
               setAuto();
            }
		} );
        this.growingSpeed = 1.5
        gui.add( this, 'growingSpeed',1, 3).step(0.1).name("Growing Speed")
        this.frequency = 1.0
        gui.add( this, 'frequency', 0.3, 1.2).step(0.1).name("Frequency")
        


        
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
        
        const currCircles = [];
        const surplusCircleObj = [];
        const circleContainer = new PIXI.Container()
        this.app.stage.addChild(circleContainer)


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
            
    
            vec3 edgeDetect(){


                vec2 size = vec2(width,height);
                vec4 s10 = texture2D(uSampler, vec2(gl_FragCoord.x - 2.0, gl_FragCoord.y) / size);
                vec4 s01 = texture2D(uSampler, vec2(gl_FragCoord.x, gl_FragCoord.y + 2.0) / size);
                vec4 s21 = texture2D(uSampler, vec2(gl_FragCoord.x, gl_FragCoord.y - 2.0) / size);
                vec4 s12 = texture2D(uSampler, vec2(gl_FragCoord.x + 2.0, gl_FragCoord.y) / size);

                if((any(notEqual(s10, s12)) || any(notEqual(s01, s21)))){
                    
                    vec4 s = texture2D(uSampler, vec2(gl_FragCoord.x, gl_FragCoord.y) / size);
                    vec3 hsl = vec3(mod(s.b * 4.0 ,1.0), 1.0, 0.7);
                    return hsl2rgb(hsl);
                    // return vec3(1.0,1.0,1.0);
                    
                }
                else{
                    return vec3(0.0,0.0,0.0);
                }
            }
            void main(void) {
    
    
                gl_FragColor = vec4(edgeDetect(), 1.0);
            }
            `
        }
        const edgeFilter = new PIXI.Filter(undefined, edgeFilterGLSL2.fs);
        edgeFilter.uniforms.width = window.innerWidth
        edgeFilter.uniforms.height = window.innerHeight

        
        this.hypot = Math.hypot(window.innerWidth, window.innerHeight)
        const isCircleBig = circle =>{
            
            return circle.getRemainingLife() < 0
        }
        const discardCircle = () => {
            
            while(currCircles.length !== 0 && isCircleBig(currCircles[0])){
                console.log(1)
                const circle = currCircles.shift();
                circleContainer.removeChild(circle.obj);
                surplusCircleObj.push(circle)
            }
        }
        const getCircle = (x,y,color) => {  
            if(surplusCircleObj.length === 0){
                return new Circle(x,y,color)
            }
            else{
                console.log("recycle")
                const circle = surplusCircleObj.pop() 
                circle.setInfo(x,y,color)
                
                return circle
            }

        }
        
        const ext = this.app.renderer.extract
        const makeCircle = delta => {
            counter += delta
            if (counter > 10 / this.frequency) {
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
                    const circle = getCircle(pointer.clientX, pointer.clientY, colorCode + 1);
                    

                    // let i = currCircles.length
                    // while(i !== 0 && currCircles[i-1].getRemainingLife() > circle.getRemainingLife()){
                    //     i--;
                    // }
                    // currCircles.splice(i,0,circle);
                    currCircles.push(circle)
                    
                    let i = circleContainer.children.length;
                    
                    while(i!==0&& circleContainer.getChildAt(i-1).tint > circle.color){
                        i--;
                    }
                    console.log(circleContainer.children.length)
                    circleContainer.addChildAt(circle.obj, i)


                }


                
            }
        }

        const growCircle = delta => {
            for (let circle of currCircles) {
                circle.addRad(delta * this.growingSpeed);
                circle.obj.scale.x = circle.radius/50
                circle.obj.scale.y = circle.radius/50

            }
        }


        const renderTarget = PIXI.RenderTexture.create({ width: window.innerWidth, height: window.innerHeight }); 
        let sprite =  new PIXI.Sprite(renderTarget)
        sprite.filters = [edgeFilter, new PIXI.FXAAFilter()];
        
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
