/*
 *   Stripe WebGl Gradient Animation
 *   All Credits to Stripe.com
 *   ScrollObserver functionality to disable animation when not scrolled into view has been disabled and
 *   commented out for now.
 *   https://kevinhufnagl.com
 *
 * 	 Extended behavior by adding setBassColor(primary: string, secondary?: string) and resize delay - Jordan Pinnick
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { MiniGl } from './MiniGl';

//Converting colors to proper format
function normalizeColor(hexCode) {
	return [((hexCode >> 16) & 255) / 255, ((hexCode >> 8) & 255) / 255, (255 & hexCode) / 255];
}

let resizeTimeout;
let el = undefined;
let sectionColorsHex = [];
let shaderFiles = undefined;
let vertexShader = undefined;
let sectionColors = undefined;
let conf = undefined;
let uniforms = undefined;
let t = 1253106;
let last = 0;
let width = undefined;
let height = undefined;
let xSegCount = undefined;
let ySegCount = undefined;
let mesh = undefined;
let material = undefined;
let geometry = undefined;
let minigl = undefined;
const amp = 320;
const seed = Math.round(Math.random() * 1000);
const freqX = 14e-5;
const freqY = 29e-5;
const activeColors = [1, 1, 1, 1];

const handleResize = () => {
	clearTimeout(resizeTimeout);
	resizeTimeout = setTimeout(() => {
		width = window.innerWidth;
		height = window.innerHeight;

		minigl.setSize(width, height);
		minigl.setOrthographicCamera();

		xSegCount = Math.ceil(width * conf.density[0]);
		ySegCount = Math.ceil(height * conf.density[1]);

		mesh.geometry.setTopology(xSegCount, ySegCount);
		mesh.geometry.setSize(width, height);
		mesh.material.uniforms.u_shadow_power.value = width < 600 ? 5 : 6;
	}, 100);
};

const animate = (e) => {
	if (!shouldSkipFrame(e)) {
		t += Math.min(e - last, 1e3 / 15);
		last = e;

		mesh.material.uniforms.u_time.value = t;
		minigl.render();
	}
	if (conf.playing) {
		requestAnimationFrame(animate);
	}
};

const pause = () => {
	conf.playing = false;
};

const play = () => {
	requestAnimationFrame(animate);
	conf.playing = true;
};

const initGradient = (selector, colors) => {
	el = document.querySelector(selector);
	console.log(colors);
	sectionColorsHex = [];
	sectionColorsHex = colors.slice(0, 4);
	connect();

	initGradientColors();
	initMesh();
	handleResize();
	requestAnimationFrame(animate);
	window.addEventListener('resize', handleResize);
};
const setBassColor = (primary, secondary) => {
	if (uniforms) {
		uniforms.u_baseColor.value = normalizeColor(parseInt(primary.slice(1), 16));
		if (secondary)
			uniforms.u_waveLayers.value[0].value.color.value = normalizeColor(
				parseInt(secondary.slice(1), 16)
			);
	}
};
const connect = async () => {
	shaderFiles = {
		vertex:
			'varying vec3 v_color;\n\nvoid main() {\n  float time = u_time * u_global.noiseSpeed;\n\n  vec2 noiseCoord = resolution * uvNorm * u_global.noiseFreq;\n\n  vec2 st = 1. - uvNorm.xy;\n\n  //\n  // Tilting the plane\n  //\n\n  // Front-to-back tilt\n  float tilt = resolution.y / 2.0 * uvNorm.y;\n\n  // Left-to-right angle\n  float incline = resolution.x * uvNorm.x / 2.0 * u_vertDeform.incline;\n\n  // Up-down shift to offset incline\n  float offset = resolution.x / 2.0 * u_vertDeform.incline * mix(u_vertDeform.offsetBottom, u_vertDeform.offsetTop, uv.y);\n\n  //\n  // Vertex noise\n  //\n\n  float noise = snoise(vec3(\n    noiseCoord.x * u_vertDeform.noiseFreq.x + time * u_vertDeform.noiseFlow,\n    noiseCoord.y * u_vertDeform.noiseFreq.y,\n    time * u_vertDeform.noiseSpeed + u_vertDeform.noiseSeed\n  )) * u_vertDeform.noiseAmp;\n\n  // Fade noise to zero at edges\n  noise *= 1.0 - pow(abs(uvNorm.y), 2.0);\n\n  // Clamp to 0\n  noise = max(0.0, noise);\n\n  vec3 pos = vec3(\n    position.x,\n    position.y + tilt + incline + noise - offset,\n    position.z\n  );\n\n  //\n  // Vertex color, to be passed to fragment shader\n  //\n\n  if (u_active_colors[0] == 1.) {\n    v_color = u_baseColor;\n  }\n\n  for (int i = 0; i < u_waveLayers_length; i++) {\n    if (u_active_colors[i + 1] == 1.) {\n      WaveLayers layer = u_waveLayers[i];\n\n      float noise = smoothstep(\n        layer.noiseFloor,\n        layer.noiseCeil,\n        snoise(vec3(\n          noiseCoord.x * layer.noiseFreq.x + time * layer.noiseFlow,\n          noiseCoord.y * layer.noiseFreq.y,\n          time * layer.noiseSpeed + layer.noiseSeed\n        )) / 2.0 + 0.5\n      );\n\n      v_color = blendNormal(v_color, layer.color, pow(noise, 4.));\n    }\n  }\n\n  //\n  // Finish\n  //\n\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);\n}',
		noise:
			'//\n// Description : Array and textureless GLSL 2D/3D/4D simplex\n//               noise functions.\n//      Author : Ian McEwan, Ashima Arts.\n//  Maintainer : stegu\n//     Lastmod : 20110822 (ijm)\n//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.\n//               Distributed under the MIT License. See LICENSE file.\n//               https://github.com/ashima/webgl-noise\n//               https://github.com/stegu/webgl-noise\n//\n\nvec3 mod289(vec3 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 mod289(vec4 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 permute(vec4 x) {\n    return mod289(((x*34.0)+1.0)*x);\n}\n\nvec4 taylorInvSqrt(vec4 r)\n{\n  return 1.79284291400159 - 0.85373472095314 * r;\n}\n\nfloat snoise(vec3 v)\n{\n  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;\n  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);\n\n// First corner\n  vec3 i  = floor(v + dot(v, C.yyy) );\n  vec3 x0 =   v - i + dot(i, C.xxx) ;\n\n// Other corners\n  vec3 g = step(x0.yzx, x0.xyz);\n  vec3 l = 1.0 - g;\n  vec3 i1 = min( g.xyz, l.zxy );\n  vec3 i2 = max( g.xyz, l.zxy );\n\n  //   x0 = x0 - 0.0 + 0.0 * C.xxx;\n  //   x1 = x0 - i1  + 1.0 * C.xxx;\n  //   x2 = x0 - i2  + 2.0 * C.xxx;\n  //   x3 = x0 - 1.0 + 3.0 * C.xxx;\n  vec3 x1 = x0 - i1 + C.xxx;\n  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y\n  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y\n\n// Permutations\n  i = mod289(i);\n  vec4 p = permute( permute( permute(\n            i.z + vec4(0.0, i1.z, i2.z, 1.0 ))\n          + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))\n          + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));\n\n// Gradients: 7x7 points over a square, mapped onto an octahedron.\n// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)\n  float n_ = 0.142857142857; // 1.0/7.0\n  vec3  ns = n_ * D.wyz - D.xzx;\n\n  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)\n\n  vec4 x_ = floor(j * ns.z);\n  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)\n\n  vec4 x = x_ *ns.x + ns.yyyy;\n  vec4 y = y_ *ns.x + ns.yyyy;\n  vec4 h = 1.0 - abs(x) - abs(y);\n\n  vec4 b0 = vec4( x.xy, y.xy );\n  vec4 b1 = vec4( x.zw, y.zw );\n\n  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;\n  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;\n  vec4 s0 = floor(b0)*2.0 + 1.0;\n  vec4 s1 = floor(b1)*2.0 + 1.0;\n  vec4 sh = -step(h, vec4(0.0));\n\n  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;\n  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;\n\n  vec3 p0 = vec3(a0.xy,h.x);\n  vec3 p1 = vec3(a0.zw,h.y);\n  vec3 p2 = vec3(a1.xy,h.z);\n  vec3 p3 = vec3(a1.zw,h.w);\n\n//Normalise gradients\n  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));\n  p0 *= norm.x;\n  p1 *= norm.y;\n  p2 *= norm.z;\n  p3 *= norm.w;\n\n// Mix final noise value\n  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);\n  m = m * m;\n  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),\n                                dot(p2,x2), dot(p3,x3) ) );\n}',
		blend:
			'//\n// https://github.com/jamieowen/glsl-blend\n//\n\n// Normal\n\nvec3 blendNormal(vec3 base, vec3 blend) {\n\treturn blend;\n}\n\nvec3 blendNormal(vec3 base, vec3 blend, float opacity) {\n\treturn (blendNormal(base, blend) * opacity + base * (1.0 - opacity));\n}\n\n// Screen\n\nfloat blendScreen(float base, float blend) {\n\treturn 1.0-((1.0-base)*(1.0-blend));\n}\n\nvec3 blendScreen(vec3 base, vec3 blend) {\n\treturn vec3(blendScreen(base.r,blend.r),blendScreen(base.g,blend.g),blendScreen(base.b,blend.b));\n}\n\nvec3 blendScreen(vec3 base, vec3 blend, float opacity) {\n\treturn (blendScreen(base, blend) * opacity + base * (1.0 - opacity));\n}\n\n// Multiply\n\nvec3 blendMultiply(vec3 base, vec3 blend) {\n\treturn base*blend;\n}\n\nvec3 blendMultiply(vec3 base, vec3 blend, float opacity) {\n\treturn (blendMultiply(base, blend) * opacity + base * (1.0 - opacity));\n}\n\n// Overlay\n\nfloat blendOverlay(float base, float blend) {\n\treturn base<0.5?(2.0*base*blend):(1.0-2.0*(1.0-base)*(1.0-blend));\n}\n\nvec3 blendOverlay(vec3 base, vec3 blend) {\n\treturn vec3(blendOverlay(base.r,blend.r),blendOverlay(base.g,blend.g),blendOverlay(base.b,blend.b));\n}\n\nvec3 blendOverlay(vec3 base, vec3 blend, float opacity) {\n\treturn (blendOverlay(base, blend) * opacity + base * (1.0 - opacity));\n}\n\n// Hard light\n\nvec3 blendHardLight(vec3 base, vec3 blend) {\n\treturn blendOverlay(blend,base);\n}\n\nvec3 blendHardLight(vec3 base, vec3 blend, float opacity) {\n\treturn (blendHardLight(base, blend) * opacity + base * (1.0 - opacity));\n}\n\n// Soft light\n\nfloat blendSoftLight(float base, float blend) {\n\treturn (blend<0.5)?(2.0*base*blend+base*base*(1.0-2.0*blend)):(sqrt(base)*(2.0*blend-1.0)+2.0*base*(1.0-blend));\n}\n\nvec3 blendSoftLight(vec3 base, vec3 blend) {\n\treturn vec3(blendSoftLight(base.r,blend.r),blendSoftLight(base.g,blend.g),blendSoftLight(base.b,blend.b));\n}\n\nvec3 blendSoftLight(vec3 base, vec3 blend, float opacity) {\n\treturn (blendSoftLight(base, blend) * opacity + base * (1.0 - opacity));\n}\n\n// Color dodge\n\nfloat blendColorDodge(float base, float blend) {\n\treturn (blend==1.0)?blend:min(base/(1.0-blend),1.0);\n}\n\nvec3 blendColorDodge(vec3 base, vec3 blend) {\n\treturn vec3(blendColorDodge(base.r,blend.r),blendColorDodge(base.g,blend.g),blendColorDodge(base.b,blend.b));\n}\n\nvec3 blendColorDodge(vec3 base, vec3 blend, float opacity) {\n\treturn (blendColorDodge(base, blend) * opacity + base * (1.0 - opacity));\n}\n\n// Color burn\n\nfloat blendColorBurn(float base, float blend) {\n\treturn (blend==0.0)?blend:max((1.0-((1.0-base)/blend)),0.0);\n}\n\nvec3 blendColorBurn(vec3 base, vec3 blend) {\n\treturn vec3(blendColorBurn(base.r,blend.r),blendColorBurn(base.g,blend.g),blendColorBurn(base.b,blend.b));\n}\n\nvec3 blendColorBurn(vec3 base, vec3 blend, float opacity) {\n\treturn (blendColorBurn(base, blend) * opacity + base * (1.0 - opacity));\n}\n\n// Vivid Light\n\nfloat blendVividLight(float base, float blend) {\n\treturn (blend<0.5)?blendColorBurn(base,(2.0*blend)):blendColorDodge(base,(2.0*(blend-0.5)));\n}\n\nvec3 blendVividLight(vec3 base, vec3 blend) {\n\treturn vec3(blendVividLight(base.r,blend.r),blendVividLight(base.g,blend.g),blendVividLight(base.b,blend.b));\n}\n\nvec3 blendVividLight(vec3 base, vec3 blend, float opacity) {\n\treturn (blendVividLight(base, blend) * opacity + base * (1.0 - opacity));\n}\n\n// Lighten\n\nfloat blendLighten(float base, float blend) {\n\treturn max(blend,base);\n}\n\nvec3 blendLighten(vec3 base, vec3 blend) {\n\treturn vec3(blendLighten(base.r,blend.r),blendLighten(base.g,blend.g),blendLighten(base.b,blend.b));\n}\n\nvec3 blendLighten(vec3 base, vec3 blend, float opacity) {\n\treturn (blendLighten(base, blend) * opacity + base * (1.0 - opacity));\n}\n\n// Linear burn\n\nfloat blendLinearBurn(float base, float blend) {\n\t// Note : Same implementation as BlendSubtractf\n\treturn max(base+blend-1.0,0.0);\n}\n\nvec3 blendLinearBurn(vec3 base, vec3 blend) {\n\t// Note : Same implementation as BlendSubtract\n\treturn max(base+blend-vec3(1.0),vec3(0.0));\n}\n\nvec3 blendLinearBurn(vec3 base, vec3 blend, float opacity) {\n\treturn (blendLinearBurn(base, blend) * opacity + base * (1.0 - opacity));\n}\n\n// Linear dodge\n\nfloat blendLinearDodge(float base, float blend) {\n\t// Note : Same implementation as BlendAddf\n\treturn min(base+blend,1.0);\n}\n\nvec3 blendLinearDodge(vec3 base, vec3 blend) {\n\t// Note : Same implementation as BlendAdd\n\treturn min(base+blend,vec3(1.0));\n}\n\nvec3 blendLinearDodge(vec3 base, vec3 blend, float opacity) {\n\treturn (blendLinearDodge(base, blend) * opacity + base * (1.0 - opacity));\n}\n\n// Linear light\n\nfloat blendLinearLight(float base, float blend) {\n\treturn blend<0.5?blendLinearBurn(base,(2.0*blend)):blendLinearDodge(base,(2.0*(blend-0.5)));\n}\n\nvec3 blendLinearLight(vec3 base, vec3 blend) {\n\treturn vec3(blendLinearLight(base.r,blend.r),blendLinearLight(base.g,blend.g),blendLinearLight(base.b,blend.b));\n}\n\nvec3 blendLinearLight(vec3 base, vec3 blend, float opacity) {\n\treturn (blendLinearLight(base, blend) * opacity + base * (1.0 - opacity));\n}',
		fragment:
			'varying vec3 v_color;\n\nvoid main() {\n  vec3 color = v_color;\n  if (u_darken_top == 1.0) {\n    vec2 st = gl_FragCoord.xy/resolution.xy;\n    color.g -= pow(st.y + sin(-12.0) * st.x, u_shadow_power) * 0.4;\n  }\n  gl_FragColor = vec4(color, 1.0);\n}'
	};

	conf = {
		presetName: '',
		wireframe: false,
		density: [0.06, 0.16],
		zoom: 1,
		rotation: 0,
		playing: true
	};

	if (document.querySelectorAll('canvas').length < 1) {
		console.log('DID NOT LOAD HERO STRIPE CANVAS');
	} else {
		minigl = new MiniGl(el, null, null, true);
	}
};
const disconnect = () => {
	window.removeEventListener('resize', handleResize);
};
const initMaterial = () => {
	uniforms = {
		u_time: new minigl.Uniform({
			value: 0
		}),
		u_shadow_power: new minigl.Uniform({
			value: 0
		}),
		u_darken_top: new minigl.Uniform({
			value: 0
		}),
		u_active_colors: new minigl.Uniform({
			value: activeColors,
			type: 'vec4'
		}),
		u_global: new minigl.Uniform({
			value: {
				noiseFreq: new minigl.Uniform({
					value: [freqX, freqY],
					type: 'vec2'
				}),
				noiseSpeed: new minigl.Uniform({
					value: 5e-6
				})
			},
			type: 'struct'
		}),
		u_vertDeform: new minigl.Uniform({
			value: {
				incline: new minigl.Uniform({
					value: 0
				}),
				offsetTop: new minigl.Uniform({
					value: -0.5
				}),
				offsetBottom: new minigl.Uniform({
					value: -0.5
				}),
				noiseFreq: new minigl.Uniform({
					value: [3, 4],
					type: 'vec2'
				}),
				noiseAmp: new minigl.Uniform({
					value: amp
				}),
				noiseSpeed: new minigl.Uniform({
					value: 10
				}),
				noiseFlow: new minigl.Uniform({
					value: 3
				}),
				noiseSeed: new minigl.Uniform({
					value: seed
				})
			},
			type: 'struct',
			excludeFrom: 'fragment'
		}),
		u_baseColor: new minigl.Uniform({
			value: sectionColors[0],
			type: 'vec3',
			excludeFrom: 'fragment'
		}),
		u_waveLayers: new minigl.Uniform({
			value: [],
			excludeFrom: 'fragment',
			type: 'array'
		})
	};
	for (let e = 1; e < sectionColors.length; e += 1) {
		uniforms.u_waveLayers.value.push(
			new minigl.Uniform({
				value: {
					color: new minigl.Uniform({
						value: sectionColors[e],
						type: 'vec3'
					}),
					noiseFreq: new minigl.Uniform({
						value: [2 + e / sectionColors.length, 3 + e / sectionColors.length],
						type: 'vec2'
					}),
					noiseSpeed: new minigl.Uniform({
						value: 11 + 0.3 * e
					}),
					noiseFlow: new minigl.Uniform({
						value: 6.5 + 0.3 * e
					}),
					noiseSeed: new minigl.Uniform({
						value: seed + 10 * e
					}),
					noiseFloor: new minigl.Uniform({
						value: 0.1
					}),
					noiseCeil: new minigl.Uniform({
						value: 0.63 + 0.07 * e
					})
				},
				type: 'struct'
			})
		);
	}
	vertexShader = [shaderFiles.noise, shaderFiles.blend, shaderFiles.vertex].join('\n\n');
	return new minigl.Material(vertexShader, shaderFiles.fragment, uniforms);
};

const initMesh = () => {
	material = initMaterial();
	geometry = new minigl.PlaneGeometry();
	mesh = new minigl.Mesh(geometry, material);
};

const shouldSkipFrame = (e) => window.document.hidden || !conf.playing || parseInt(e, 10) % 2 === 0;

// const updateFrequency = (e) => {
// 	freqX += e;
// 	freqY += e;
// };
// const toggleColor = (index) => {
// 	activeColors[index] = 0 === activeColors[index] ? 1 : 0;
// };

const initGradientColors = () => {
	sectionColors = sectionColorsHex.map((c) => normalizeColor(parseInt(c.slice(1), 16)));
};

export { initGradient, setBassColor, disconnect, pause, play };
