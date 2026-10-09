/* ============ DIGITAL BHAI — app logic ============ */
(function(){
"use strict";

/* ---------- storage ---------- */
function load(k, fb){ try{ var v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; }catch(e){ return fb; } }
function save(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }

/* ---------- services ---------- */
var SERVICES = [
  {n:"जाति प्रमाण पत्र", e:"🏠"}, {n:"आवास प्रमाण पत्र", e:"🏡"},
  {n:"आय प्रमाण पत्र", e:"💵"}, {n:"EWS प्रमाण पत्र", e:"📜"},
  {n:"निवास प्रमाण पत्र", e:"📍"}, {n:"पेंशन योजना", e:"👴"},
  {n:"NSP Scholarship", e:"🎓"}, {n:"Job Apply", e:"💼"},
  {n:"Admit Card", e:"🎫"}, {n:"Result", e:"📊"},
  {n:"PAN / Aadhaar", e:"🪪"}, {n:"Print / Scan", e:"🖨️"},
  {n:"PDF Tools", e:"📕"}, {n:"Photo & Signature", e:"📸"},
  {n:"Typing Work", e:"⌨️"}, {n:"Resume / CV", e:"📝"}
];
var STATUS_HI = {processing:"प्रोसेसिंग", pending:"पेंडिंग", completed:"पूर्ण"};

/* ---------- seed data ---------- */
function seed(){
  if(localStorage.getItem("db_customers")) return;
  var now = Date.now(), D = 86400000;
  var customers = [
    {id:"c1", name:"राहुल कुमार", mobile:"9876543210", address:"पटना", createdAt: now-30*D},
    {id:"c2", name:"पूजा कुमारी", mobile:"9123456789", address:"गया", createdAt: now-25*D},
    {id:"c3", name:"अमित सिंह", mobile:"8987654321", address:"मुजफ्फरपुर", createdAt: now-20*D},
    {id:"c4", name:"नेहा कुमारी", mobile:"9871234560", address:"दरभंगा", createdAt: now-10*D}
  ];
  var works = [
    {id:"DB-1025", customerId:"c1", service:"NSP Scholarship", amount:150, paid:0, status:"processing", note:"", createdAt: now-2*3600000},
    {id:"DB-1026", customerId:"c2", service:"जाति प्रमाण पत्र", amount:100, paid:100, status:"completed", note:"", createdAt: now-5*3600000},
    {id:"DB-1027", customerId:"c3", service:"Job Apply", amount:200, paid:0, status:"pending", note:"डॉक्यूमेंट बाकी है", createdAt: now-8*3600000},
    {id:"DB-1028", customerId:"c4", service:"आय प्रमाण पत्र", amount:120, paid:0, status:"processing", note:"", createdAt: now-26*3600000},
    {id:"DB-1029", customerId:"c1", service:"Admit Card", amount:50, paid:50, status:"completed", note:"", createdAt: now-2*D},
    {id:"DB-1030", customerId:"c2", service:"आवास योजना", amount:180, paid:0, status:"pending", note:"फॉर्म भरना है", createdAt: now-3*D}
  ];
  var payments = [
    {id:"p1", workId:"DB-1026", amount:100, date: now-5*3600000},
    {id:"p2", workId:"DB-1029", amount:50, date: now-2*D}
  ];
  save("db_customers", customers);
  save("db_works", works);
  save("db_payments", payments);
  save("db_settings", {shopName:"Digital Bhai Seva Center"});
}
seed();

var customers = load("db_customers", []);
var works = load("db_works", []);
var payments = load("db_payments", []);
var settings = load("db_settings", {shopName:"Digital Bhai Seva Center"});

function persist(){ save("db_customers", customers); save("db_works", works); save("db_payments", payments); save("db_settings", settings); }

/* ---------- helpers ---------- */
function $(id){ return document.getElementById(id); }
function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
function custById(id){ for(var i=0;i<customers.length;i++) if(customers[i].id===id) return customers[i]; return {name:"(हटाया गया)", mobile:""}; }
function workById(id){ for(var i=0;i<works.length;i++) if(works[i].id===id) return works[i]; return null; }
function isToday(ts){ var d=new Date(ts), n=new Date(); return d.getFullYear()===n.getFullYear() && d.getMonth()===n.getMonth() && d.getDate()===n.getDate(); }
function fmtDate(ts){ var d=new Date(ts); return d.getDate()+"/"+(d.getMonth()+1)+"/"+d.getFullYear(); }
function nextWorkId(){ return "DB-" + (1024 + works.length + 1); }
function toast(msg){ var t=$("toast"); t.textContent=msg; t.classList.remove("hidden"); clearTimeout(t._to); t._to=setTimeout(function(){ t.classList.add("hidden"); }, 2200); }
function openModal(id){ $(id).classList.remove("hidden"); }
function closeModal(id){ $(id).classList.add("hidden"); }
document.querySelectorAll("[data-close]").forEach(function(b){
  b.addEventListener("click", function(){ closeModal(b.getAttribute("data-close")); });
});
document.querySelectorAll(".modal").forEach(function(m){
  m.addEventListener("click", function(e){ if(e.target===m) m.classList.add("hidden"); });
});

/* ---------- navigation ---------- */
function show(id){
  document.querySelectorAll(".screen").forEach(function(s){ s.classList.remove("active"); });
  $(id).classList.add("active");
  document.querySelectorAll("#bottomnav button").forEach(function(b){
    b.classList.toggle("on", b.getAttribute("data-nav")===id);
  });
  window.scrollTo(0,0);
}
document.querySelectorAll("#bottomnav button").forEach(function(b){
  b.addEventListener("click", function(){ navTo(b.getAttribute("data-nav")); });
});
function navTo(id){
  if(id==="s-dash") renderDash();
  if(id==="s-works") renderWorks();
  if(id==="s-customers") renderCustomers();
  if(id==="s-payments") renderPayments();
  if(id==="s-more") renderMore();
  show(id);
}

/* ---------- 1. DASHBOARD ---------- */
function renderDash(){
  var todayCust = customers.filter(function(c){ return isToday(c.createdAt); }).length;
  var proc = works.filter(function(w){ return w.status==="processing"; }).length;
  var comp = works.filter(function(w){ return w.status==="completed"; }).length;
  var pend = works.filter(function(w){ return w.status==="pending"; }).length;
  var todayColl = payments.filter(function(p){ return isToday(p.date); }).reduce(function(s,p){ return s+p.amount; }, 0);
  var stats = [
    {e:"👥", n:todayCust, l:"आज के ग्राहक"},
    {e:"🧾", n:works.length, l:"कुल काम"},
    {e:"⏳", n:proc, l:"प्रोसेसिंग"},
    {e:"✅", n:comp, l:"पूर्ण"},
    {e:"⚠️", n:pend, l:"एक्शन चाहिए"},
    {e:"💰", n:"₹"+todayColl, l:"आज का कलेक्शन"}
  ];
  $("stats-grid").innerHTML = stats.map(function(s){
    return '<div class="stat"><div class="s-emoji">'+s.e+'</div><div class="s-num">'+s.n+'</div><div class="s-lbl">'+s.l+'</div></div>';
  }).join("");
  var tw = works.filter(function(w){ return isToday(w.createdAt); }).slice(0,5);
  $("dash-works").innerHTML = tw.length ? tw.map(workRow).join("") :
    '<div class="empty">आज कोई काम नहीं है।<br>"नया काम शुरू करें" दबाएं।</div>';
  bindWorkRows($("dash-works"));
  var d = new Date();
  $("tb-date").innerHTML = d.getDate()+"/"+(d.getMonth()+1)+"/"+d.getFullYear();
  $("shop-subtitle").textContent = esc(settings.shopName || "Cyber Cafe & Digital Seva Center");
}
$("dash-new-work").addEventListener("click", function(){ openWorkModal(); });

/* ---------- work row ---------- */
function workRow(w){
  var c = custById(w.customerId);
  return '<div class="work-row" data-wid="'+w.id+'">'+
    '<div class="wr-main"><div class="wr-id">'+esc(w.id)+'</div>'+
    '<div class="wr-name">'+esc(c.name)+'</div>'+
    '<div class="wr-svc">'+esc(w.service)+'</div></div>'+
    '<div class="wr-right"><div class="wr-amt">₹'+w.amount+'</div>'+
    '<span class="badge '+w.status+'">'+STATUS_HI[w.status]+'</span></div></div>';
}
function bindWorkRows(root){
  root.querySelectorAll(".work-row").forEach(function(r){
    r.addEventListener("click", function(){ openDetail(r.getAttribute("data-wid")); });
  });
}

/* ---------- 2. WORKS ---------- */
var workFilter = "all";
document.querySelectorAll("#work-filters .chip").forEach(function(ch){
  ch.addEventListener("click", function(){
    document.querySelectorAll("#work-filters .chip").forEach(function(x){ x.classList.remove("on"); });
    ch.classList.add("on"); workFilter = ch.getAttribute("data-f"); renderWorks();
  });
});
function renderWorks(){
  var list = works.slice().sort(function(a,b){ return b.createdAt-a.createdAt; });
  if(workFilter!=="all") list = list.filter(function(w){ return w.status===workFilter; });
  $("works-list").innerHTML = list.length ? list.map(workRow).join("") :
    '<div class="empty">कोई काम नहीं मिला।</div>';
  bindWorkRows($("works-list"));
}
$("works-add").addEventListener("click", function(){ openWorkModal(); });

function openWorkModal(presetService){
  var sel = $("w-customer");
  sel.innerHTML = customers.map(function(c){
    return '<option value="'+c.id+'">'+esc(c.name)+' ('+esc(c.mobile)+')</option>';
  }).join("") || '<option value="">— पहले ग्राहक जोड़ें —</option>';
  var ss = $("w-service");
  ss.innerHTML = SERVICES.map(function(s){ return '<option value="'+esc(s.n)+'">'+s.e+' '+esc(s.n)+'</option>'; }).join("");
  if(presetService) ss.value = presetService;
  $("w-amount").value = "";
  $("w-status").value = "processing";
  $("w-note").value = "";
  openModal("m-work");
}
$("w-save").addEventListener("click", function(){
  var cid = $("w-customer").value;
  if(!cid){ toast("⚠️ पहले ग्राहक जोड़ें"); return; }
  var amt = parseInt($("w-amount").value, 10);
  if(!(amt>0)){ toast("⚠️ सही राशि डालें"); return; }
  works.push({
    id: nextWorkId(), customerId: cid, service: $("w-service").value,
    amount: amt, paid: 0, status: $("w-status").value,
    note: $("w-note").value.trim(), createdAt: Date.now()
  });
  persist(); closeModal("m-work");
  toast("✅ काम सहेजा गया");
  renderDash(); renderWorks(); renderPayments();
});

/* ---------- work detail ---------- */
var detailId = null;
function openDetail(wid){
  var w = workById(wid); if(!w) return;
  detailId = wid;
  var c = custById(w.customerId);
  var due = w.amount - w.paid;
  $("d-title").textContent = "🧾 " + w.id;
  $("d-body").innerHTML =
    kv("ग्राहक", esc(c.name)+" ("+esc(c.mobile)+")") +
    kv("सेवा", esc(w.service)) +
    kv("राशि", "₹"+w.amount) +
    kv("प्राप्त", "₹"+w.paid) +
    kv("बकाया", "₹"+due) +
    kv("स्थिति", STATUS_HI[w.status]) +
    kv("तारीख", fmtDate(w.createdAt)) +
    (w.note ? kv("नोट", esc(w.note)) : "");
  $("d-status").value = w.status;
  openModal("m-detail");
}
function kv(k,v){ return '<div class="kv"><span class="k">'+k+'</span><span class="v">'+v+'</span></div>'; }
$("d-save-status").addEventListener("click", function(){
  var w = workById(detailId); if(!w) return;
  w.status = $("d-status").value;
  if(w.status==="completed" && w.paid < w.amount){
    // पूर्ण होते ही बकाया auto-collect मानें? नहीं — पेमेंट अलग से
  }
  persist(); closeModal("m-detail");
  toast("✅ स्थिति अपडेट हुई");
  renderDash(); renderWorks(); renderPayments();
});
$("d-pay").addEventListener("click", function(){
  var w = workById(detailId); if(!w) return;
  closeModal("m-detail");
  openPayment(w.id);
});

/* ---------- payment ---------- */
var payWorkId = null;
function openPayment(wid){
  var w = workById(wid); if(!w) return;
  payWorkId = wid;
  var due = w.amount - w.paid;
  var c = custById(w.customerId);
  $("p-info").innerHTML = "<b>"+esc(w.id)+"</b> — "+esc(c.name)+" · बकाया <b>₹"+due+"</b>";
  $("p-amount").value = due > 0 ? due : "";
  openModal("m-payment");
}
$("p-save").addEventListener("click", function(){
  var w = workById(payWorkId); if(!w) return;
  var amt = parseInt($("p-amount").value, 10);
  if(!(amt>0)){ toast("⚠️ सही राशि डालें"); return; }
  var due = w.amount - w.paid;
  if(amt > due){ toast("⚠️ बकाया सिर्फ ₹"+due+" है"); return; }
  w.paid += amt;
  payments.push({id:"p"+Date.now(), workId:w.id, amount:amt, date:Date.now()});
  if(w.paid >= w.amount) w.status = "completed";
  persist(); closeModal("m-payment");
  toast("✅ ₹"+amt+" प्राप्त हुआ");
  renderDash(); renderWorks(); renderPayments();
});

/* ---------- 3. CUSTOMERS ---------- */
function renderCustomers(){
  var q = ($("cust-search").value||"").toLowerCase().trim();
  var list = customers.slice().sort(function(a,b){ return b.createdAt-a.createdAt; });
  if(q) list = list.filter(function(c){ return c.name.toLowerCase().indexOf(q)>=0 || c.mobile.indexOf(q)>=0; });
  $("cust-list").innerHTML = list.length ? list.map(function(c){
    var n = works.filter(function(w){ return w.customerId===c.id; }).length;
    var initial = (c.name||"?").trim().charAt(0);
    return '<div class="cust-row" data-cid="'+c.id+'">'+
      '<div class="c-avatar">'+esc(initial)+'</div>'+
      '<div class="c-main"><div class="c-name">'+esc(c.name)+'</div>'+
      '<div class="c-mob">📱 '+esc(c.mobile)+(c.address?' · '+esc(c.address):"")+'</div></div>'+
      '<div class="c-count">'+n+' काम</div></div>';
  }).join("") : '<div class="empty">कोई ग्राहक नहीं मिला।</div>';
  $("cust-list").querySelectorAll(".cust-row").forEach(function(r){
    r.addEventListener("click", function(){ openHistory(r.getAttribute("data-cid")); });
  });
}
$("cust-search").addEventListener("input", renderCustomers);
$("cust-add").addEventListener("click", function(){
  $("c-name").value=""; $("c-mobile").value=""; $("c-address").value="";
  openModal("m-customer");
});
$("c-save").addEventListener("click", function(){
  var name = $("c-name").value.trim(), mob = $("c-mobile").value.trim();
  if(!name){ toast("⚠️ नाम डालें"); return; }
  if(!/^[0-9]{10}$/.test(mob)){ toast("⚠️ 10 अंकों का मोबाइल डालें"); return; }
  customers.push({id:"c"+Date.now(), name:name, mobile:mob, address:$("c-address").value.trim(), createdAt:Date.now()});
  persist(); closeModal("m-customer");
  toast("✅ ग्राहक जुड़ गया");
  renderCustomers(); renderDash();
});
function openHistory(cid){
  var c = custById(cid); if(!c.id) return;
  var list = works.filter(function(w){ return w.customerId===cid; }).sort(function(a,b){ return b.createdAt-a.createdAt; });
  var total = list.reduce(function(s,w){ return s+w.amount; }, 0);
  $("h-title").textContent = "👤 " + c.name;
  $("h-body").innerHTML =
    kv("मोबाइल", esc(c.mobile)) + kv("कुल काम", list.length) + kv("कुल राशि", "₹"+total) +
    '<div style="margin-top:10px">' + (list.length ? list.map(function(w){
      return '<div class="hist-row"><b>'+esc(w.id)+'</b> — '+esc(w.service)+' · ₹'+w.amount+' <span class="badge '+w.status+'">'+STATUS_HI[w.status]+'</span></div>';
    }).join("") : '<div class="empty">अभी कोई काम नहीं।</div>') + '</div>';
  openModal("m-history");
}

/* ---------- 4. PAYMENTS ---------- */
function renderPayments(){
  var todayColl = payments.filter(function(p){ return isToday(p.date); }).reduce(function(s,p){ return s+p.amount; }, 0);
  $("today-collection").textContent = "₹" + todayColl;
  var pend = works.filter(function(w){ return (w.amount - w.paid) > 0; }).sort(function(a,b){ return b.createdAt-a.createdAt; });
  $("pending-list").innerHTML = pend.length ? pend.map(function(w){
    var c = custById(w.customerId), due = w.amount - w.paid;
    return '<div class="work-row" data-wid="'+w.id+'">'+
      '<div class="wr-main"><div class="wr-name">'+esc(c.name)+'</div>'+
      '<div class="wr-svc">'+esc(w.id)+' · '+esc(w.service)+'</div></div>'+
      '<div class="wr-right"><div class="wr-amt" style="color:var(--bad)">₹'+due+' बकाया</div>'+
      '<button class="btn primary sm" data-pay="'+w.id+'" style="margin-top:6px">💰 पेमेंट लें</button></div></div>';
  }).join("") : '<div class="empty">🎉 कोई बकाया नहीं है!</div>';
  $("pending-list").querySelectorAll("[data-pay]").forEach(function(b){
    b.addEventListener("click", function(e){ e.stopPropagation(); openPayment(b.getAttribute("data-pay")); });
  });
  bindWorkRows($("pending-list"));
}

/* ---------- 5. MORE ---------- */
function renderMore(){
  $("svc-grid").innerHTML = SERVICES.map(function(s){
    return '<button class="svc" data-svc="'+esc(s.n)+'"><div class="sv-emoji">'+s.e+'</div><div class="sv-name">'+esc(s.n)+'</div></button>';
  }).join("");
  $("svc-grid").querySelectorAll(".svc").forEach(function(b){
    b.addEventListener("click", function(){ openWorkModal(b.getAttribute("data-svc")); });
  });
  var now = new Date(), m = now.getMonth(), y = now.getFullYear();
  var mw = works.filter(function(w){ var d=new Date(w.createdAt); return d.getMonth()===m && d.getFullYear()===y; });
  var mColl = payments.filter(function(p){ var d=new Date(p.date); return d.getMonth()===m && d.getFullYear()===y; }).reduce(function(s,p){ return s+p.amount; }, 0);
  var mComp = mw.filter(function(w){ return w.status==="completed"; }).length;
  var monthNames = ["जनवरी","फरवरी","मार्च","अप्रैल","मई","जून","जुलाई","अगस्त","सितंबर","अक्टूबर","नवंबर","दिसंबर"];
  $("report-card").innerHTML =
    kv("महीना", monthNames[m]+" "+y) +
    kv("कुल काम", mw.length) +
    kv("पूर्ण काम", mComp) +
    kv("कुल कलेक्शन", "₹"+mColl);
  $("set-shopname").value = settings.shopName || "";
}
$("set-save").addEventListener("click", function(){
  var v = $("set-shopname").value.trim();
  if(!v){ toast("⚠️ दुकान का नाम डालें"); return; }
  settings.shopName = v; persist();
  $("shop-subtitle").textContent = v;
  toast("✅ सहेजा गया");
});
$("more-share").addEventListener("click", function(){
  var text = "🏪 " + (settings.shopName||"Digital Bhai") + " — Cyber Cafe & Digital Seva Center\nसभी सरकारी सेवाएं एक ही जगह!";
  if(navigator.share){ navigator.share({title:"Digital Bhai", text:text}).catch(function(){}); }
  else if(navigator.clipboard){ navigator.clipboard.writeText(text).then(function(){ toast("📋 कॉपी हो गया"); }); }
  else toast(text);
});
$("more-feedback").addEventListener("click", function(){
  toast("💬 फीडबैक के लिए धन्यवाद!");
});

/* ---------- boot ---------- */
renderDash();

})();
