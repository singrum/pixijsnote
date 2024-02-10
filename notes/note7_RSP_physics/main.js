
const getRandom = (min, max) => {
    if (max === undefined) {
        return Math.random() * min
    }
    return Math.random() * (max - min) + min

}

const getWinner = (p1, p2) => {
    
    if ((p1 + 1) % 3 === p2)
        return 1 //p2승
    else if (p1 === p2)
        return -1
    else
        return 0 //p1승
}
Array.prototype.pairs = function (func) {
    for (let i = 0; i < this.length - 1; i++) {
        for (let j = i; j < this.length - 1; j++) {
            func([this[i], this[j + 1]]);
        }
    }
}
class App {

    constructor() {

        this.startGame()


    }
    startGame() {


        // create an engine
        let engine = Matter.Engine.create();
        this.engine = engine
        // create a renderer
        let render = Matter.Render.create({
            element: document.body,
            engine: engine,
            options: {
                width: innerWidth,
                height: innerHeight,
                wireframes: false,
                showAngleIndicator: false,
                background: 0xffffff
            }
        });

        // create two boxes and a ground

        let walls = [
            Matter.Bodies.rectangle(innerWidth / 2, innerHeight+100, innerWidth, 200, { isStatic: true }), // bottom
            Matter.Bodies.rectangle(innerWidth / 2, -100, innerWidth, 200, { isStatic: true }), // top
            Matter.Bodies.rectangle(-100, innerHeight / 2, 200, innerHeight, { isStatic: true }), // left
            Matter.Bodies.rectangle(innerWidth + 100, innerHeight / 2, 200, innerHeight, { isStatic: true })
        ]


        const objInfo = {
            "0": { num: 30, type: "rock" },
            "1": { num: 30, type: "paper" },
            "2": { num: 30, type: "scissors" }
        }


        const objs = []
        this.objs = objs
        for (const [name, value] of Object.entries(objInfo)) {
            for (let i = 0; i < value.num; i++) {
                const obj = Matter.Bodies.circle(getRandom(innerWidth - 32), getRandom(innerHeight - 32), 16,
                    {
                        render: {
                            sprite: {
                                texture: `./asset/${value.type}.png`,
                                xScale: 0.2,
                                yScale: 0.2,
                            }
                        }
                    })
                
                obj.name = parseInt(name)

                objs.push(obj)
            }
        }
        
        
        // add all of the bodies to the world
        Matter.Composite.add(engine.world, [...objs, ...walls]);

        // run the renderer
        Matter.Render.run(render);

        // create runner
        let runner = Matter.Runner.create();
        this.runner = runner
        // run the engine
        Matter.Runner.run(runner, engine);
        
        this.setOrientationControl()
        this.setEvent()
        
        
    }
    setEvent() {
        
        const onCollision = ()=>{
            this.objs.pairs(pair => {
                const collide = Matter.Collision.collides(pair[0], pair[1])
                if (!collide) {
                    return
                }
                const winner = getWinner(pair[0].name, pair[1].name)
                
                if(winner === -1){
                    return
                }
                

                pair[1 - winner].render.sprite.texture = pair[winner].render.sprite.texture
                pair[1 - winner].name = pair[winner].name
                
            });
        }
        Matter.Events.on(this.runner, 'afterTick', function () {
            onCollision()
        })
        
    }
    setOrientationControl(){
        
        window.addEventListener('deviceorientation', evt=>{
            // document.querySelector("#debug").innerText = `alpha : ${Math.round(evt.alpha)}\nbeta : ${Math.round(evt.beta)}\ngamma : ${Math.round(evt.gamma)}`
            if( ! (evt.alpha && evt.beta && evt.gamma)){
                return;
            }
            const alpha = evt.alpha * Math.PI / 180;
            const beta = evt.beta * Math.PI / 180;
            const gamma = evt.gamma * Math.PI / 180;
            // document.querySelector("#debug").innerText = `alpha : ${this.round(alpha)}\nbeta : ${this.round(beta)}\ngamma : ${this.round(gamma)}`
            const k = 2
            const gravityX = Math.cos(beta) * Math.sin(gamma) * k
            const gravityY = Math.sin(beta) * k
            const gravityZ = -Math.cos(beta) * Math.cos(gamma) * k
            this.engine.gravity.x = gravityX
            this.engine.gravity.y = gravityY
        

            
        });
    }


}

new App()
