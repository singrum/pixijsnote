
const getRandom = (min, max)=>{
    if(max === undefined){
        return Math.random() * min
    }
    return Math.random() * (max - min) + min
    
}

const getWinner = (p1,p2) => {
    if ((p1 + 1) % 3 === p2)
        return 1 //p2승
    else if (p1 === p2)
        return -1
    else
        return 0 //p1승
}
Array.prototype.pairs = function (func) {
    for (var i = 0; i < this.length - 1; i++) {
        for (var j = i; j < this.length - 1; j++) {
            func([this[i], this[j+1]]);
        }
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

        this.setBackground();
        this.setObj();
        this.setTicker();
        
    }
    setBackground(){
        const background = new PIXI.Graphics()
        
        background.lineStyle(0);
        background.beginFill(0xffffff);
        background.drawRect(0, 0, window.innerWidth, window.innerHeight);
        // background.tint = 1
        this.app.stage.addChild(background);
        this.background = background
        
    }

    setObj(){
        this.textures = {
            "0" : PIXI.Texture.from("./asset/rock.png"),
            "1" : PIXI.Texture.from("./asset/paper.png"),
            "2" : PIXI.Texture.from("./asset/scissors.png"),
        }

        const getCopy = name => PIXI.Sprite.from(this.textures[name])
        


        const canvas = new PIXI.Container()
        this.canvas = canvas
        this.app.stage.addChild(canvas);
        canvas.filterArea = new PIXI.Rectangle(0,0,innerWidth, innerHeight)

        canvas.width = innerWidth
        canvas.height = innerHeight
        
        this.app.stage.addChild(canvas)
        const objInfo = {
            "0" : {num : 30},
            "1" : {num : 30},
            "2" : {num : 30}
        }
        

        for(const [name, value] of Object.entries(objInfo)){
            for(let i = 0; i<value.num;i++){
                const obj = getCopy(name)
                obj.scale.set(0.2,0.2)
                obj.name = parseInt(name)
                obj.x = getRandom(innerWidth - 32)
                obj.y = getRandom(innerHeight - 32)
                canvas.addChild(obj)
            }
        }
        
        
        


        
        
    }

    isCollide(obj1, obj2){
        if(obj1.name === obj2.name){
            return false
        }
        const radius1 = obj1.width / 2
        const radius2 = obj2.width / 2
        const dist = Math.hypot(obj1.x - obj2.x, obj1.y - obj2.y)
        
        if(dist < radius1 + radius2){
            return true
        }
        return false


    }



    setTicker() {
        let time = 1;
        const randomWalk = (delta)=>{
            time += delta;

            for(let obj of this.canvas.children){
                let angle;

                if(obj.x < 0){
                    obj.x = 0 
                    angle = getRandom(-Math.PI / 2, Math.PI/2)
                }
                if(obj.x > innerWidth - obj.width){
                    obj.x = innerWidth - obj.width
                    angle = getRandom(Math.PI / 2, Math.PI * 1.5)
                }
                if(obj.y < 0){
                    obj.y = 0
                    angle = getRandom(Math.PI)
                }
                if(obj.y > innerHeight - obj.height){
                    obj.y = innerHeight - obj.height
                    angle = getRandom(Math.PI, Math.PI * 2)
                }
                else{
                    angle = getRandom(Math.PI * 2)
                }
                
                obj.x += Math.cos(angle) * 3 * delta
                obj.y += Math.sin(angle) * 3 * delta
            }
        }
        const collisionDetect = delta =>{
            this.canvas.children.pairs(pair => {
                const collide = this.isCollide(pair[0], pair[1])
                
                if(!collide){
                    return
                }
                const winner = getWinner(pair[0].name,pair[1].name)
                pair[1 - winner].texture = pair[winner].texture
                pair[1 - winner].name = pair[winner].name

                
            });
        }
        this.app.ticker.add(delta => {
            randomWalk(delta)
            collisionDetect(delta)
        })
    }

}

new App()
