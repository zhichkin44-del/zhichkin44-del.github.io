function e(e,t){let n=t<760;return e===`corner`?{shift:n?[.3,.44]:[.58,.18],fov:n?1.9:1.25}:{shift:n?[.06,.27]:[.36,.08],fov:n?1.05:.7}}function t(t){let n=t.getContext(`webgl`,{antialias:!1,alpha:!1,powerPreference:`high-performance`});if(!n)return;let r=n.getExtension(`WEBGL_debug_renderer_info`),i=r?String(n.getParameter(r.UNMASKED_RENDERER_WEBGL)):``;if(/swiftshader|llvmpipe|software/i.test(i))return;let a=(e,t)=>{let r=n.createShader(e);return r?(n.shaderSource(r,t),n.compileShader(r),n.getShaderParameter(r,n.COMPILE_STATUS)?r:null):null},o=a(n.VERTEX_SHADER,`attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`),s=a(n.FRAGMENT_SHADER,`precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uShift;
uniform float uFov;
uniform float uRoll;
#define RIN 2.6
#define ROUT 10.0
#define STEPS 110

float h31(vec3 p){p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}
float h21(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n2(p);p=mat2(1.6,1.2,-1.2,1.6)*p;a*=.5;}return v;}

vec3 ramp(float t){
  vec3 c=mix(vec3(.32,.07,.02),vec3(.95,.42,.13),smoothstep(0.,.45,t));
  c=mix(c,vec3(1.,.78,.5),smoothstep(.4,.75,t));
  return mix(c,vec3(1.,.97,.92),smoothstep(.72,1.,t));
}

vec3 sky(vec3 d){
  vec3 c=vec3(.004,.003,.01);
  float neb=fbm(d.xy*1.7+d.z*.6);
  float band=exp(-pow(d.y*1.6+d.x*.5-.15,2.)*2.);
  c+=mix(vec3(.18,.05,.32),vec3(.42,.1,.4),neb)*smoothstep(.45,.95,neb)*band*.5;
  vec3 g=d*260.;vec3 cell=floor(g);float s=h31(cell);
  float star=smoothstep(.9975,1.,s)*smoothstep(.5,.0,length(fract(g)-.5));
  return c+vec3(.95,.9,1.)*star*1.4;
}

vec4 disk(vec3 q,float r,vec3 dir){
  float x=(r-RIN)/(ROUT-RIN);
  float w=1.8/pow(r,1.5);
  float a=-uTime*w;
  vec2 rp=mat2(cos(a),-sin(a),sin(a),cos(a))*q.xz;
  float blobs=fbm(rp*.85);
  float rings=.5+.5*sin(r*9.+blobs*5.);
  float fine=fbm(vec2(r*6.,blobs*3.));
  float streak=mix(blobs,rings*fine*1.6,.32);
  float t=pow(clamp(1.-x,0.,1.),1.35)*(.6+.5*streak);
  vec3 orbit=normalize(vec3(-q.z,0.,q.x));
  float dop=clamp(1.+.38*dot(orbit,-dir)*sqrt(RIN/r),.55,1.45);
  float edge=smoothstep(0.,.06,x)*smoothstep(1.,.3,x);
  float alpha=clamp(edge*(.38+.6*streak),0.,.9);
  vec3 c=ramp(t)*(1.1+2.6*t*t)*dop*dop*dop;
  return vec4(c,alpha);
}

void main(){
  vec2 uv=(gl_FragCoord.xy-.5*uRes)/uRes.y-uShift;
  float cr=cos(uRoll),sr=sin(uRoll);
  uv=mat2(cr,-sr,sr,cr)*uv;
  vec3 ro=vec3(0.,1.25,-19.);
  vec3 fw=normalize(-ro);
  vec3 rt=normalize(cross(vec3(0.,1.,0.),fw));
  vec3 up=cross(fw,rt);
  vec3 v=normalize(fw+uFov*(uv.x*rt+uv.y*up));
  vec3 p=ro;
  vec3 hv=cross(p,v);float h2=dot(hv,hv);
  vec3 col=vec3(0.);float a=0.;vec3 glow=vec3(0.);
  bool lost=false;
  // Луч далеко от дыры почти не гнётся: одно пересечение с плоскостью диска вместо шагов.
  if(sqrt(h2)>ROUT+2.5){
    if(v.y<0.){
      vec3 q=p+v*(-p.y/v.y);
      float rq=length(q.xz);
      if(rq>RIN&&rq<ROUT){vec4 e=disk(q,rq,v);col=e.rgb*e.a;a=e.a;}
    }
    col+=(1.-a)*sky(v);
    col=1.-exp(-col*1.3);
    gl_FragColor=vec4(pow(col,vec3(.92))*(1.-.35*dot(uv*.8,uv*.8)),1.);
    return;
  }
  for(int i=0;i<STEPS;i++){
    float r=length(p);
    float dt=clamp(.1*r,.05,2.);
    vec3 acc=-1.5*h2*p/(r*r*r*r*r);
    v+=acc*dt;
    vec3 np=p+v*dt;
    if(p.y*np.y<0.){
      vec3 q=mix(p,np,p.y/(p.y-np.y));
      float rq=length(q.xz);
      if(rq>RIN&&rq<ROUT){vec4 e=disk(q,rq,normalize(v));col+=(1.-a)*e.rgb*e.a;a+=(1.-a)*e.a;}
    }
    float rx=length(np.xz);
    glow+=(1.-a)*dt*(.012*exp(-abs(np.y)*2.2)*smoothstep(ROUT,RIN,rx)*smoothstep(1.6,RIN,rx)*vec3(1.,.6,.3)
          +.03*exp(-pow((length(np)-1.55)*3.5,2.))*vec3(1.,.8,.6));
    p=np;
    if(length(p)<1.){lost=true;break;}
    if(length(p)>34.&&dot(p,v)>0.)break;
    if(a>.985)break;
  }
  if(!lost)col+=(1.-a)*sky(normalize(v));
  col+=glow*(lost?.35:1.);
  col=1.-exp(-col*1.3);
  col=pow(col,vec3(.92));
  float vig=1.-.35*dot(uv*.8,uv*.8);
  gl_FragColor=vec4(col*vig,1.);
}`),c=n.createProgram();if(!o||!s||!c||(n.attachShader(c,o),n.attachShader(c,s),n.linkProgram(c),!n.getProgramParameter(c,n.LINK_STATUS)))return;n.useProgram(c),n.bindBuffer(n.ARRAY_BUFFER,n.createBuffer()),n.bufferData(n.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),n.STATIC_DRAW);let l=n.getAttribLocation(c,`p`);n.enableVertexAttribArray(l),n.vertexAttribPointer(l,2,n.FLOAT,!1,0,0);let u=e=>n.getUniformLocation(c,e),d=u(`uRes`),f=u(`uTime`),p=u(`uShift`),m=u(`uFov`),h=u(`uRoll`),g=t.dataset.mode??`hero`,_=matchMedia(`(prefers-reduced-motion: reduce)`).matches,v=.5,y=e(g,innerWidth),b=()=>{let r=Math.min(devicePixelRatio||1,2),i=_?Math.min(r,1.5):r*v;t.width=Math.max(1,Math.round(innerWidth*i)),t.height=Math.max(1,Math.round(innerHeight*i)),n.viewport(0,0,t.width,t.height),y=e(g,innerWidth)},x=performance.now(),S=e=>{n.uniform2f(d,t.width,t.height),n.uniform1f(f,_?12:12+(e-x)/1e3),n.uniform2f(p,y.shift[0],y.shift[1]),n.uniform1f(m,y.fov),n.uniform1f(h,-.17),n.drawArrays(n.TRIANGLES,0,3)},C=!0,w=!1,T=0,E=0,D=0,O=e=>{if(!C||_||document.hidden)w=!1;else{if(D){let t=e-D;if(T>10&&T<70&&(E+=+(t>28)),T+=1,T===70&&E>30){if(v>.45)v=.42,T=0,E=0,b();else{_=!0,b(),S(e),w=!1;return}}}D=e,S(e),requestAnimationFrame(O)}},k=()=>{w||_||(w=!0,D=0,requestAnimationFrame(O))};b(),S(performance.now()),t.classList.add(`is-live`),addEventListener(`resize`,()=>{b(),S(performance.now())}),document.addEventListener(`visibilitychange`,()=>!document.hidden&&k());let A=document.querySelector(`[data-hole-anchor]`);A&&new IntersectionObserver(([e])=>{C=e.isIntersecting,document.documentElement.classList.toggle(`hole-dim`,!C),C&&k()}).observe(A),k()}var n=document.querySelector(`canvas[data-hole]`);if(n){let e=()=>t(n);`requestIdleCallback`in window?requestIdleCallback(e,{timeout:1200}):setTimeout(e,200)}if(matchMedia(`(pointer: fine)`).matches)for(let e of document.querySelectorAll(`.case, .catalog__item, .research, .findings article`))e.addEventListener(`pointermove`,t=>{let n=e.getBoundingClientRect();e.style.setProperty(`--mx`,`${t.clientX-n.left}px`),e.style.setProperty(`--my`,`${t.clientY-n.top}px`)}),e.addEventListener(`pointerleave`,()=>{e.style.removeProperty(`--mx`),e.style.removeProperty(`--my`)});