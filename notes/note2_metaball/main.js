

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
        

        
        this.setInteraction();
        this.setBackground();
        this.setObj();
        this.setTicker();
        

        
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
        this.app.stage.addChild(canvas)
        canvas.addChild(this.circle(innerWidth / 2,innerHeight / 2,100))
        canvas.addChild(this.circle(innerWidth / 3,innerHeight / 3,100))
        
    }
    setInteraction() {


        
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
    setTicker() {}

}

new App()
