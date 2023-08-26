
const grainyMetaballFilter = (threshold) =>{
    const program = {
        vs : undefined,
        fs : /*glsl*/`
        varying vec2 vTextureCoord;
        uniform sampler2D uSampler;
        uniform float threshold;

        float rand(vec2 co) {
            return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
        }


        vec3 grain(vec3 color1, vec3 color2, float strength){
            float ran = rand(vTextureCoord.xy);
            vec3 co = mix(color1, color2, ran * strength);
            return co;
            
        }
    
        vec3 color(){
            vec4 s = texture2D(uSampler, vTextureCoord);
            vec3 color = vec3(0.929,0.949,0.957);
            if(s.a == 0.0){
                return color;
            }
            else{
                return grain(color, vec3(0.937,0.137,0.235),s.a);
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

export default grainyMetaballFilter;