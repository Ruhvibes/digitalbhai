/* ============ DIGITAL BHAI — dashboard app logic (screenshot style) ============ */
(function(){
"use strict";
function $(id){ return document.getElementById(id); }
function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }
function toast(msg){ var t=$("toast"); t.textContent=msg; t.classList.remove("hidden"); clearTimeout(t._tm); t._tm=setTimeout(function(){t.classList.add("hidden");},2200); }
function todayStr(){ var d=new Date(); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
function fmtDate(ds){ if(!ds) return "-"; var p=ds.split("-"); return p[2]+"/"+p[1]+"/"+p[0]; }
function rs(n){ return "₹"+Number(n||0).toLocaleString("en-IN"); }

/* ---------- STORAGE ---------- */
function load(k,fb){ try{ var v=localStorage.getItem(k); return v?JSON.parse(v):fb; }catch(e){ return fb; } }
function save(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){} }

/* ---------- SERVICES (18, screenshot jaisi) ---------- */
var SERVICES=[
 {id:"caste",hi:"जाति प्रमाण पत्र",en:"Caste Certificate",cat:"government",icon:"🏠",cls:"c-orange"},
 {id:"residence",hi:"आवास प्रमाण पत्र",en:"Residence Certificate",cat:"government",icon:"🏡",cls:"c-green"},
 {id:"income",hi:"आय प्रमाण पत्र",en:"Income Certificate",cat:"government",icon:"💰",cls:"c-pink"},
 {id:"ews",hi:"EWS प्रमाण पत्र",en:"EWS Certificate",cat:"certificates",icon:"📋",cls:"c-blue"},
 {id:"domicile",hi:"निवास प्रमाण पत्र",en:"Domicile Certificate",cat:"certificates",icon:"📜",cls:"c-purple"},
 {id:"pension",hi:"पेंशन योजना",en:"Pension Services",cat:"government",icon:"👴",cls:"c-green"},
 {id:"nsp",hi:"NSP Scholarship",en:"Form Apply",cat:"scholarship",icon:"🎓",cls:"c-pink"},
 {id:"job",hi:"Job Apply",en:"All Govt & Private Jobs",cat:"jobs",icon:"💼",cls:"c-orange"},
 {id:"admit",hi:"Admit Card",en:"Download",cat:"admit",icon:"🎫",cls:"c-pink"},
 {id:"result",hi:"Result",en:"Check & Download",cat:"admit",icon:"📊",cls:"c-pink"},
 {id:"college",hi:"College Admission",en:"Online Form",cat:"education",icon:"🏫",cls:"c-orange"},
 {id:"panaadhaar",hi:"PAN / Aadhaar",en:"Support",cat:"documents",icon:"🪪",cls:"c-blue"},
 {id:"print",hi:"Print / Scan",en:"B&W / Colour",cat:"print",icon:"🖨️",cls:"c-teal"},
 {id:"pdf",hi:"PDF Tools",en:"Merge, Compress",cat:"documents",icon:"📑",cls:"c-blue"},
 {id:"photo",hi:"Photo & Signature",en:"Resize & Edit",cat:"documents",icon:"📷",cls:"c-blue"},
 {id:"typing",hi:"Typing Work",en:"Hindi / English",cat:"other",icon:"⌨️",cls:"c-pink"},
 {id:"resume",hi:"Resume",en:"Professional CV",cat:"other",icon:"📝",cls:"c-purple"},
 {id:"other",hi:"Other Services",en:"View All →",cat:"other",icon:"➕",cls:"c-green"}
];
function svcName(id){ var s=SERVICES.find(function(x){return x.id===id;}); return s?(s.hi+" / "+s.en):id; }

/* ---------- PORTALS ---------- */
var PORTALS=[
 {n:"RTPS Bihar",icon:"🏛️",url:"https://rtps.bihar.gov.in"},
 {n:"NSP Scholarship",icon:"🎓",url:"https://scholarships.gov.in"},
 {n:"Naukri.net",icon:"💼",url:"https://www.naukri.com"},
 {n:"Sarkari Result",icon:"📢",url:"https://sarkariresult.com"},
 {n:"BSEB",icon:"🏫",url:"https://biharboardonline.bihar.gov.in"},
 {n:"UDISE+",icon:"📊",url:"https://udiseplus.gov.in"},
 {n:"Digilocker",icon:"🗂️",url:"https://digilocker.gov.in"},
 {n:"Aadhaar",icon:"🪪",url:"https://uidai.gov.in"},
 {n:"Income Tax",icon:"💰",url:"https://incometax.gov.in"},
 {n:"EPFO",icon:"🏢",url:"https://epfindia.gov.in"},
 {n:"PM Kisan",icon:"🌾",url:"https://pmkisan.gov.in"},
 {n:"Ayushman",icon:"🏥",url:"https://beneficiary.nha.gov.in"}
];
/* ---------- ONLINE SERVICES (CSC jaisa — sab kuchh online) ---------- */
var ONLINE_SERVICES=[
 {cat:"🪪 पहचान पत्र", items:[
  {n:"Aadhaar Download",d:"आधार कार्ड डाउनलोड करें",icon:"🪪",url:"https://myaadhaar.uidai.gov.in/genricDownloadAadhaar"},
  {n:"Aadhaar Update",d:"पता/मोबाइल अपडेट",icon:"✏️",url:"https://myaadhaar.uidai.gov.in/"},
  {n:"PAN Card Apply",d:"नया पैन कार्ड आवेदन",icon:"💳",url:"https://www.onlineservices.nsdl.com/paam/endUserRegisterContact.html"},
  {n:"Voter ID",d:"वोटर कार्ड आवेदन/सुधार",icon:"🗳️",url:"https://voters.eci.gov.in/"},
  {n:"Passport Seva",d:"पासपोर्ट आवेदन",icon:"🛂",url:"https://www.passportindia.gov.in/"}
 ]},
 {cat:"💡 बिल व यात्रा", items:[
  {n:"Bijli Bill (Bihar)",d:"बिजली बिल भुगतान",icon:"💡",url:"https://www.nbpdcl.co.in/"},
  {n:"Railway Ticket",d:"IRCTC ट्रेन टिकट",icon:"🚂",url:"https://www.irctc.co.in/"},
  {n:"UMANG",d:"सभी सरकारी सेवाएं",icon:"📱",url:"https://web.umang.gov.in/"}
 ]},
 {cat:"🏛️ CSC व सरकारी", items:[
  {n:"CSC Registration",d:"CSC ID ke liye apply karein",icon:"📝",url:"https://register.csc.gov.in/"},
  {n:"DigiLocker",d:"डिजिटल दस्तावेज़",icon:"🗂️",url:"https://www.digilocker.gov.in/"},
  {n:"RTPS Bihar",d:"जाति/आय/निवास प्रमाण",icon:"📜",url:"https://rtps.bihar.gov.in/"}
 ]}
];
function openUrl(u){ try{ if(window.Android&&typeof Android.openUrl==="function"){Android.openUrl(u);return;} }catch(e){} window.open(u,"_blank"); }

/* ---------- SEED ---------- */
function seed(){
  if(load("db_seeded",false)) return;
  var t=todayStr();
  save("db_customers",[
    {id:1,name:"Rahul Kumar",mobile:"9876543210",address:"Patna",created:t},
    {id:2,name:"Pooja Kumari",mobile:"9123456789",address:"Gaya",created:t},
    {id:3,name:"Amit Singh",mobile:"8987654321",address:"Muzaffarpur",created:t},
    {id:4,name:"Neha Kumari",mobile:"9876123456",address:"Darbhanga",created:t}
  ]);
  save("db_works",[
    {id:"DB-1025",cust:1,svc:"nsp",amt:150,paid:0,status:"Processing",note:"",date:t},
    {id:"DB-1026",cust:2,svc:"caste",amt:100,paid:100,status:"Completed",note:"",date:t},
    {id:"DB-1027",cust:3,svc:"job",amt:200,paid:0,status:"Pending",note:"Documents awaited",date:t},
    {id:"DB-1028",cust:4,svc:"income",amt:120,paid:0,status:"Processing",note:"",date:t},
    {id:"DB-1029",cust:1,svc:"admit",amt:50,paid:50,status:"Completed",note:"",date:t},
    {id:"DB-1030",cust:4,svc:"other",amt:300,paid:0,status:"Action Required",note:"Awas Yojana — verification pending",date:t}
  ]);
  save("db_payments",[
    {id:1,date:t,cust:2,work:"DB-1026",amt:100,note:"Caste certificate"},
    {id:2,date:t,cust:1,work:"DB-1029",amt:50,note:"Admit card"}
  ]);
  save("db_staff",[{id:1,name:"Ravi Kumar",mobile:"9812345678",role:"Operator"}]);
  save("db_settings",{shop:"Digital Bhai",owner:"Admin",mobile:"",address:"Bihar",
    anns:[
      {t:"कृपया सभी ग्राहक अपने दस्तावेज़ समय पर जमा करें।",d:"08 Oct 2026"},
      {t:"NSP Scholarship form last date: 31 Oct 2026",d:"07 Oct 2026"},
      {t:"New Service: PAN Card Correction & Update — अब PAN सुधार भी उपलब्ध है।",d:"05 Oct 2026"}
    ]});
  save("db_seq",1031);
  save("db_seeded",true);
}
function customers(){ return load("db_customers",[]); }
function works(){ return load("db_works",[]); }
function payments(){ return load("db_payments",[]); }
function settings(){ return load("db_settings",{shop:"Digital Bhai",owner:"Admin",mobile:"",address:"",anns:[]}); }
function custName(id){ var c=customers().find(function(x){return x.id===id;}); return c?c.name:"-"; }
function custById(id){ return customers().find(function(x){return x.id===id;}); }

/* ---------- CLOCK ---------- */
function clock(){
  var d=new Date(),days=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
      mon=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  var h=d.getHours(),ap=h>=12?"PM":"AM";h=h%12||12;
  $("top-date").textContent="Today "+String(d.getDate()).padStart(2,"0")+" "+mon[d.getMonth()]+" "+d.getFullYear();
  $("top-time").textContent=String(h).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0")+" "+ap+" "+days[d.getDay()];
}

/* ---------- NAV ---------- */
function showView(v){
  document.querySelectorAll(".view").forEach(function(x){x.classList.remove("active");});
  var el=$("v-"+v); if(el) el.classList.add("active");
  document.querySelectorAll(".sn-item").forEach(function(b){b.classList.toggle("active",b.getAttribute("data-view")===v||b.getAttribute("data-view")==="dashboard"&&v==="dashboard");});
  closeSide();
  $("main").scrollTop=0; window.scrollTo(0,0);
  if(v==="dashboard") renderDashboard();
  if(v==="customers") renderCustomers();
  if(v==="works") renderWorks();
  if(v==="payments") renderPayments();
  if(v==="reports") renderReports();
  if(v==="online") renderOnline();
  if(v==="staff") renderStaff();
  if(v==="settings") renderSettings();
}
function openSide(){ $("sidebar").classList.add("open"); $("side-overlay").classList.remove("hidden"); }
function closeSide(){ $("sidebar").classList.remove("open"); $("side-overlay").classList.add("hidden"); }

/* ---------- DASHBOARD ---------- */
var svcCat="all", workFilter="all", workFilter2="all";
function renderDashboard(){
  var cs=customers(), ws=works(), ps=payments(), t=todayStr();
  var todayCust=new Set(ws.filter(function(w){return w.date===t;}).map(function(w){return w.cust;})).size;
  var proc=ws.filter(function(w){return w.status==="Processing";}).length;
  var comp=ws.filter(function(w){return w.status==="Completed";}).length;
  var act=ws.filter(function(w){return w.status==="Action Required";}).length;
  var coll=ps.filter(function(p){return p.date===t;}).reduce(function(s,p){return s+Number(p.amt||0);},0);
  $("st-customers").textContent=todayCust; $("st-works").textContent=ws.length;
  $("st-processing").textContent=proc; $("st-completed").textContent=comp;
  $("st-action").textContent=act; $("st-collection").textContent=rs(coll);
  $("bell-badge").textContent=act>0?act:0;
  renderSvcGrid(); renderDashWorks(); renderFollowups(); renderRecentCust(); renderPortals(); renderAnns();
}
function renderSvcGrid(){
  var q=($("svc-search").value||"").toLowerCase();
  var g=$("svc-grid"); g.innerHTML="";
  SERVICES.filter(function(s){
    if(svcCat!=="all"&&s.cat!==svcCat) return false;
    if(q&&(s.hi+" "+s.en).toLowerCase().indexOf(q)<0) return false;
    return true;
  }).forEach(function(s){
    var b=document.createElement("button");
    b.className="svc-card "+s.cls;
    b.innerHTML='<span class="se">'+s.icon+'</span><b>'+esc(s.hi)+'</b><small>'+esc(s.en)+'</small>';
    b.onclick=function(){ openWorkForm(s.id); };
    g.appendChild(b);
  });
  if(!g.children.length) g.innerHTML='<p class="muted">कोई सेवा नहीं मिली।</p>';
}
function stBadge(st){ return '<span class="st st-'+st.replace(/ /g,"")+'">'+st+'</span>'; }
function renderDashWorks(){
  var ws=works().slice().reverse();
  var f=workFilter;
  var list=ws.filter(function(w){return f==="all"||w.status===f;}).slice(0,8);
  $("c-all").textContent=ws.length;
  $("c-proc").textContent=ws.filter(function(w){return w.status==="Processing";}).length;
  $("c-comp").textContent=ws.filter(function(w){return w.status==="Completed";}).length;
  $("c-pend").textContent=ws.filter(function(w){return w.status==="Pending";}).length;
  var tb=$("dash-work-tbl").querySelector("tbody"); tb.innerHTML="";
  list.forEach(function(w,i){
    var tr=document.createElement("tr");
    tr.innerHTML="<td>"+(i+1)+'</td><td class="wid">'+w.id+"</td><td>"+esc(custName(w.cust))+"</td><td>"+esc(svcName(w.svc))+"</td><td>"+stBadge(w.status)+'</td><td><button class="rowbtn" title="View">👁️</button></td>';
    tr.querySelector(".rowbtn").onclick=function(){ openDetail(w.id); };
    tb.appendChild(tr);
  });
  if(!list.length) tb.innerHTML='<tr><td colspan="6" class="muted">कोई काम नहीं।</td></tr>';
}
function renderFollowups(){
  var d=$("followups"); d.innerHTML="";
  var list=works().filter(function(w){return w.status==="Pending"||w.status==="Action Required";}).slice(0,4);
  list.forEach(function(w){
    var c=custById(w.cust);
    var tag=w.status==="Action Required"?"Action Required":(w.note||"Follow up");
    var div=document.createElement("div"); div.className="fu";
    div.innerHTML='<span class="av">👤</span><div><b>'+esc(custName(w.cust))+'</b><small>'+esc(svcName(w.svc))+'</small></div><span class="tag">'+esc(tag)+'</span>';
    d.appendChild(div);
  });
  if(!list.length) d.innerHTML='<p class="muted">कोई follow-up नहीं।</p>';
}
function renderRecentCust(){
  var tb=$("recent-cust-tbl").querySelector("tbody"); tb.innerHTML="";
  customers().slice(-4).reverse().forEach(function(c){
    var n=works().filter(function(w){return w.cust===c.id;}).length;
    var last=works().filter(function(w){return w.cust===c.id;}).map(function(w){return w.date;}).sort().pop();
    var tr=document.createElement("tr");
    tr.innerHTML="<td>"+esc(c.name)+"</td><td>"+esc(c.mobile)+"</td><td>"+n+"</td><td>"+fmtDate(last)+'</td><td><button class="rowbtn">👁️</button></td>';
    tr.querySelector(".rowbtn").onclick=function(){ openCustHistory(c.id); };
    tb.appendChild(tr);
  });
}
function renderPortals(){
  var g=$("portal-grid"); g.innerHTML="";
  PORTALS.forEach(function(p){
    var b=document.createElement("button"); b.className="portal";
    b.innerHTML='<span class="pe">'+p.icon+'</span><span>'+esc(p.n)+'</span>';
    b.onclick=function(){ openUrl(p.url); };
    g.appendChild(b);
  });
}
function renderAnns(){
  var d=$("announcements"); d.innerHTML="";
  (settings().anns||[]).slice(0,3).forEach(function(a){
    var div=document.createElement("div"); div.className="ann";
    div.innerHTML="<b>📢 "+esc(a.t)+"</b><small>"+esc(a.d)+"</small>";
    d.appendChild(div);
  });
}

/* ---------- CUSTOMERS ---------- */
var custQ="";
function renderCustomers(){
  var tb=$("cust-tbl").querySelector("tbody"); tb.innerHTML="";
  customers().filter(function(c){
    if(!custQ) return true;
    return (c.name+" "+c.mobile).toLowerCase().indexOf(custQ)>=0;
  }).forEach(function(c,i){
    var n=works().filter(function(w){return w.cust===c.id;}).length;
    var tr=document.createElement("tr");
    tr.innerHTML="<td>"+(i+1)+"</td><td>"+esc(c.name)+"</td><td>"+esc(c.mobile)+"</td><td>"+esc(c.address||"-")+"</td><td>"+n+'</td><td><button class="rowbtn" title="History">👁️</button> <button class="rowbtn" title="New work">＋</button></td>';
    var btns=tr.querySelectorAll(".rowbtn");
    btns[0].onclick=function(){ openCustHistory(c.id); };
    btns[1].onclick=function(){ openWorkForm(null,c.id); };
    tb.appendChild(tr);
  });
}
function openCustHistory(id){
  var c=custById(id); if(!c) return;
  var ws=works().filter(function(w){return w.cust===id;}).reverse();
  var html='<dl class="kv"><dt>नाम</dt><dd>'+esc(c.name)+'</dd><dt>मोबाइल</dt><dd>'+esc(c.mobile)+'</dd><dt>पता</dt><dd>'+esc(c.address||"-")+'</dd></dl>';
  html+='<h3 style="margin-bottom:8px">Work History ('+ws.length+')</h3><div class="table-wrap"><table class="tbl"><thead><tr><th>Work ID</th><th>Service</th><th>Status</th></tr></thead><tbody>';
  ws.forEach(function(w){ html+='<tr><td class="wid">'+w.id+"</td><td>"+esc(svcName(w.svc))+"</td><td>"+stBadge(w.status)+"</td></tr>"; });
  html+="</tbody></table></div>";
  $("md-id").textContent=""; $("md-body").innerHTML=html;
  $("md-pay").style.display="none"; $("md-status").style.display="none";
  openModal("m-detail");
  $("md-pay").style.display=""; $("md-status").style.display="";
}

/* ---------- WORKS ---------- */
function renderWorks(){
  var tb=$("work-tbl").querySelector("tbody"); tb.innerHTML="";
  works().slice().reverse().filter(function(w){return workFilter2==="all"||w.status===workFilter2;}).forEach(function(w,i){
    var tr=document.createElement("tr");
    tr.innerHTML="<td>"+(i+1)+'</td><td class="wid">'+w.id+"</td><td>"+esc(custName(w.cust))+"</td><td>"+esc(svcName(w.svc))+"</td><td>"+rs(w.amt)+"</td><td>"+stBadge(w.status)+"</td><td>"+fmtDate(w.date)+'</td><td><button class="rowbtn">👁️</button></td>';
    tr.querySelector(".rowbtn").onclick=function(){ openDetail(w.id); };
    tb.appendChild(tr);
  });
}
function openDetail(wid){
  var w=works().find(function(x){return x.id===wid;}); if(!w) return;
  var paid=Number(w.paid||0), due=Number(w.amt||0)-paid;
  $("md-id").textContent=wid;
  $("md-body").innerHTML='<dl class="kv"><dt>ग्राहक</dt><dd>'+esc(custName(w.cust))+'</dd><dt>सेवा</dt><dd>'+esc(svcName(w.svc))+'</dd><dt>राशि</dt><dd>'+rs(w.amt)+'</dd><dt>जमा</dt><dd>'+rs(paid)+'</dd><dt>बकाया</dt><dd>'+rs(Math.max(0,due))+'</dd><dt>स्थिति</dt><dd>'+stBadge(w.status)+'</dd><dt>तारीख</dt><dd>'+fmtDate(w.date)+'</dd><dt>नोट</dt><dd>'+esc(w.note||"-")+'</dd></dl>';
  $("md-pay").onclick=function(){ closeModals(); openPayForm(wid); };
  $("md-status").onclick=function(){
    var order=["Processing","Pending","Action Required","Completed"];
    var nx=order[(order.indexOf(w.status)+1)%order.length];
    w.status=nx; save("db_works",works()); openDetail(wid); renderDashboard(); renderWorks(); renderPayments();
    toast("Status: "+nx);
  };
  openModal("m-detail");
}

/* ---------- PAYMENTS ---------- */
function renderPayments(){
  var ps=payments().slice().reverse(), t=todayStr();
  var today=ps.filter(function(p){return p.date===t;}).reduce(function(s,p){return s+Number(p.amt||0);},0);
  var total=ps.reduce(function(s,p){return s+Number(p.amt||0);},0);
  var due=works().reduce(function(s,w){return s+Math.max(0,Number(w.amt||0)-Number(w.paid||0));},0);
  $("pay-today").textContent=rs(today); $("pay-total").textContent=rs(total); $("pay-due").textContent=rs(due);
  var tb=$("pay-tbl").querySelector("tbody"); tb.innerHTML="";
  ps.slice(0,20).forEach(function(p,i){
    var tr=document.createElement("tr");
    tr.innerHTML="<td>"+(i+1)+"</td><td>"+fmtDate(p.date)+"</td><td>"+esc(custName(p.cust))+'</td><td class="wid">'+p.work+"</td><td>"+rs(p.amt)+"</td><td>"+esc(p.note||"-")+"</td>";
    tb.appendChild(tr);
  });
  var tb2=$("due-tbl").querySelector("tbody"); tb2.innerHTML="";
  works().filter(function(w){return Number(w.amt||0)-Number(w.paid||0)>0;}).forEach(function(w){
    var d=Number(w.amt)-Number(w.paid||0);
    var tr=document.createElement("tr");
    tr.innerHTML='<td class="wid">'+w.id+"</td><td>"+esc(custName(w.cust))+"</td><td>"+esc(svcName(w.svc))+"</td><td>"+rs(w.amt)+"</td><td>"+rs(w.paid)+"</td><td><b>"+rs(d)+'</b></td><td><button class="rowbtn">💰 लें</button></td>';
    tr.querySelector(".rowbtn").onclick=function(){ openPayForm(w.id); };
    tb2.appendChild(tr);
  });
  if(!tb2.children.length) tb2.innerHTML='<tr><td colspan="7" class="muted">कोई बकाया नहीं।</td></tr>';
}

/* ---------- REPORTS ---------- */
function renderReports(){
  var ws=works(), ps=payments();
  var m=todayStr().slice(0,7);
  var mw=ws.filter(function(w){return (w.date||"").slice(0,7)===m;});
  var mc=ps.filter(function(p){return (p.date||"").slice(0,7)===m;}).reduce(function(s,p){return s+Number(p.amt||0);},0);
  $("report-stats").innerHTML=
    '<div class="stat"><span class="st-ic blue">🧾</span><div><b>'+mw.length+'</b><small>इस महीने के काम</small></div></div>'+
    '<div class="stat money"><span class="st-ic yellow">₹</span><div><b>'+rs(mc)+'</b><small>इस महीने का कलेक्शन</small></div></div>'+
    '<div class="stat"><span class="st-ic green">👥</span><div><b>'+customers().length+'</b><small>कुल ग्राहक</small></div></div>';
  var bySvc={};
  ws.forEach(function(w){ var k=svcName(w.svc); bySvc[k]=bySvc[k]||{n:0,amt:0}; bySvc[k].n++; bySvc[k].amt+=Number(w.paid||0); });
  var tb=$("report-tbl").querySelector("tbody"); tb.innerHTML="";
  Object.keys(bySvc).sort().forEach(function(k){
    var tr=document.createElement("tr");
    tr.innerHTML="<td>"+esc(k)+"</td><td>"+bySvc[k].n+"</td><td>"+rs(bySvc[k].amt)+"</td>";
    tb.appendChild(tr);
  });
}
/* ---------- ONLINE SERVICES (CSC jaisa) ---------- */
function renderOnline(){
  var box=$("online-list"); box.innerHTML="";
  ONLINE_SERVICES.forEach(function(sec){
    var h=document.createElement("h4"); h.className="os-cat"; h.textContent=sec.cat; box.appendChild(h);
    var grid=document.createElement("div"); grid.className="os-grid";
    sec.items.forEach(function(s){
      var b=document.createElement("button"); b.className="os-card";
      b.innerHTML="<span class='os-icon'>"+s.icon+"</span><span class='os-n'>"+esc(s.n)+"</span><span class='os-d'>"+esc(s.d)+"</span>";
      b.onclick=function(){ openUrl(s.url); };
      grid.appendChild(b);
    });
    box.appendChild(grid);
  });
}

/* ---------- STAFF ---------- */
function renderStaff(){
  var tb=$("staff-tbl").querySelector("tbody"); tb.innerHTML="";
  load("db_staff",[]).forEach(function(s,i){
    var tr=document.createElement("tr");
    tr.innerHTML="<td>"+(i+1)+"</td><td>"+esc(s.name)+"</td><td>"+esc(s.mobile||"-")+"</td><td>"+esc(s.role||"-")+'</td><td><button class="rowbtn">🗑️</button></td>';
    tr.querySelector(".rowbtn").onclick=function(){
      var arr=load("db_staff",[]).filter(function(x){return x.id!==s.id;});
      save("db_staff",arr); renderStaff(); toast("हटा दिया गया");
    };
    tb.appendChild(tr);
  });
}

/* ---------- SETTINGS ---------- */
function renderSettings(){
  var s=settings();
  $("set-shop").value=s.shop||""; $("set-owner").value=s.owner||"";
  $("set-mobile").value=s.mobile||""; $("set-address").value=s.address||"";
  var d=$("ann-manage"); d.innerHTML="";
  (s.anns||[]).forEach(function(a,i){
    var div=document.createElement("div"); div.className="ann";
    div.innerHTML='<button class="adel" title="Delete">🗑️</button><b>'+esc(a.t)+'</b><small>'+esc(a.d)+'</small>';
    div.querySelector(".adel").onclick=function(){
      var st=settings(); st.anns.splice(i,1); save("db_settings",st); renderSettings(); renderDashboard();
    };
    d.appendChild(div);
  });
}

/* ---------- MODALS ---------- */
function openModal(id){ $(id).classList.remove("hidden"); }
function closeModals(){ document.querySelectorAll(".modal").forEach(function(m){m.classList.add("hidden");}); }

var editCustId=null;
function openCustForm(){
  editCustId=null; $("mc-title").textContent="👤 New Customer";
  $("mc-name").value=""; $("mc-mobile").value=""; $("mc-address").value="";
  openModal("m-customer");
}
function openWorkForm(presetSvc,presetCust){
  var cs=customers();
  var sc=$("mw-cust"); sc.innerHTML=cs.length?"":'<option value="">— पहले ग्राहक जोड़ें —</option>';
  cs.forEach(function(c){ var o=document.createElement("option"); o.value=c.id; o.textContent=c.name+" ("+c.mobile+")"; sc.appendChild(o); });
  if(presetCust) sc.value=presetCust;
  var ss=$("mw-svc"); ss.innerHTML="";
  SERVICES.forEach(function(s){ var o=document.createElement("option"); o.value=s.id; o.textContent=s.hi+" — "+s.en; ss.appendChild(o); });
  if(presetSvc) ss.value=presetSvc;
  $("mw-amt").value=""; $("mw-status").value="Processing"; $("mw-note").value="";
  $("mw-title").textContent="New Work";
  openModal("m-work");
}
function openPayForm(presetWork){
  var sw=$("mp-work"); sw.innerHTML="";
  works().slice().reverse().forEach(function(w){
    var due=Number(w.amt||0)-Number(w.paid||0);
    var o=document.createElement("option"); o.value=w.id;
    o.textContent=w.id+" — "+custName(w.cust)+" (बकाया "+rs(Math.max(0,due))+")";
    sw.appendChild(o);
  });
  if(presetWork) sw.value=presetWork;
  $("mp-amt").value=""; $("mp-note").value="";
  openModal("m-pay");
}

/* ---------- GLOBAL SEARCH ---------- */
function globalSearch(q){
  q=(q||"").trim().toLowerCase(); if(!q) return;
  var wid=q.toUpperCase();
  var w=works().find(function(x){return x.id.toUpperCase()===wid;});
  if(w){ openDetail(w.id); return; }
  var c=customers().find(function(x){return x.name.toLowerCase().indexOf(q)>=0||x.mobile.indexOf(q)>=0;});
  if(c){ showView("customers"); custQ=q; $("cust-search").value=q; renderCustomers(); toast("ग्राहक मिला: "+c.name); return; }
  var s=SERVICES.find(function(x){return (x.hi+" "+x.en).toLowerCase().indexOf(q)>=0;});
  if(s){ showView("dashboard"); svcCat=s.cat; document.querySelectorAll("#svc-tabs button").forEach(function(b){b.classList.toggle("on",b.dataset.cat===svcCat);}); renderSvcGrid(); setTimeout(function(){var el=$("svc-grid"); if(el) el.scrollIntoView({behavior:"smooth"});},100); toast("सेवा: "+s.hi); return; }
  toast("कुछ नहीं मिला: "+q);
}

/* ---------- EVENTS ---------- */
function bind(){
  $("hamburger").onclick=openSide;
  $("side-overlay").onclick=closeSide;
  document.querySelectorAll(".sn-item").forEach(function(b){
    b.onclick=function(){
      var v=b.getAttribute("data-view");
      if(v==="new-customer"){ openCustForm(); closeSide(); return; }
      if(v==="services"){ showView("dashboard"); svcCat="all"; renderDashboard(); setTimeout(function(){var el=$("svc-grid"); if(el) el.scrollIntoView({behavior:"smooth"});},150); return; }
      if(v.indexOf("cat-")===0){ showView("dashboard"); svcCat=v.slice(4); document.querySelectorAll("#svc-tabs button").forEach(function(x){x.classList.toggle("on",x.dataset.cat===svcCat);}); renderDashboard(); setTimeout(function(){var el=$("svc-grid"); if(el) el.scrollIntoView({behavior:"smooth"});},150); return; }
      showView(v);
    };
  });
  document.querySelectorAll("[data-goto]").forEach(function(a){
    a.onclick=function(e){ e.preventDefault(); showView(a.getAttribute("data-goto")); };
  });
  document.querySelectorAll("#svc-tabs button").forEach(function(b){
    b.onclick=function(){ svcCat=b.dataset.cat; document.querySelectorAll("#svc-tabs button").forEach(function(x){x.classList.remove("on");}); b.classList.add("on"); renderSvcGrid(); };
  });
  document.querySelectorAll("#work-tabs button").forEach(function(b){
    b.onclick=function(){ workFilter=b.dataset.f; document.querySelectorAll("#work-tabs button").forEach(function(x){x.classList.remove("on");}); b.classList.add("on"); renderDashWorks(); };
  });
  document.querySelectorAll("#work-tabs2 button").forEach(function(b){
    b.onclick=function(){ workFilter2=b.dataset.f; document.querySelectorAll("#work-tabs2 button").forEach(function(x){x.classList.remove("on");}); b.classList.add("on"); renderWorks(); };
  });
  $("svc-search").addEventListener("input",renderSvcGrid);
  $("cust-search").addEventListener("input",function(){ custQ=this.value.toLowerCase(); renderCustomers(); });
  $("create-work-btn").onclick=function(){ openWorkForm(); };
  $("quick-entry").onclick=function(e){ e.preventDefault(); openWorkForm(); };
  $("add-work-btn").onclick=function(){ openWorkForm(); };
  $("add-cust-btn").onclick=openCustForm;
  $("add-pay-btn").onclick=function(){ openPayForm(); };
  $("add-staff-btn").onclick=function(){ $("ms-name").value="";$("ms-mobile").value="";$("ms-role").value=""; openModal("m-staff"); };
  $("add-ann-btn").onclick=function(){ $("ma-title").value="";$("ma-msg").value=""; openModal("m-ann"); };
  $("bell-btn").onclick=function(){ var n=works().filter(function(w){return w.status==="Action Required";}).length; toast(n?("⚠️ "+n+" कामों पर action चाहिए"):"🔔 कोई नया notification नहीं"); };
  $("open-all-portals").onclick=function(e){ e.preventDefault(); PORTALS.forEach(function(p){ openUrl(p.url); }); };
  $("wa-support").onclick=function(e){ e.preventDefault(); toast("WhatsApp support जल्द आ रहा है"); };
  var gs=$("global-search");
  gs.addEventListener("keydown",function(e){ if(e.key==="Enter") globalSearch(gs.value); });
  document.addEventListener("keydown",function(e){ if(e.ctrlKey&&e.key.toLowerCase()==="k"){ e.preventDefault(); gs.focus(); } });

  document.querySelectorAll("[data-close]").forEach(function(b){ b.onclick=closeModals; });
  document.querySelectorAll(".modal").forEach(function(m){ m.addEventListener("click",function(e){ if(e.target===m) closeModals(); }); });

  $("mc-save").onclick=function(){
    var n=$("mc-name").value.trim(), m=$("mc-mobile").value.trim();
    if(!n){ toast("नाम डालें"); return; }
    if(!/^[0-9]{10}$/.test(m)){ toast("सही 10-digit मोबाइल डालें"); return; }
    var cs=customers();
    var id=cs.length?Math.max.apply(null,cs.map(function(c){return c.id;}))+1:1;
    cs.push({id:id,name:n,mobile:m,address:$("mc-address").value.trim(),created:todayStr()});
    save("db_customers",cs); closeModals(); renderDashboard(); renderCustomers();
    toast("✅ ग्राहक जुड़ गया");
  };
  $("mw-save").onclick=function(){
    var cid=Number($("mw-cust").value);
    if(!cid){ toast("पहले ग्राहक जोड़ें"); return; }
    var seq=load("db_seq",1031);
    var ws=works();
    ws.push({id:"DB-"+seq,cust:cid,svc:$("mw-svc").value,amt:Number($("mw-amt").value||0),paid:0,status:$("mw-status").value,note:$("mw-note").value.trim(),date:todayStr()});
    save("db_works",ws); save("db_seq",seq+1);
    closeModals(); renderDashboard(); renderWorks(); renderPayments();
    toast("✅ काम बन गया: DB-"+seq);
  };
  $("mp-save").onclick=function(){
    var wid=$("mp-work").value, amt=Number($("mp-amt").value||0);
    if(!wid||amt<=0){ toast("सही राशि डालें"); return; }
    var ws=works(), w=ws.find(function(x){return x.id===wid});
    var due=Number(w.amt||0)-Number(w.paid||0);
    if(amt>due){ toast("बकाया से ज़्यादा नहीं (बकाया "+rs(due)+")"); return; }
    w.paid=Number(w.paid||0)+amt;
    if(Number(w.paid)>=Number(w.amt)&&Number(w.amt)>0) w.status="Completed";
    var ps=payments();
    ps.push({id:ps.length?ps[ps.length-1].id+1:1,date:todayStr(),cust:w.cust,work:wid,amt:amt,note:$("mp-note").value.trim()});
    save("db_works",ws); save("db_payments",ps);
    closeModals(); renderDashboard(); renderWorks(); renderPayments();
    toast("✅ "+rs(amt)+" पेमेंट मिला");
  };
  $("ms-save").onclick=function(){
    var n=$("ms-name").value.trim(); if(!n){ toast("नाम डालें"); return; }
    var arr=load("db_staff",[]);
    arr.push({id:Date.now(),name:n,mobile:$("ms-mobile").value.trim(),role:$("ms-role").value.trim()});
    save("db_staff",arr); closeModals(); renderStaff(); toast("✅ Staff जुड़ गया");
  };
  $("ma-save").onclick=function(){
    var t=$("ma-title").value.trim(); if(!t){ toast("शीर्षक डालें"); return; }
    var s=settings(); s.anns=s.anns||[];
    s.anns.unshift({t:t+" "+$("ma-msg").value.trim(),d:fmtDate(todayStr())});
    save("db_settings",s); closeModals(); renderSettings(); renderDashboard(); toast("✅ Announcement जुड़ गया");
  };
  $("save-settings").onclick=function(){
    var s=settings();
    s.shop=$("set-shop").value.trim()||"Digital Bhai"; s.owner=$("set-owner").value.trim();
    s.mobile=$("set-mobile").value.trim(); s.address=$("set-address").value.trim();
    save("db_settings",s); toast("✅ Settings save हो गई");
  };
  $("portal-check").onclick=function(){
    var wid=$("portal-wid").value.trim().toUpperCase();
    var w=works().find(function(x){return x.id.toUpperCase()===wid;});
    var r=$("portal-result");
    if(!w){ r.innerHTML='<p class="muted">Work ID नहीं मिला।</p>'; return; }
    r.innerHTML='<dl class="kv"><dt>Work ID</dt><dd class="wid">'+w.id+'</dd><dt>सेवा</dt><dd>'+esc(svcName(w.svc))+'</dd><dt>स्थिति</dt><dd>'+stBadge(w.status)+'</dd></dl>';
  };
}

/* ---------- INIT ---------- */
seed(); clock(); setInterval(clock,30000); bind(); showView("dashboard");
})();
