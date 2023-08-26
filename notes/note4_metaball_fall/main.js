import thresholdFilter from "./thresholdFilter.js";


function randRange(min, max){
    return min + (max - min) * Math.random()
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
        

        
        
        // this.setBackground();
        this.setObj();
        this.setTicker();
        // this.setInteraction();
        
        

        
    }
    circle(x,y,radius){
        const circle = new PIXI.Graphics()
        circle.lineStyle(0);
        circle.beginFill(0xffffff, 0.8);
        circle.drawCircle(0, 0, 50);
        circle.x = x;
        circle.y = y;
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
            new PIXI.BlurFilter(10,undefined, undefined,15),
            thresholdFilter(),
            new PIXI.FXAAFilter()
        ]
        const circleNum = 8;
        const unitRad = innerWidth / (circleNum - 1);
        
        this.circles = [];
        for(let i = 0; i<circleNum; i++){
            const radius = randRange(unitRad, unitRad * 2)
            const circle = this.circle(0,0,1)
            circle.radius = radius
            circle.x = unitRad * i;
            circle.y = 0;
            circle.vy = 1;
            canvas.addChild(circle)
            this.circles.push(circle)
        }
        

        const fillArea = new PIXI.Graphics();
        this.fillArea = fillArea
        fillArea.lineStyle(0);
        fillArea.beginFill(0xffffff,1);
        fillArea.drawRect(0, 0, innerWidth, 1);
        fillArea.name = "fill"
        fillArea.x = 0;
        fillArea.y = 0;
        canvas.addChild(fillArea);
        console.log(canvas)

        
        
    }

    setTicker() {
        
        // noise.seed(Math.random());
        let time = 1;
        
        const moveCircles = (delta)=>{
            time += delta;
            
            for(let circle of this.circles){
                circle.scale.x = (circle.radius + Math.sin(circle.radius + time/20 ) * 20) / 50
                circle.scale.y = (circle.radius + Math.sin(circle.radius + time/20) * 20) / 50
                circle.y += circle.vy
                this.fillArea.scale.y = circle.y


            }
        }
        this.app.ticker.add(delta => {
            this.app.renderer.render(this.app.stage)
            moveCircles(delta)

        })
    }

}

new App()
