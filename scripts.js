function switchAnalysisTab(t){var tabs=document.querySelectorAll('.analysis-section .tab');tabs.forEach(function(x,i){if(i==['top5','suspended','combined','overdue'].indexOf(t)){x.classList.add('active')}else{x.classList.remove('active')}});['top5','suspended','combined','overdue'].forEach(function(id){var el=document.getElementById('analysis-'+id);if(id===t){el.classList.add('active')}else{el.classList.remove('active')}})}
function switchGridTab(t){var tabs=document.querySelectorAll('.grid-section .tab');tabs.forEach(function(x){if(x.textContent.includes(t==='cn'?'中文':'外文'))x.classList.add('active');else x.classList.remove('active')});['cn','foreign'].forEach(function(id){var el=document.getElementById('grid-'+id);if(id===t){el.classList.add('active')}else{el.classList.remove('active')}})}
function switchDetailTab(t){var tabs=document.querySelectorAll('.detail-section .tab');tabs.forEach(function(x){if(x.textContent.includes(t==='cn'?'中文':'外文'))x.classList.add('active');else x.classList.remove('active')});['cn','foreign'].forEach(function(id){var el=document.getElementById('detail-'+id);if(id===t){el.classList.add('active')}else{el.classList.remove('active')}})}
new Chart(document.getElementById('trendSpeciesChart'),{type:'line',data:{labels:["1\u6708", "2\u6708", "3\u6708", "4\u6708", "5\u6708", "6\u6708", "7\u6708", "8\u6708", "9\u6708", "10\u6708", "11\u6708", "12\u6708"],datasets:[{label:'中文',data:[52, 35, 87, 79, 63, 26, 0, 0, 0, 0, 0, 0],borderColor:'#3498db',backgroundColor:'rgba(52,152,219,0.08)',fill:true,tension:.4},{label:'外文',data:[2, 5, 5, 6, 5, 2, 0, 0, 0, 0, 0, 0],borderColor:'#e74c3c',backgroundColor:'rgba(231,76,60,0.08)',fill:true,tension:.4}]},options:{responsive:true,plugins:{legend:{position:'top',labels:{font:{size:11}}}},scales:{y:{beginAtZero:true,ticks:{stepSize:1}}}}});
new Chart(document.getElementById('trendIssuesChart'),{type:'line',data:{labels:["1\u6708", "2\u6708", "3\u6708", "4\u6708", "5\u6708", "6\u6708", "7\u6708", "8\u6708", "9\u6708", "10\u6708", "11\u6708", "12\u6708"],datasets:[{label:'中文',data:[75, 38, 204, 130, 71, 27, 0, 0, 0, 0, 0, 0],borderColor:'#3498db',backgroundColor:'rgba(52,152,219,0.08)',fill:true,tension:.4},{label:'外文',data:[3, 8, 14, 16, 12, 3, 0, 0, 0, 0, 0, 0],borderColor:'#e74c3c',backgroundColor:'rgba(231,76,60,0.08)',fill:true,tension:.4}]},options:{responsive:true,plugins:{legend:{position:'top',labels:{font:{size:11}}}},scales:{y:{beginAtZero:true,ticks:{stepSize:1}}}}});

// ========== 排架标签切换 ==========
function switchShelf(l){
  document.querySelectorAll('.tab').forEach(function(b){if(b.closest('.shelf-module'))b.classList.toggle('active',b.textContent.trim().startsWith(l))});
  document.querySelectorAll('.shelf-card').forEach(function(c){c.classList.toggle('active',c.id==='shelf-'+l)});
}
// ========== 标签页 location.hash ==========
(function(){
  function patch(original,section){return function(t){original(t);history.replaceState(null,'','#'+section+'-'+t);};}
  var _ana=window.switchAnalysisTab,_grid=window.switchGridTab,_detail=window.switchDetailTab;
  if(_ana)window.switchAnalysisTab=patch(_ana,'analysis');
  if(_grid)window.switchGridTab=patch(_grid,'grid');
  if(_detail)window.switchDetailTab=patch(_detail,'detail');
  function restore(){
    var h=location.hash.replace('#','');if(!h)return;
    var p=h.split('-');if(p.length!==2)return;
    var s=p[0],t=p[1];
    if(s==='analysis'&&_ana)_ana(t);else if(s==='grid'&&_grid)_grid(t);else if(s==='detail'&&_detail)_detail(t);
  }
  if(document.readyState==='complete')restore();else window.addEventListener('load',restore);
})();
// ========== 搜索过滤 ==========
(function(){
  var inp=document.getElementById('gridSearch'),clr=document.getElementById('gridSearchClear'),cnt=document.getElementById('gridSearchCount');
  if(!inp)return;
  function filter(){
    var q=inp.value.trim().toLowerCase();
    var at=document.querySelector('#grid-cn.active,#grid-foreign.active')||document.getElementById('grid-cn');
    var w=at.querySelector('.grid-wrapper');if(!w)return;
    var fr=w.querySelectorAll('.grid-fixed-row');
    var sr=w.querySelector('.grid-scroll-col');sr=sr?sr.querySelectorAll('.grid-row'):[];
    var v=0;
    for(var i=0;i<fr.length;i++){
      var l=fr[i].querySelector('.grid-label-fixed');if(!l)continue;
      var m=!q||l.textContent.trim().toLowerCase().indexOf(q)!==-1;
      fr[i].classList.toggle('hidden-by-search',!m);if(sr[i])sr[i].classList.toggle('hidden-by-search',!m);if(m)v++;
    }
    clr&&clr.classList.toggle('show',q.length>0);if(cnt)cnt.textContent=q?v+' / '+fr.length:'';
  }
  var t;inp.addEventListener('input',function(){clearTimeout(t);t=setTimeout(filter,150);});
  clr&&clr.addEventListener('click',function(){inp.value='';filter();inp.focus();});
})();
// ========== 网格拖拽 ==========
(function(){
  var s=document.createElement('style');
  s.textContent='.grid-scroll-col{overflow-x:auto!important}.grid-scroll-col>.grid-table{min-width:140%}';
  document.head.appendChild(s);
  var _dragActive=false;
  document.querySelectorAll('.grid-scroll-col').forEach(function(el){
    var isDown=false,startX=0,scrollX=0;
    el.addEventListener('mousedown',function(e){
      isDown=true;_dragActive=false;
      startX=e.clientX;scrollX=el.scrollLeft;
      el.classList.add('grabbing');
    });
    el.addEventListener('mousemove',function(e){
      if(!isDown||e.buttons!==1)return;
      var dx=e.clientX-startX;
      el.scrollLeft=scrollX-dx;
      if(Math.abs(dx)>5)_dragActive=true;
    });
    el.addEventListener('mouseup',function(){isDown=false;el.classList.remove('grabbing');});
    el.addEventListener('mouseleave',function(){isDown=false;el.classList.remove('grabbing');});
  });
  document.addEventListener('click',function(e){if(_dragActive){e.stopPropagation();e.stopImmediatePropagation();_dragActive=false;}},true);
})();
// ========= 表格排序 ==========
function extractPct(v){var m=v.match(/(\d+(?:\.\d+)?)%/);return m?parseFloat(m[1]):NaN;}
(function(){
function md(cs,cm){var h=document.querySelector(cs+' .analysis-col-header');if(!h)return;h.querySelectorAll('.sortable').forEach(function(th){th.addEventListener('click',function(){var ci=parseInt(th.getAttribute('data-sort-col'),10),t=th.closest('.analysis-table');if(!t)return;var rows=Array.from(t.querySelectorAll('.analysis-row:not(.analysis-col-header)'));var d=th.getAttribute('data-sort-dir')==='asc'?'desc':'asc';th.setAttribute('data-sort-dir',d);h.querySelectorAll('.sortable').forEach(function(s){var a=s.querySelector('.sort-arrow');if(a)a.className='sort-arrow';});var ar=th.querySelector('.sort-arrow');if(ar)ar.classList.add(d);var gv=cm?cm[ci]:null;rows.sort(function(a,b){var ca=a.querySelectorAll('.analysis-col'),cb=b.querySelectorAll('.analysis-col');var va=gv?gv(ca[ci]?ca[ci].textContent.trim():''):(ca[ci]?ca[ci].textContent.trim():'');var vb=gv?gv(cb[ci]?cb[ci].textContent.trim():''):(cb[ci]?cb[ci].textContent.trim():'');var na=parseFloat(va.replace(/[^0-9.-]/g,'')),nb=parseFloat(vb.replace(/[^0-9.-]/g,''));if(!isNaN(na)&&!isNaN(nb))return d==='asc'?na-nb:nb-na;return d==='asc'?va.localeCompare(vb):vb.localeCompare(va);});rows.forEach(function(r){t.appendChild(r);});});});}
function mt(cs,cm){var tbl=document.querySelector(cs+' table');if(!tbl)return;tbl.querySelectorAll('th.sortable-th').forEach(function(th){th.addEventListener('click',function(){var ci=parseInt(th.getAttribute('data-sort-col'),10),tb=tbl.querySelector('tbody')||tbl;var rows=Array.from(tb.querySelectorAll('tr')).filter(function(r){return r.querySelector('td');});var d=th.getAttribute('data-sort-dir')==='asc'?'desc':'asc';th.setAttribute('data-sort-dir',d);tbl.querySelectorAll('th.sortable-th').forEach(function(s){var a=s.querySelector('.sort-arrow');if(a)a.className='sort-arrow';});var ar=th.querySelector('.sort-arrow');if(ar)ar.classList.add(d);var gv=cm?cm[ci]:null;rows.sort(function(a,b){var ca=a.querySelectorAll('td'),cb=b.querySelectorAll('td');var va=gv?gv(ca[ci]?ca[ci].textContent.trim():''):(ca[ci]?ca[ci].textContent.trim():'');var vb=gv?gv(cb[ci]?cb[ci].textContent.trim():''):(cb[ci]?cb[ci].textContent.trim():'');var na=parseFloat(va.replace(/[^0-9.-]/g,'')),nb=parseFloat(vb.replace(/[^0-9.-]/g,''));if(!isNaN(na)&&!isNaN(nb))return d==='asc'?na-nb:nb-na;return d==='asc'?va.localeCompare(vb):vb.localeCompare(va);});rows.forEach(function(r){tb.appendChild(r);});});});}
md('#analysis-top5');md('#analysis-suspended');md('#analysis-combined');md('#analysis-overdue');
mt('#detail-cn',{2:function(v){return String(extractPct(v));}});
mt('#detail-foreign',{2:function(v){return String(extractPct(v));}});
})();
// ========== 网格交互 ==========
(function(){
var ol=null,pop=null;
function ep(){if(pop)return;ol=document.createElement('div');ol.className='grid-popup-overlay';document.body.appendChild(ol);pop=document.createElement('div');pop.className='grid-popup';pop.innerHTML='<button class="gp-close" onclick="hideGridPopup()">\u2715</button><div class="gp-head"><div class="gp-color-indicator" id="gpColor">1</div><div><div class="gp-title" id="gpTitle"></div><div class="gp-meta" id="gpMeta"></div></div></div><div class="gp-body" id="gpBody"></div>';document.body.appendChild(pop);ol.addEventListener('click',hideGridPopup);}
window.showGridDetail=function(el){
  ep();var t=el.getAttribute('title')||'\u7b2cX\u671f\uff1a\u672a\u77e5',r=el.closest('.grid-row');
  var ri=Array.from(r.parentElement.children).indexOf(r);var fr=document.querySelectorAll('.grid-fixed-row')[ri];var jn=fr?fr.querySelector('.grid-label-fixed').textContent.trim():'',inm=el.textContent.trim(),bg=el.style.backgroundColor||'#d0d0d0';
  var st='\u672a\u5230';if(t.indexOf('\u5df2\u7b7e\u6536')!==-1)st='\u2713 \u5df2\u7b7e\u6536';else if(t.indexOf('\u5408\u520a')!==-1)st='\u224b \u5408\u520a';else if(t.indexOf('\u505c\u520a')!==-1)st='\u2297 \u505c\u520a';
  var cd='\u2014';
  (function(){
    var its=document.querySelectorAll('.timeline-item'),n=jn.toLowerCase();
    var candidates=[inm];
    if(inm.indexOf('-')>0){var parts=inm.split('-');candidates.push(parts[0]+','+parts[1]);candidates=candidates.concat(parts);}
    for(var i=0;i<its.length;i++){
      var txt=its[i].textContent.trim(),nm=txt.split(':')[0].trim().toLowerCase();
      if(nm!==n)continue;
      for(var ci=0;ci<candidates.length;ci++){
        if(txt.indexOf(candidates[ci])!==-1){
          var p=its[i].parentElement;while(p&&!p.classList.contains('timeline-date'))p=p.previousElementSibling;
          if(p&&p.classList.contains('timeline-date')){cd=p.textContent.trim();return;}
        }
      }
    }
  })();
  document.getElementById('gpColor').textContent=inm;document.getElementById('gpColor').style.background=bg;
  document.getElementById('gpTitle').textContent=jn;document.getElementById('gpMeta').textContent='\u7b2c'+inm+'\u671f';
  document.getElementById('gpBody').innerHTML='<div style="display:flex;flex-direction:column;gap:8px"><span class="gp-status">'+st+'</span><div style="font-size:13px;color:#888"><span style="color:#555;font-weight:500">\u5230\u520a\u65f6\u95f4\uff1a</span>'+cd+'</div></div>';
  pop.classList.add('show');ol.classList.add('show');
};
window.hideGridPopup=function(){if(pop)pop.classList.remove('show');if(ol)ol.classList.remove('show');};
document.addEventListener('keydown',function(e){if(e.key==='Escape')hideGridPopup();});
})();
// ========== 时间线增强 ==========
(function(){
  var search=document.getElementById('tlSearch'),monthSel=document.getElementById('tlMonth'),stats=document.getElementById('tlStats');
  if(!search)return;
  var dateHeaders=document.querySelectorAll('.timeline-date'),months=new Set();
  dateHeaders.forEach(function(d){
    var m=d.textContent.trim().match(/^(\d{4})[\-\u5e74](\d{1,2})/);
    if(m)months.add(m[1]+'-'+m[2]);
    d.setAttribute('data-orig',d.textContent);
  });
  Array.from(months).sort().forEach(function(m){var opt=document.createElement('option');opt.value=m;opt.textContent=m.replace('-','\u5e74')+'\u6708';monthSel.appendChild(opt);});
  function extractName(text){return text.split(':')[0].trim().toLowerCase();}
  function filterTimeline(){
    var q=search.value.trim().toLowerCase(),mo=monthSel.value,totalSpecies=new Set(),totalCount=0;
    dateHeaders.forEach(function(dateEl){
      var wrapper=dateEl.nextElementSibling,items=wrapper?wrapper.querySelectorAll('.timeline-item'):[],visibleCount=0,visibleSpecies=new Set();
      items.forEach(function(item){
        var name=extractName(item.textContent),show=true;
        if(q&&name.indexOf(q)===-1)show=false;
        if(mo){var m2=dateEl.textContent.match(/^(\d{4})[\-\u5e74](\d{1,2})/);if(!m2||(m2[1]+'-'+m2[2])!==mo)show=false;}
        item.classList.toggle('hidden-by-tl',!show);
        if(show){visibleCount++;visibleSpecies.add(name);}
      });
      var orig=dateEl.getAttribute('data-orig')||dateEl.textContent;
      dateEl.textContent=(q||mo)?orig.replace(/\uff08\d+\uff09/,'\uff08'+visibleCount+'\uff09'):orig;
      dateEl.classList.toggle('hidden-by-tl',(q||mo)&&visibleCount===0);
      visibleSpecies.forEach(function(s){totalSpecies.add(s);});totalCount+=visibleCount;
    });
    if(stats)stats.textContent=totalCount?' '+totalSpecies.size+'\u79cd '+totalCount+'\u671f':'';
  }
  search.addEventListener('input',function(){clearTimeout(window._tlTimer);window._tlTimer=setTimeout(filterTimeline,150);});
  monthSel.addEventListener('change',filterTimeline);
  filterTimeline();
})();

// ========== 滚动监听高亮目录 ==========
(function(){
  var items=document.querySelectorAll('.toc-item');
  if(!items.length)return;
  var sections=Array.from(items).map(function(item){return document.getElementById(item.getAttribute('href').replace('#',''));}).filter(Boolean);
  function onScroll(){
    var active='',nearBottom=window.innerHeight+window.scrollY>=document.documentElement.scrollHeight-80;
    sections.forEach(function(s){var r=s.getBoundingClientRect();if(r.top<=200)active=s.id;});
    if(nearBottom&&sections.length)active=sections[sections.length-1].id;
    items.forEach(function(item){item.classList.toggle('active',item.getAttribute('href')==='#'+active);});
  }
  window.addEventListener('scroll',onScroll,{passive:true});onScroll();
})();
