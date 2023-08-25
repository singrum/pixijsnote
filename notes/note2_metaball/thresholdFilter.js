
const thresholdFilter = (threshold) =>{
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
            if(s.a > 0.95){
                return vec3(0.835,0.871,0.616);
            }
            else if(s.a > 0.9){
                return vec3(0.314,0.765,0.702);
            }
            else if(s.a > 0.8){
                return vec3(0.976,0.784,0.173);
            }
            else if(s.a > 0.7){
                return vec3(0.961, 0.475, 0.392);
            }
            else{
                return vec3(0.953,0.898,0.745);
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

export default thresholdFilter;