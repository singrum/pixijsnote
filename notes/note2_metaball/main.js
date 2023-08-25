import thresholdFilter from "./thresholdFilter.js";
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
        

        
        
        // this.setBackground();
        this.setObj();
        this.setTicker();
        this.setInteraction();
        
        

        
    }
    circle(x,y,radius){
        const circle = new PIXI.Graphics()
        circle.lineStyle(0);
        circle.beginFill(0xffffff);
        circle.drawCircle(0, 0, 50);
        circle.x = x;
        circle.y = y;
        circle.scale.x = radius / 50
        circle.scale.y = radius / 50
        return circle
    }
    setObj(){
        // const canvas = new PIXI.Graphics()
        // this.canvas = canvas
        // canvas.beginFill(0, 0);
        // canvas.lineStyle(0);
        // canvas.drawRect(0, 0, window.innerWidth, window.innerHeight);
        const canvas = new PIXI.Container()
        this.app.stage.addChild(canvas);
        canvas.filterArea = new PIXI.Rectangle(0,0,innerWidth, innerHeight)

        canvas.width = innerWidth
        canvas.height = innerHeight
        
        this.app.stage.addChild(canvas)
        canvas.addChild(this.circle(innerWidth / 2,innerHeight / 2,100))
        const movingCircle = this.circle(innerWidth / 2,0,100)

        canvas.addChild(movingCircle)
        this.movingCircle = movingCircle
        
        canvas.filters = [
            new PIXI.BlurFilter(10,undefined, undefined,15),
            thresholdFilter(0.95),
            // new PIXI.BlurFilter(2,undefined, undefined,)
            new PIXI.FXAAFilter()
        ]
        const circleNum = 10;
        for(let i = 0; i<circleNum; i++){
            canvas.addChild(this.circle(innerWidth * Math.random(), innerHeight * Math.random(),100 * Math.random()))
        }


        
        
    }
    setInteraction() {
        
        window.addEventListener("click",e=>{
            const ext = this.app.renderer.extract
            console.log(ext.pixels(undefined, {
                x : Math.floor(e.clientX), 
                y : window.innerHeight - 1 - Math.floor(e.clientY), 
                width : 1, 
                height : 1}))
        })


        
    }

    setBackground(){
        const background = new PIXI.Graphics()
        
        background.lineStyle(0);
        background.beginFill(0x020202);

        background.drawRect(0, 0, window.innerWidth, window.innerHeight);
        background.tint = 1
        this.app.stage.addChild(background);
        this.background = background
        
    }
    setTicker() {
        this.app.ticker.add(delta => {
            // this.app.renderer.render(this.app.stage)
            this.movingCircle.y += delta
        })
    }

}

new App()
