
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
        engine.gravity.x = 0
        engine.gravity.y = 0
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
        this.render = render

        // create two boxes and a ground

        let walls = [
            Matter.Bodies.rectangle(innerWidth / 2, innerHeight + 100, innerWidth, 200, { isStatic: true }), // bottom
            Matter.Bodies.rectangle(innerWidth / 2, -100, innerWidth, 200, { isStatic: true }), // top
            Matter.Bodies.rectangle(-100, innerHeight / 2, 200, innerHeight, { isStatic: true }), // left
            Matter.Bodies.rectangle(innerWidth + 100, innerHeight / 2, 200, innerHeight, { isStatic: true })
        ]
        walls.forEach(e=>{e.restitution = 1})
        const objInfo = {
            "0": { num: 30, type: "rock" },
            "1": { num: 30, type: "paper" },
            "2": { num: 30, type: "scissors" }
        }
        this.walls = walls


        const getObj = (type, pos)=>{
            
            const obj = Matter.Bodies.circle(pos.x,pos.y, 8,
                {
                    
                    render: {
                        sprite: {
                            texture: `./asset/${objInfo[type].type}.png`,
                            xScale: 0.1,
                            yScale: 0.1,
                        }
                    }
                })
            obj.name = parseInt(type)
            obj.frictionAir = 0
            obj.restitution = 1.1
            return obj
        }
        const objs = []
        this.objs = objs
        

        for (let obj of this.objs) {
            objMap[obj.name].push(obj)
        }
        const dist = 20
        
        function setTriangle(a, b, c, num) {
            const offset = { x: innerWidth / 2 - dist * (num-1) / 2 , y: 100 }
            const result = []
            const types = [a, b, c]
            for (let i = 0; i < num; i++) {
                
                for (let j = 0; j < (num - i); j++) {
                    result.push({
                        type: types[(j + i * 2) % 3],
                        pos: {
                            x: offset.x + dist * j + dist / 2 * i,
                            y: offset.y + i * dist * Math.sqrt(0.75)
                        }
                    })
                }
            }
            return result
        }
        const triangleMap = setTriangle(0, 1, 2, 18)
    
        for (let item of triangleMap) {
            
            const obj = getObj(item.type, item.pos)
            
            
            objs.push(obj)
        }


        const shot = getObj(1,{x : innerWidth/2, y : 800})
        this.shot = shot
        
        objs.push(shot)
        


        this.run()
        this.setEvent()
        this.setInteraction()
        

        

    }
    setEvent() {

        const onCollision = () => {
            this.objs.pairs(pair => {
                const collide = Matter.Collision.collides(pair[0], pair[1])
                if (!collide) {
                    return
                }
                const winner = getWinner(pair[0].name, pair[1].name)

                if (winner === -1) {
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
    setInteraction(){
        window.addEventListener("click",e=>{
            Matter.Body.setVelocity(this.shot, { x: 0, y: -50 });
        })
    }
    run(){
        // add all of the bodies to the world
        Matter.Composite.add(this.engine.world, [...this.objs, ...this.walls]);

        // run the renderer
        Matter.Render.run(this.render);

        // create runner
        let runner = Matter.Runner.create();
        this.runner = runner
        // run the engine
        Matter.Runner.run(runner, this.engine);
    }


}

new App()
