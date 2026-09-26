import { spawn } from "node:child_process";
const [,, url, width, sel, out, extra] = process.argv;
const B = "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser";
const port = 9333 + Math.floor(Math.random()*500);
const p = spawn(B, ["--headless=new","--disable-gpu","--hide-scrollbars",`--remote-debugging-port=${port}`,`--user-data-dir=/tmp/brave-shot-${port}`,"--force-prefers-reduced-motion","about:blank"], {stdio:"ignore"});
const sleep = ms => new Promise(r=>setTimeout(r,ms));
let target;
for (let i=0;i<50;i++){ try{ const l=await (await fetch(`http://127.0.0.1:${port}/json`)).json(); target=l.find(t=>t.type==="page"); if(target) break;}catch{} await sleep(200); }
const ws = new WebSocket(target.webSocketDebuggerUrl); await new Promise(r=>ws.onopen=r);
let id=0; const pend=new Map(); ws.onmessage=e=>{const m=JSON.parse(e.data); if(m.id&&pend.has(m.id)){pend.get(m.id)(m); pend.delete(m.id);} };
const send=(method,params={})=>new Promise(r=>{const i=++id; pend.set(i,r); ws.send(JSON.stringify({id:i,method,params}));});
await send("Emulation.setDeviceMetricsOverride",{width:+width,height:900,deviceScaleFactor:1,mobile:+width<500});
await send("Page.enable"); await send("Page.navigate",{url}); await sleep(5000);
const r = await send("Runtime.evaluate",{returnByValue:true,expression:`(()=>{const e=document.querySelector(${JSON.stringify(sel)}); e.scrollIntoView(); const b=e.getBoundingClientRect(); return {x:0,y:b.top+scrollY,w:document.documentElement.clientWidth,h:b.height, sw:document.documentElement.scrollWidth}})()`});
await sleep(1500);
const v=r.result.result.value; console.log(JSON.stringify(v));
const s = await send("Page.captureScreenshot",{format:"png",captureBeyondViewport:true,clip:{x:0,y:v.y,width:v.w,height:Math.min(v.h, +(extra||v.h)),scale:1}});
(await import("node:fs")).writeFileSync(out, Buffer.from(s.result.data,"base64"));
ws.close(); p.kill();
