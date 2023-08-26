import equipotentialFilter from "./equipotentialFilter.js";

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
        circle.beginFill(0xffffff);
        circle.drawCircle(0, 0, 50);
        circle.x = x;
        circle.y = y;
        circle.radius = radius
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
        const points = []
        const circleNum = 20;
        for(let i = 0; i<circleNum; i++){
            const circle = this.circle(innerWidth * Math.random(), innerHeight * Math.random(),Math.random() * 0.5 + 0.3)
            circle.x = Math.random() * innerWidth;
            circle.y = Math.random() * innerHeight;
            circle.vx = Math.random() * 1;
            circle.vy = Math.random() * 1;
            canvas.addChild(circle)
            
            points.push(circle.x, circle.y, circle.radius)
        }
        
        this.equipFilter = equipotentialFilter(points, 0.03)

        canvas.filters = [
            this.equipFilter,
            new PIXI.FXAAFilter()
        ]
        


        
        
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
            time += delta;
            const points = []
            for(let circle of this.canvas.children){
                circle.x += circle.vx
                circle.y += circle.vy
                points.push(circle.x, circle.y, circle.radius)
                if(circle.x < 0){  
                    circle.vx *= -1;
                }else if(circle.x > innerWidth){
                    circle.vx *= -1;
                }
                if(circle.y < 0){
                    circle.vy *= -1;
                }else if(circle.y > innerHeight){
                    circle.vy *= -1;
                }

            }
            this.equipFilter.uniforms.points = points
        }
        this.app.ticker.add(delta => {
            moveCircles(delta)

        })
    }

}

new App()
