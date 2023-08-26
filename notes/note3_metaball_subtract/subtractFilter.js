
const subtractFilter = (threshold) =>{
    const program = {
        vs : undefined,
        fs : /*glsl*/`
        varying vec2 vTextureCoord;
        uniform sampler2D uSampler;
        uniform float threshold;
        
    
        vec3 color(){
            vec4 s = texture2D(uSampler, vTextureCoord);
            // if(s.a == 0.0){
            //     return vec3(1.0,1.0,1.0);
            // }
            if(s.r == 0.0 || s.a > 0.5){
                return vec3(0.0,0.0,0.0);
            }
            else {
                return vec3(1.0,1.0,1.0);
            }
        }
        void main(void) {
    
            gl_FragColor = vec4(color(), 1.0);
        }
        `
    }
    const filter = new PIXI.Filter(program.vs, program.fs)
    filter.uniforms.threshold = threshold
    return filter
}

export default subtractFilter;