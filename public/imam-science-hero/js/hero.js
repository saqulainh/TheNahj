/* Imam & Science. — the home hero painting, alive.
   The painting (green cloth on books, a waterfall into a pool, sunlight) keeps its composition.
   Layers prepared from the original artwork:
     hero-scene    the painting itself (also the still image that shows first)
     hero-patches  small pieces of rebuilt background that remove the painted floating leaves
     hero-mask     R = waterfall, G = pool surface, B = light rays (soft masks traced from the painting)
     hero-leaves   the painting's own leaves, cut out, plus soft-focus copies for leaves near the camera
   WebGL moves only the masked parts: the water flows down its own path (flow-map, faster as it falls),
   the pool's surface drifts outward from the plunge with ripples and glints, the light rays breathe.
   A 2D layer over the whole hero drifts leaves and dust (also across the dark left side, where CSS sunbeams sway).
   Without WebGL, with reduced motion, or before the layers arrive, the still painting shows. */
(function () {
	"use strict";
	var d = document, box = d.querySelector("[data-scene]");
	if (!box || box.getAttribute("data-scene-on")) return;
	box.setAttribute("data-scene-on", "1");
	var rm = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)");
	if (rm && rm.matches) return;

	var stage = box.closest(".orbit") || box.parentNode;
	var still = box.querySelector(".orbit__img"), cg = box.querySelector("[data-scene-gl]"), cf = stage.querySelector("[data-scene-fx]");
	if (!still || !cg || !cf) return;
	var gl = cg.getContext("webgl", { alpha: false, antialias: false, premultipliedAlpha: false, powerPreference: "low-power" }) ||
		cg.getContext("experimental-webgl");
	var cx = cf.getContext("2d");
	if (!gl || !cx) return;

	var me = d.currentScript && d.currentScript.src || "/imam-science-hero/js/hero.js";
	var IMG = "/imam-science-hero/img/";
	var VQ = me.indexOf("?") > -1 ? me.slice(me.indexOf("?")) : "";   /* images change between versions: never reuse an old cached copy */
	var IW = 1312, IH = 1199;
	var small = Math.min(screen.width || 9999, screen.height || 9999) < 820;
	var TAU = Math.PI * 2, rnd = Math.random;

	/* ------------------------------------------------------------------ WebGL: water, pool, light */
	var VS = "attribute vec2 a;varying vec2 v;void main(){v=a;gl_Position=vec4(a*2.-1.,0.,1.);v.y=1.-a.y;}";
	var FS = [
		"precision highp float;",
		"uniform sampler2D uImg,uMask;uniform vec2 uSize,uView;uniform vec4 uMap;uniform float uT;varying vec2 v;",
		"float h1(vec2 p){p=mod(p,289.);return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}",
		"float nz(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);",
		" return mix(mix(h1(i),h1(i+vec2(1,0)),f.x),mix(h1(i+vec2(0,1)),h1(i+vec2(1,1)),f.x),f.y);}",
		"vec3 tex(vec2 p){return texture2D(uImg,clamp(p,vec2(.5),uSize-.5)/uSize).rgb;}",
		"void main(){",
		" vec2 p=(v*uView)*uMap.zw+uMap.xy;",
		" vec4 m=texture2D(uMask,p/uSize);",
		" vec3 col=tex(p);",
		" float t=uT;",
		/* ---- waterfall: the painted water travels down its own path, faster as it falls */
		" if(m.r>.003){",
		"  float yN=clamp((p.y-340.)/670.,0.,1.);",
		"  float top=smoothstep(342.,440.,p.y);",
		"  float fl=446.7*log(.55+1.5*yN)-t*120.;",               // position along the fall, in the water's travel time
		"  float edge=smoothstep(.0,.75,m.r);",
		"  float wob=nz(vec2(p.x*.075,fl*.016))-.5;",
		"  vec2 dir=normalize(vec2(-.38*(1.-top),1.));",
		"  float L=(28.+60.*yN)*mix(.5,1.,top);",                  // distance each layer slides before it fades
		"  float n0=nz(p*vec2(.02,.008))*.9;",      // fine-grained offsets: layers never fade in step
		"  float c=t*1.9;",
		/* three layers of the painted water slide down, each fading out before it wraps (weights sin^2, always summing to 1.5) */
		"  float a0=fract(c+n0),a1=fract(c+n0+1./3.),a2=fract(c+n0+2./3.);",
		"  float s0=sin(3.14159*a0),s1=sin(3.14159*a1),s2=sin(3.14159*a2);",
		"  vec3 wt=vec3(s0*s0,s1*s1,s2*s2)/1.5;",
		"  float foam=smoothstep(870.,995.,p.y)*edge;",
		"  vec2 jit=(vec2(nz(p*.06+vec2(t*1.6,0.)),nz(p*.06-vec2(0.,t*1.8)))-.5)*2.5*foam;",
		"  vec2 wx=vec2(wob*2.6,0.)*edge+jit;",
		"  vec2 D=dir*L*smoothstep(.3,1.,m.r);",                  // edges of the fall stay put against the books
		"  vec3 w=tex(p-D*(a0-.5)+wx)*wt.x+tex(p-D*(a1-.5)+wx)*wt.y+tex(p-D*(a2-.5)+wx)*wt.z;",
		"  vec3 mu=(tex(p+vec2(0.,-9.))+tex(p+vec2(0.,9.))+tex(p+vec2(-5.,0.))+tex(p+vec2(5.,0.)))*.25;",
		"  w=mu+(w-mu)*mix(1.,min(1.45,inversesqrt(dot(wt,wt))),edge);",  // blending layers softens detail: restore the painting's crispness
		/* broad sheets of water sliding down (accelerating), soft highlights riding the strands */
		"  float sheet=nz(vec2(p.x*.018,fl*.0065))-.5;",
		"  w*=1.+sheet*.16*edge;",
		"  float s=nz(vec2(p.x*.16+wob*1.6,fl*.01));",
		"  float fil=smoothstep(.62,.95,s)*smoothstep(.3,.85,nz(vec2(p.x*.42,fl*.035)));",
		"  w+=vec3(.6,.85,1.)*fil*.2*edge*(1.-.5*(1.-top));",
		"  w+=vec3(.85,.95,1.)*foam*.12*(nz(p*.09+vec2(0.,t*2.4))-.35);",
		"  col=mix(col,w,clamp(m.r,0.,1.));",
		" }",
		/* ---- pool: the surface drifts outward from the plunge, rings spread, glints dance */
		" if(m.g>.003){",
		"  vec2 c0=vec2(838.,1012.);",
		"  vec2 q=(p-c0)*vec2(1.,3.3);",
		"  float r=length(q),an=atan(q.y,q.x);",
		"  vec2 nr=q/max(r,1.);",
		"  vec2 od=normalize(p-c0+vec2(0.,.01))*vec2(1.,.4);",
		"  float near=exp(-r*.004);",
		"  float irr=.55+.45*nz(vec2(an*2.6,t*.35));",
		"  float att=exp(-r*.0026)*smoothstep(8.,50.,r)*irr;",
		"  float ph=r*.07-t*4.2,ph2=r*.115-t*6.+1.7;",
		"  float hgt=sin(ph)*att+.5*sin(ph2)*att*att;",
		"  vec2 g=nr*(cos(ph)*att+.6*cos(ph2)*att*att);",
		"  vec2 sw=vec2(nz(p*vec2(.022,.075)+vec2(t*.55,0.)),nz(p*vec2(.022,.075)+vec2(9.,-t*.45)))-.5;",
		"  vec2 rip=g*vec2(10.,3.8)+sw*vec2(8.,3.4);",
		"  float cp=t*1.7,k0=nz(p*.02);",
		"  float b0=fract(cp+k0),b1=fract(cp+k0+.5),wb=1.-abs(1.-2.*b0);",
		"  float Lp=26.*(.45+.55*near);",
		"  vec3 pc=mix(tex(p+(rip-od*Lp*(b1-.5))*m.g),tex(p+(rip-od*Lp*(b0-.5))*m.g),wb);",
		"  pc+=vec3(.82,.93,1.)*exp(-r*.016)*.26*smoothstep(.45,.9,nz(p*vec2(.08,.22)+vec2(0.,t*2.6)));", // churn under the fall
		"  pc+=vec3(1.,.9,.7)*pow(max(hgt,0.),3.)*.34;",
		"  pc+=vec3(.8,.92,1.)*pow(nz(p*vec2(.06,.2)+vec2(t*.5,t*.15)),8.)*.45;",
		"  col=mix(col,pc,m.g);",
		" }",
		/* ---- sunlight in the painting: the rays slowly breathe */
		" if(m.b>.003){",
		"  vec2 o=p-vec2(330.,-560.);",
		"  float an=atan(o.x,o.y);",
		"  float f=nz(vec2(an*26.,t*.16))*.6+nz(vec2(an*8.,t*.09+5.))*.4;",
		"  col*=1.+m.b*(f-.5)*.3;",
		"  col+=m.b*vec3(1.,.78,.45)*.025*(sin(t*.35)+1.);",
		" }",
		" gl_FragColor=vec4(col,1.);",
		"}"
	].join("\n");

	function sh(type, src) {
		var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
		return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
	}
	var vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS);
	if (!vs || !fs) return;
	var pr = gl.createProgram(); gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr);
	if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
	gl.useProgram(pr);
	gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]), gl.STATIC_DRAW);
	var aL = gl.getAttribLocation(pr, "a"); gl.enableVertexAttribArray(aL); gl.vertexAttribPointer(aL, 2, gl.FLOAT, false, 0, 0);
	var U = {}; ["uImg", "uMask", "uSize", "uView", "uMap", "uT"].forEach(function (n) { U[n] = gl.getUniformLocation(pr, n); });
	gl.uniform1i(U.uImg, 0); gl.uniform1i(U.uMask, 1); gl.uniform2f(U.uSize, IW, IH);
	function texture(unit, src) {
		var t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, src);
		[gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER].forEach(function (k) { gl.texParameteri(gl.TEXTURE_2D, k, gl.LINEAR); });
		[gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach(function (k) { gl.texParameteri(gl.TEXTURE_2D, k, gl.CLAMP_TO_EDGE); });
	}

	/* ------------------------------------------------------------------ Layout: follow the still image exactly */
	var cw = 0, chh = 0, gdpr = 1, fdpr = 1, SW = 0, SH = 0;
	var map = { s: 1, ox: 0, oy: 0 }, im2css = { s: 1, x: 0, y: 0 };
	function pct(v, free) { v = (v || "").trim(); if (/%$/.test(v)) return parseFloat(v) / 100 * free; if (/px$/.test(v)) return parseFloat(v); return free / 2; }
	function layout() {
		var w = still.offsetWidth, h = still.offsetHeight; if (!w || !h) return false;
		cg.style.left = still.offsetLeft + "px"; cg.style.top = still.offsetTop + "px"; cg.style.width = w + "px"; cg.style.height = h + "px";
		var dp = window.devicePixelRatio || 1;
		/* keep the shader's pixel count modest: sharp on screens that need it, never heavy */
		gdpr = Math.min(dp, small ? 1.0 : 1.25, Math.sqrt((small ? 3.5e5 : 9.0e5) / (w * h)));
		cw = Math.max(1, Math.round(w * gdpr)); chh = Math.max(1, Math.round(h * gdpr));
		if (cg.width !== cw || cg.height !== chh) { cg.width = cw; cg.height = chh; }
		var s = Math.max(cw / IW, chh / IH), dw = IW * s, dh = IH * s;
		var pos = (getComputedStyle(still).objectPosition || "50% 50%").split(/\s+/);
		var px = pct(pos[0], cw - dw), py = pct(pos[1] || "50%", chh - dh);
		map = { s: s, ox: px, oy: py };
		gl.viewport(0, 0, cw, chh);
		gl.uniform2f(U.uView, cw, chh);
		gl.uniform4f(U.uMap, -px / s, -py / s, 1 / s, 1 / s);
		/* the effects layer spans the whole hero */
		SW = stage.clientWidth; SH = stage.clientHeight;
		fdpr = Math.min(dp, small ? 1.0 : 1.25);
		var fw = Math.round(SW * fdpr), fh = Math.round(SH * fdpr);
		if (cf.width !== fw || cf.height !== fh) { cf.width = fw; cf.height = fh; }
		var sr = stage.getBoundingClientRect(), ir = still.getBoundingClientRect();
		im2css = { s: s / gdpr, x: ir.left - sr.left + px / gdpr, y: ir.top - sr.top + py / gdpr };
		return true;
	}
	function ix(x) { return im2css.x + x * im2css.s; }
	function iy(y) { return im2css.y + y * im2css.s; }

	/* ------------------------------------------------------------------ Leaves, dust and spray (2D, whole hero) */
	var SPR = { a: [2, 2, 61, 39], b: [67, 2, 42, 47], c: [113, 2, 53, 61], d: [170, 2, 52, 44], e: [226, 2, 113, 84], f: [343, 2, 68, 71],
		g: [415, 2, 47, 28], h: [466, 2, 106, 92], fB: [576, 2, 77, 79], hB: [657, 2, 116, 101], dB: [777, 2, 58, 49] };
	var FAR = ["a", "b", "c", "d", "g", "f"], MID = ["f", "h", "c", "a", "d"], NEAR = ["fB", "hB", "e", "dB"];
	/* the CSS sunbeams on the left (same numbers as .orbit__beams in site.css): left edge %, width px */
	var BEAMS = [[4, 90], [15, 150], [27, 70], [36, 120], [47, 80]], TILT = Math.tan(24 * Math.PI / 180);
	/* left edge of the falling water (painting y, x): where droplets break away */
	var EDGE = [[470, 837], [490, 831], [510, 823], [530, 806], [550, 768], [570, 795], [590, 785], [610, 793], [630, 786], [650, 781], [670, 767], [690, 765], [710, 758], [730, 749], [750, 679], [770, 736], [790, 730], [810, 696], [830, 701], [850, 713], [870, 699], [890, 702], [910, 699], [930, 696], [950, 681], [970, 682]];
	var atlas = null, rays = null, RW = 82, RH = 75, leaves = [], dust = [], drops = [];
	function rayAt(x, y) {   /* x, y in hero pixels: brightness of the light there (beams on the left, painted rays on the right) */
		var b = 0;
		for (var i = 0; i < BEAMS.length; i++) {
			var cxb = BEAMS[i][0] / 100 * SW + BEAMS[i][1] / 2 + y * TILT, dd = (x - cxb) / (BEAMS[i][1] * .6);
			var d2 = dd * dd;
			if (d2 < 5.5) b += Math.exp(-d2);
		}
		b *= Math.max(0, 1 - y / SH * 1.1) * Math.max(0, Math.min(1, (SW * .75 - x) / (SW * .25)));
		if (rays) { var u = (x - im2css.x) / im2css.s, v = (y - im2css.y) / im2css.s; if (u >= 0 && v >= 0 && u < IW && v < IH) b += rays[(v / IH * RH | 0) * RW + (u / IW * RW | 0)] / 255; }
		return Math.min(1, b);
	}
	function newLeaf(first) {
		var z = rnd(), near = z > .9 && !leaves.some(function (l) { return l.near; });
		var set = near ? NEAR : z > .55 ? MID : FAR;
		var left = rnd() < .42;   /* a few drift down the dark left side too */
		var L = {
			k: set[rnd() * set.length | 0], near: near, z: near ? 1 : .35 + z * .55,
			x: left ? SW * (.02 + rnd() * .5) : SW * (.5 + rnd() * .55),
			y: first ? rnd() * SH * .7 : -60 - rnd() * 220,
			sway: 14 + rnd() * 30, sw: .55 + rnd() * .55, ph: rnd() * TAU, flip: .35 + rnd() * .6, fph: rnd() * TAU,
			rot: (rnd() - .5) * 1.4, spin: (rnd() - .5) * .5, wind: 4 + rnd() * 12, t: 0, fadeIn: first ? 0 : 1
		};
		L.fall = (22 + rnd() * 18) * (.6 + .7 * L.z) * (near ? 1.5 : 1);
		L.scale = (near ? 1.2 + rnd() * .3 : .55 + L.z * .55) * Math.max(.45, im2css.s);
		if (!first && rnd() < .25) { var fromL = rnd() < .5; L.x = fromL ? -50 : SW + 50; L.y = rnd() * SH * .4; L.wind = fromL ? 20 + rnd() * 14 : -(18 + rnd() * 12); }
		L.x0 = L.x;
		return L;
	}
	function initFx() {
		leaves = []; for (var i = 0; i < (small ? 4 : 7); i++) leaves.push(newLeaf(true));
		dust = []; for (var j = 0; j < (small ? 28 : 56); j++) dust.push({ x: rnd() * SW, y: rnd() * SH, r: .5 + rnd() * 1.1, vx: (rnd() - .5) * 3, vy: -.6 - rnd() * 2.2, ph: rnd() * TAU, tw: .5 + rnd() * 1.5 });
		drops = [];
	}
	function drawFx(dt, t) {
		cx.setTransform(1, 0, 0, 1, 0, 0); cx.clearRect(0, 0, cf.width, cf.height);
		cx.setTransform(fdpr, 0, 0, fdpr, par.x * fdpr, par.y * fdpr);
		cx.globalCompositeOperation = "lighter"; cx.fillStyle = "#ffd896";
		for (var i = 0; i < dust.length; i++) {
			var p = dust[i];
			p.x += (p.vx + Math.sin(t * .3 + p.ph) * 2.5) * dt; p.y += p.vy * dt;
			if (p.y < -6) { p.y = SH + 4; p.x = rnd() * SW; } if (p.x < -6) p.x = SW + 4; else if (p.x > SW + 6) p.x = -4;
			var a = (.12 + .88 * rayAt(p.x, p.y)) * (.55 + .45 * Math.sin(t * p.tw + p.ph));
			if (a < .03) continue;
			cx.globalAlpha = a * .7; cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, TAU); cx.fill();
		}
		/* droplets: thrown off the edge of the fall where it pours over the books, flying in arcs under gravity
		   into the pool (a tiny ring where each lands), plus spray kicked up at the plunge. Painting coordinates. */
		cx.globalCompositeOperation = "source-over";
		var rate = small ? 10 : 18;
		if (drops.length < 70 && rnd() < dt * rate) { var e = EDGE[rnd() * EDGE.length | 0];
			drops.push({ x: e[1] - 1 - rnd() * 4, y: e[0] + rnd() * 18, vx: -(45 + rnd() * 150), vy: -10 + rnd() * 80, r: 1.1 + rnd() * 1.9, life: 0, kind: 0 }); }
		if (drops.length < 70 && rnd() < dt * rate * .6) drops.push({ x: 700 + rnd() * 250, y: 998 + rnd() * 8, vx: (rnd() - .55) * 90, vy: -(70 + rnd() * 120), r: .7 + rnd() * 1.3, life: 0, kind: 0 });
		var S = im2css.s;
		cx.lineCap = "round";
		for (var k = drops.length - 1; k >= 0; k--) {
			var q = drops[k]; q.life += dt;
			if (q.kind) {   /* landing ring */
				var f = q.life / .5; if (f >= 1) { drops.splice(k, 1); continue; }
				cx.globalAlpha = .35 * (1 - f); cx.strokeStyle = "#e6f6ff"; cx.lineWidth = Math.max(.6, .8 * S);
				cx.beginPath(); cx.ellipse(ix(q.x), iy(q.y), (2 + f * 14) * S, (.7 + f * 4.2) * S, 0, 0, TAU); cx.stroke(); continue;
			}
			q.vy += 980 * dt; q.vx *= 1 - .25 * dt; q.x += q.vx * dt; q.y += q.vy * dt;
			if (q.y > 1004 && q.vy > 0) { if (rnd() < .5) drops.push({ x: q.x, y: q.y + rnd() * 30, life: 0, kind: 1 }); drops.splice(k, 1); continue; }
			var a = Math.min(1, q.life * 12), x1 = ix(q.x), y1 = iy(q.y), x0 = ix(q.x - q.vx * .022), y0 = iy(q.y - q.vy * .022);
			cx.globalAlpha = .55 * a; cx.strokeStyle = "#c8ecff"; cx.lineWidth = Math.max(.7, q.r * S);
			cx.beginPath(); cx.moveTo(x0, y0); cx.lineTo(x1, y1); cx.stroke();          /* motion-blurred body */
			cx.globalAlpha = .85 * a; cx.fillStyle = "#ffffff";
			cx.beginPath(); cx.arc(x1, y1, Math.max(.45, q.r * S * .45), 0, TAU); cx.fill();   /* bright glint */
		}
		cx.globalCompositeOperation = "source-over";
		if (atlas) for (var j = 0; j < leaves.length; j++) {
			var L = leaves[j]; L.t += dt;
			L.y += L.fall * (1 + .25 * Math.sin(L.t * L.sw * 2 + L.ph)) * dt;
			L.x0 += L.wind * dt;
			var sway = Math.sin(L.t * L.sw + L.ph);
			L.x = L.x0 + sway * L.sway;
			var flip = Math.cos(L.t * L.flip + L.fph);
			var ang = L.rot + L.spin * L.t + Math.cos(L.t * L.sw + L.ph) * .55;
			var fadeOut = Math.max(0, Math.min(1, (SH * .97 - L.y) / (SH * .22)));
			L.fadeIn = Math.min(1, L.fadeIn + dt * .8);
			var r = SPR[L.k], sc = L.scale;
			cx.save(); cx.translate(L.x, L.y); cx.rotate(ang); cx.scale(sc * (flip < 0 ? -1 : 1) * (.34 + .66 * Math.abs(flip)), sc);
			cx.globalAlpha = fadeOut * L.fadeIn * (L.near ? .88 : .95) * (.78 + .22 * Math.abs(flip));
			cx.drawImage(atlas, r[0], r[1], r[2], r[3], -r[2] / 2, -r[3] / 2, r[2], r[3]);
			cx.restore();
			if ((fadeOut <= 0 && L.y > 0) || L.x0 > SW + 200 || L.x0 < -200) leaves[j] = newLeaf(false);
		}
		cx.globalAlpha = 1;
	}

	/* ------------------------------------------------------------------ Loop */
	var run = false, raf = 0, last = 0, T = 0, onScreen = true, par = { x: 0, y: 0, tx: 0, ty: 0 };
	function frame(now) {
		raf = 0; if (!run) return;
		var dt = Math.min(.05, (now - (last || now)) / 1000); last = now; T += dt; if (T > 3000) T -= 3000;
		par.x += (par.tx - par.x) * .05; par.y += (par.ty - par.y) * .05;
		gl.uniform1f(U.uT, T); gl.drawArrays(gl.TRIANGLES, 0, 6);
		drawFx(dt, T);
		raf = requestAnimationFrame(frame);
	}
	function play() {
		var want = onScreen && d.visibilityState !== "hidden";
		if (want && !run) { run = true; last = 0; raf = requestAnimationFrame(frame); }
		else if (!want && run) { run = false; if (raf) cancelAnimationFrame(raf); raf = 0; }
	}
	function load(src) { return new Promise(function (res, rej) { var i = new Image(); i.decoding = "async"; i.onload = function () { res(i); }; i.onerror = rej; i.src = IMG + src + VQ; }); }
	function ready(img) { return img.complete && img.naturalWidth ? Promise.resolve(img) : new Promise(function (res, rej) { img.addEventListener("load", function () { res(img); }, { once: true }); img.addEventListener("error", rej, { once: true }); }); }
	/* rebuilt background pieces: [atlas x, y, w, h, painting x, y] */
	var PATCH = [[0, 0, 97, 66, 647, 26], [99, 0, 75, 76, 221, 150], [176, 0, 87, 93, 792, 188], [265, 0, 94, 84, 464, 246], [361, 0, 139, 105, 57, 410],
		[502, 0, 341, 429, 463, 511], [845, 0, 56, 75, 0, 613], [903, 0, 69, 47, 301, 724], [974, 0, 129, 178, 1183, 785]];
	function start() {
		Promise.all([ready(still), load("hero-patches.webp"), load("hero-mask.webp"), load("hero-leaves.webp")]).then(function (L) {
			/* the painting without its floating leaves = the still image + the patches */
			var base = d.createElement("canvas"); base.width = IW; base.height = IH;
			var b = base.getContext("2d"); b.drawImage(L[0], 0, 0, IW, IH);
			PATCH.forEach(function (q) { b.drawImage(L[1], q[0], q[1], q[2], q[3], q[4], q[5], q[2], q[3]); });
			texture(0, base); texture(1, L[2]); atlas = L[3];
			base.width = base.height = 0;
			var c = d.createElement("canvas"); c.width = RW; c.height = RH; var x = c.getContext("2d"); x.drawImage(L[2], 0, 0, RW, RH);
			var px = x.getImageData(0, 0, RW, RH).data; rays = new Uint8Array(RW * RH); for (var i = 0; i < RW * RH; i++) rays[i] = px[i * 4 + 2];
			if (!layout()) return;
			initFx();
			gl.uniform1f(U.uT, 0); gl.drawArrays(gl.TRIANGLES, 0, 6);
			box.classList.add("is-live"); stage.classList.add("is-live");
			if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { onScreen = es[0].isIntersecting; play(); }, { rootMargin: "60px" }).observe(stage);
			d.addEventListener("visibilitychange", play);
			var rto; window.addEventListener("resize", function () { clearTimeout(rto); rto = setTimeout(function () { layout(); initFx(); if (!run) gl.drawArrays(gl.TRIANGLES, 0, 6); }, 120); });
			if (window.matchMedia && matchMedia("(pointer: fine)").matches) {
				var ticking = false;
				stage.addEventListener("pointermove", function (e) {
					if (ticking) return;
					ticking = true;
					requestAnimationFrame(function () {
						var r = stage.getBoundingClientRect();
						par.tx = ((e.clientX - r.left) / r.width - .5) * -8;
						par.ty = ((e.clientY - r.top) / r.height - .5) * -6;
						ticking = false;
					});
				}, { passive: true });
			}
			if (rm && rm.addEventListener) rm.addEventListener("change", function () { if (rm.matches) { onScreen = false; play(); box.classList.remove("is-live"); stage.classList.remove("is-live"); } });
			play();
		}).catch(function () {});
	}
	cg.addEventListener("webglcontextlost", function (e) { e.preventDefault(); run = false; box.classList.remove("is-live"); stage.classList.remove("is-live"); });
	/* start after the page has settled, so the still painting and the text paint first */
	var go = function () { if (window.requestIdleCallback) requestIdleCallback(start, { timeout: 1500 }); else setTimeout(start, 200); };
	if (d.readyState === "complete") go(); else window.addEventListener("load", go);
})();
