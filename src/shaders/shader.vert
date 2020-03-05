
attribute vec3 aPositionStart;
attribute vec3 aControlPointOne;
attribute vec3 aControlPointTwo;
attribute vec3 aPositionEnd;
attribute float aOffset;

uniform float time;
uniform float PI;
uniform float duration;
uniform float rainbow;

attribute vec3 aColor; 
varying vec3 vColor;

float easeInOutSin(float t){

    return (1.0 + sin(PI * t - PI / 2.0)) / 2.0;
    
}

vec4 quatFromAxisAngle(vec3 axis, float angle) {

    float halfAngle = angle * 0.5;
    return vec4(axis.xyz * sin(halfAngle), cos(halfAngle));

}

vec3 rotateVector(vec4 q, vec3 v) {

    return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v);

}

vec3 bezier4(vec3 a, vec3 b, vec3 c, vec3 d, float t) {

    return mix(mix(mix(a, b, t), mix(b, c, t), t), mix(mix(b, c, t), mix(c, d, t), t), t);

}

void main(){

    float tProgress = easeInOutSin(min(1.0, max(0.0, (time - aOffset)) / duration));

    vec4 quatX = quatFromAxisAngle(vec3(1.0, 0.0, 0.0), -5.0 * tProgress);
    vec4 quatY = quatFromAxisAngle(vec3(0.0, 1.0, 0.0), -5.0 * tProgress);

    vec3 basePosition = rotateVector(quatX, rotateVector(quatY, position));
    vec3 newPosition = bezier4(aPositionStart, aControlPointOne, aControlPointTwo, aPositionEnd, tProgress);

    float scale = tProgress * 2.0 - 1.0;

    scale = 1.0 - scale * scale;
    basePosition *= scale;
    gl_Position = basePosition + newPosition;

    if (rainbow > 0.5) vColor = aColor;

}