// Nathan Blair
precision highp float;

varying vec2 vPosition;

uniform float diffusion;
uniform float delay_ms;
uniform float feedback;
uniform float scatter;
uniform float time;

uniform sampler2D feedback_texture;

#define MAX_STEPS 100
#define MAX_DIST 100.
#define SURF_DIST .001
#define TAU 6.283185
#define PI 3.141592
#define S smoothstep
#define T time
#define NUM_POINTS 8.0

// void main() {
//     vec2 uv = 0.5 * vPosition.xy + 0.5;
//     vec4 color = vec4(vec3(float(uv.x < delay_ms && uv.y < scatter)), 1.0);
//     gl_FragColor = mix(color, texture2D(feedback_texture, uv), feedback);
// }

mat2 Rot(float a) {
    float s=sin(a), c=cos(a);
    return mat2(c, -s, s, c);
}

float sdBox(vec3 p, vec3 s) {
    p = abs(p)-s;
	return length(max(p, 0.))+min(max(p.x, max(p.y, p.z)), 0.);
}

float sdSphere(vec3 p, vec3 s, float r) {
    return length(p - s) - r;
}


float GetDist(vec3 p) {
    float d = 100000.0;
    for (float i = 0.0; i <= NUM_POINTS; i++) {
        for (float j = 0.0; j <= NUM_POINTS; j+= NUM_POINTS) {
            d = min(d, sdSphere(p, vec3(-2.5 + 5.0*i / NUM_POINTS, -2.5 + 5.0 * j / NUM_POINTS, 1.0), 0.05));
        }
    }
    for (float i = 0.0; i <= NUM_POINTS; i+=NUM_POINTS) {
        for (float j = 0.0; j <= NUM_POINTS; j++) {
            d = min(d, sdSphere(p, vec3(-2.5 + 5.0*i / NUM_POINTS, -2.5 + 5.0 * j / NUM_POINTS, 1.0), 0.05));
        }
    }
    
    return d;
}

float RayMarch(vec3 ro, vec3 rd) {
	float dO=0.;
    
    for(int i=0; i<MAX_STEPS; i++) {
    	vec3 p = ro + rd*dO;
        float dS = GetDist(p);
        dO += dS;
        if(dO>MAX_DIST || abs(dS)<SURF_DIST) break;
    }
    
    return dO;
}

vec3 GetNormal(vec3 p) {
    vec2 e = vec2(.001, 0);
    vec3 n = GetDist(p) - 
        vec3(GetDist(p-e.xyy), GetDist(p-e.yxy),GetDist(p-e.yyx));
    
    return normalize(n);
}

vec3 GetRayDir(vec2 uv, vec3 p, vec3 l, float z) {
    vec3 
        f = normalize(l-p),
        r = normalize(cross(vec3(0,1,0), f)),
        u = cross(f,r),
        c = f*z,
        i = c + uv.x*r + uv.y*u;
    return normalize(i);
}

void main()
{
    vec2 uv = 0.5 * vPosition + 0.5;
	vec2 m = vec2(delay_ms, scatter);

    vec3 ro = vec3(0, 0, -2);
    // ro.yz *= Rot(-m.y*PI+1.);
    // ro.xz *= Rot(-m.x*TAU);
    
    vec3 rd = GetRayDir(vPosition, ro, vec3(0,0,0), 1.);
    vec3 col = vec3(0);
   
    float d = RayMarch(ro, rd);

    if(d<MAX_DIST) {
        vec3 p = ro + rd * d;
        vec3 n = GetNormal(p);
        vec3 r = reflect(rd, n);

        float dif = dot(n, normalize(vec3(0,0,0)))*.5+.5;
        col = vec3(dif, dif, dif);
    }
    
    col = pow(col, vec3(.4545));	// gamma correction
    
    vec4 color = vec4(col,1.0);

    // float theta = asin((uv.y - 0.5) / length(vec2(0.5) - uv)) * diffusion;

    float theta = PI * diffusion / 4.0;

    vec2 rotated_position = vec2(
        vPosition.x * cos(theta) - vPosition.y * sin(theta),
        vPosition.x * sin(theta) + vPosition.y * cos(theta)
    ) * 0.5 + 0.5;

    vec2 to_center = vec2(0.5) - rotated_position;

    to_center = to_center * delay_ms * 0.1 + 0.05 * delay_ms * scatter * sin(uv.x * 111.0*TAU);

    gl_FragColor = color + texture2D(feedback_texture, uv - to_center) * feedback;
}