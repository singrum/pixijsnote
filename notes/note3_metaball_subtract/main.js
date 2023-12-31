import subtractFilter from "./subtractFilter.js";
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
        circle.beginFill(0xffffff,0.5);
        circle.drawCircle(0, 0, 50);
        circle.x = x;
        circle.y = y;
        circle.scale.x = radius / 50
        circle.scale.y = radius / 50
        return circle
    }
    setObj(){
        const canvas = new PIXI.Container()
        this.canvas = canvas
        this.app.stage.addChild(canvas);
        canvas.filterArea = new PIXI.Rectangle(0,0,innerWidth, innerHeight)

        canvas.width = innerWidth
        canvas.height = innerHeight
        
        this.app.stage.addChild(canvas)
        
        canvas.filters = [
            subtractFilter(),
            new PIXI.BlurFilter(10,undefined, undefined,15),
            thresholdFilter(0.95),
            // new PIXI.FXAAFilter()
        ]
        // const circleNum = 20;
        // for(let i = 0; i<circleNum; i++){
        //     const circle = this.circle(innerWidth * Math.random(), innerHeight * Math.random(),100 * Math.random())
        //     circle.x = Math.random() * innerWidth;
        //     circle.y = Math.random() * innerHeight;
        //     circle.vx = Math.random() * 2;
        //     circle.vy = Math.random() * 2;
        //     canvas.addChild(circle)
        // }
        this.circle1 = this.circle(innerWidth * Math.random(), innerHeight * Math.random(),100)
        this.circle2 = this.circle(innerWidth * Math.random(), innerHeight * Math.random(),100)
        this.circle1.x = innerWidth / 2
        this.circle2.x = innerWidth / 2
        this.circle1.y = 0
        this.circle2.y = innerHeight
        canvas.addChild(this.circle1, this.circle2)
        
        
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
        
        // noise.seed(Math.random());
        let time = 1;
        
        const moveCircles = (delta)=>{
            time += delta / 10;

            this.circle1.y += delta
            this.circle2.y -= delta
            
        }
        this.app.ticker.add(delta => {
            moveCircles(delta)

        })
    }

}

new App()
