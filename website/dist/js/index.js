async function main(){const t=document.getElementsByClassName("controls__input");console.log(t);const e={root:document.documentElement,title:document.getElementById("overlay__title"),text:document.getElementById("overlay__text"),loadedText:"Success!",unloadedText:"Pick a location to get started",fetchingText:"Fetching, please wait...",errorText:errorText="Oops! Looks like there was an error fetching the data",state:"unloaded",set(t,e){switch(this.state=t,console.log("Set state: "+this.state),t){case"fetching":this.title.textContent=this.fetchingText,this.text.textContent="",this.root.style.setProperty("--state__fetching--opacity",.5),this.root.style.setProperty("--state__calculator--opacity",.5),this.root.style.setProperty("--state__overlay--opacity",1);break;case"loaded":this.title.textContent=this.loadedText,this.text.textContent="",this.root.style.setProperty("--state__fetching--opacity",1),this.root.style.setProperty("--state__calculator--opacity",1),this.root.style.setProperty("--state__overlay--opacity",0);break;case"error":this.title.textContent=this.errorText,this.text.textContent=e,this.root.style.setProperty("--state__fetching--opacity",1),this.root.style.setProperty("--state__calculator--opacity",.5),this.root.style.setProperty("--state__overlay--opacity",1)}}},o={button:document.getElementById("data-picker__button"),latitude:document.getElementById("data-picker__latitude"),longitude:document.getElementById("data-picker__longitude"),angle:document.getElementById("data-picker__angle")};let a={};o.button.addEventListener("click",(async t=>{e.set("fetching");const n=`api/seriescalc?lat=${o.latitude.value}&lon=${o.longitude.value}&browser=1&outputformat=json&usehorizon=1&angle=${o.angle.value}1&startyear=2005&endyear=2005`,s=await fetch(n).then((t=>t.json()));s.message?e.set("error",s.message):(a=formatData(s),h(),e.set("loaded"))}));const n=document.getElementById("chart__canvas-container"),s=document.getElementById("canvas"),l=s.getContext("2d"),r={numOfYears:{value:11},indoorT:{value:22},solar:{min:10,max:50,value:30,step:1},efficiency:{min:10,max:100,value:60,step:1},htc:{min:10,max:300,value:250,step:5},storage:{min:10,max:1e3,value:200,step:10}};for(const t of document.getElementsByClassName("controls__input"))t.min=r[t.id].min,t.max=r[t.id].max,t.step=r[t.id].step,t.value=r[t.id].default,document.getElementById("controls__"+t.id).textContent=r[t.id].value,t.addEventListener("input",(o=>{document.getElementById("controls__"+t.id).textContent=o.target.value,r[t.id].value=o.target.value,"loaded"===e.state&&h()}));const i={deficit:document.getElementById("chart__deficit"),empty:document.getElementById("chart__empty"),surplus:document.getElementById("chart__surplus"),full:document.getElementById("chart__full")},c=window.devicePixelRatio;s.style.height=n.offsetHeight+"px",s.style.width=n.offsetWidth+"px",s.width=Math.floor(n.offsetWidth*c),s.height=Math.floor(n.offsetHeight*c),l.scale(c,c);const u=n.offsetHeight-2,d=(n.offsetWidth-2)/365;function h(){l.clearRect(0,0,s.width,s.height),l.fillStyle="#4CE0D2";const t=[],e=1e3*r.storage.value;t.push(e);const o=u/r.storage.value;let n=0,c=0,h=0,m=0;for(let s=0;s<a.Energy.length;s++){const i=r.solar.value*a.Energy[s]*(r.efficiency.value/100)+Math.min(r.htc.value*(a.Temperature[s]-r.indoorT.value)*24,0)+t[s];i>e?(t.push(e),m++,h+=i-e):i<0?(t.push(0),c++,n+=i):t.push(i);const y=s%365*d,g=u-t[s+1]/1e3*o;l.fillRect(y,g,2,2)}i.surplus.textContent=Math.round(h/r.numOfYears.value/1e3),i.deficit.textContent=Math.round(n/r.numOfYears.value/-1e3),i.full.textContent=Math.round(m/r.numOfYears.value),i.empty.textContent=Math.round(c/r.numOfYears.value)}}function formatData(t){const{inputs:{meteo_data:{radiation_db:e}},outputs:{hourly:o}}=t,a=Math.round(o.length/24),n={Energy:[],Temperature:[]};for(let t=0;t<a;t++){let e=0,a=0;for(let n=24*t;n<24*(t+1);n++)e+=o[n]["G(i)"],a+=o[n].T2m;n.Energy.push(Math.round(e)),n.Temperature.push(a/24)}return n}main();