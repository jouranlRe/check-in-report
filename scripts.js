function switchAnalysisTab(t){var tabs=document.querySelectorAll('.analysis-section .tab');tabs.forEach(function(x,i){if(i==['top5','suspended','combined','overdue'].indexOf(t)){x.classList.add('active')}else{x.classList.remove('active')}});['top5','suspended','combined','overdue'].forEach(function(id){var el=document.getElementById('analysis-'+id);if(id===t){el.classList.add('active')}else{el.classList.remove('active')}})}
function switchGridTab(t){var tabs=document.querySelectorAll('.grid-section .tab');tabs.forEach(function(x){if(x.textContent.includes(t==='cn'?'中文':'外文'))x.classList.add('active');else x.classList.remove('active')});['cn','foreign'].forEach(function(id){var el=document.getElementById('grid-'+id);if(id===t){el.classList.add('active')}else{el.classList.remove('active')}})}
function switchDetailTab(t){var tabs=document.querySelectorAll('.detail-section .tab');tabs.forEach(function(x){if(x.textContent.includes(t==='cn'?'中文':'外文'))x.classList.add('active');else x.classList.remove('active')});['cn','foreign'].forEach(function(id){var el=document.getElementById('detail-'+id);if(id===t){el.classList.add('active')}else{el.classList.remove('active')}})}
new Chart(document.getElementById('trendSpeciesChart'),{type:'line',data:{labels:["1\u6708", "2\u6708", "3\u6708", "4\u6708", "5\u6708", "6\u6708", "7\u6708", "8\u6708", "9\u6708", "10\u6708", "11\u6708", "12\u6708"],datasets:[{label:'中文',data:[52, 35, 87, 79, 63, 26, 0, 0, 0, 0, 0, 0],borderColor:'#3498db',backgroundColor:'rgba(52,152,219,0.08)',fill:true,tension:.4},{label:'外文',data:[2, 5, 5, 6, 5, 2, 0, 0, 0, 0, 0, 0],borderColor:'#e74c3c',backgroundColor:'rgba(231,76,60,0.08)',fill:true,tension:.4}]},options:{responsive:true,plugins:{legend:{position:'top',labels:{font:{size:11}}}},scales:{y:{beginAtZero:true,ticks:{stepSize:1}}}}});
new Chart(document.getElementById('trendIssuesChart'),{type:'line',data:{labels:["1\u6708", "2\u6708", "3\u6708", "4\u6708", "5\u6708", "6\u6708", "7\u6708", "8\u6708", "9\u6708", "10\u6708", "11\u6708", "12\u6708"],datasets:[{label:'中文',data:[75, 38, 204, 130, 71, 27, 0, 0, 0, 0, 0, 0],borderColor:'#3498db',backgroundColor:'rgba(52,152,219,0.08)',fill:true,tension:.4},{label:'外文',data:[3, 8, 14, 16, 12, 3, 0, 0, 0, 0, 0, 0],borderColor:'#e74c3c',backgroundColor:'rgba(231,76,60,0.08)',fill:true,tension:.4}]},options:{responsive:true,plugins:{legend:{position:'top',labels:{font:{size:11}}}},scales:{y:{beginAtZero:true,ticks:{stepSize:1}}}}});

// ========== 标签页 location.hash 持久化 ==========
(function(){
  function patch(original,section){
    return function(t){ original(t); history.replaceState(null,'','#'+section+'-'+t); };
  }
  var _ana=window.switchAnalysisTab, _grid=window.switchGridTab, _detail=window.switchDetailTab;
  if(_ana) window.switchAnalysisTab=patch(_ana,'analysis');
  if(_grid) window.switchGridTab=patch(_grid,'grid');
  if(_detail) window.switchDetailTab=patch(_detail,'detail');
  function restore(){
    var h=location.hash.replace('#',''); if(!h)return;
    var p=h.split('-'); if(p.length!==2)return;
    var s=p[0],t=p[1];
    if(s==='analysis'&&_ana)_ana(t);
    else if(s==='grid'&&_grid)_grid(t);
    else if(s==='detail'&&_detail)_detail(t);
  }
  if(document.readyState==='complete')restore(); else window.addEventListener('load',restore);
})();

// ========== 期刊搜索过滤 ==========
(function(){
  var inp=document.getElementById('gridSearch'), clr=document.getElementById('gridSearchClear'), cnt=document.getElementById('gridSearchCount');
  if(!inp)return;
  function filter(){
    var q=inp.value.trim().toLowerCase(), rows=document.querySelectorAll('.grid-row'), vis=0;
    rows.forEach(function(r){
      var lbl=r.querySelector('.grid-label');
      if(!lbl)return;
      if(!q||lbl.textContent.trim().toLowerCase().indexOf(q)!==-1){r.classList.remove('hidden-by-search');vis++}
      else r.classList.add('hidden-by-search');
    });
    clr&&clr.classList.toggle('show',q.length>0);
    if(cnt)cnt.textContent=q?vis+' / '+rows.length:'';
  }
  var tmr;
  inp.addEventListener('input',function(){clearTimeout(tmr);tmr=setTimeout(filter,150);});
  clr&&clr.addEventListener('click',function(){inp.value='';filter();inp.focus();});
})();

// ========== 网格拖拽滚动 + 刊名列固定 ==========
(function(){
  document.querySelectorAll('.grid-table').forEach(function(el){
    var is=false,sx=0,sl=0;
    // 刊名列 transform 补偿（适配所有浏览器）
    function fixLabels(){
      var dx=el.scrollLeft;
      el.querySelectorAll('.grid-label').forEach(function(lb){
        lb.style.transform='translateX('+dx+'px)';
        lb.style.WebkitTransform='translateX('+dx+'px)';
      });
    }
    el.addEventListener('scroll',fixLabels);
    el.addEventListener('mousedown',function(e){
      if(e.target.closest('.gs-clickable'))return;
      is=true;el.classList.add('grabbing');sx=e.pageX-el.offsetLeft;sl=el.scrollLeft;e.preventDefault();
    });
    el.addEventListener('mouseleave',function(){is=false;el.classList.remove('grabbing');});
    el.addEventListener('mouseup',function(){is=false;el.classList.remove('grabbing');});
    el.addEventListener('mousemove',function(e){
      if(!is)return;
      var x=e.pageX-el.offsetLeft;el.scrollLeft=sl-(x-sx)*1.5;
    });
    fixLabels(); // 初始执行
  });
})();

// ========== 表格排序 ==========
function extractPct(v){var m=v.match(/(\d+(?:\.\d+)?)%/);return m?parseFloat(m[1]):NaN;}
(function(){
  function makeDivSort(containerSel,colMap){
    var header=document.querySelector(containerSel+' .analysis-col-header');
    if(!header)return;
    header.querySelectorAll('.sortable').forEach(function(th){
      th.addEventListener('click',function(){
        var colIdx=parseInt(th.getAttribute('data-sort-col'),10), table=th.closest('.analysis-table');
        if(!table)return;
        var rows=Array.from(table.querySelectorAll('.analysis-row:not(.analysis-col-header)'));
        var dir=th.getAttribute('data-sort-dir')==='asc'?'desc':'asc';
        th.setAttribute('data-sort-dir',dir);
        header.querySelectorAll('.sortable').forEach(function(s){var a=s.querySelector('.sort-arrow');if(a)a.className='sort-arrow';});
        var arrow=th.querySelector('.sort-arrow');if(arrow)arrow.classList.add(dir);
        var getVal=colMap?colMap[colIdx]:null;
        rows.sort(function(a,b){
          var ca=a.querySelectorAll('.analysis-col'),cb=b.querySelectorAll('.analysis-col');
          var va=getVal?getVal(ca[colIdx]?ca[colIdx].textContent.trim():''):(ca[colIdx]?ca[colIdx].textContent.trim():'');
          var vb=getVal?getVal(cb[colIdx]?cb[colIdx].textContent.trim():''):(cb[colIdx]?cb[colIdx].textContent.trim():'');
          var na=parseFloat(va.replace(/[^0-9.-]/g,'')),nb=parseFloat(vb.replace(/[^0-9.-]/g,''));
          if(!isNaN(na)&&!isNaN(nb))return dir==='asc'?na-nb:nb-na;
          return dir==='asc'?va.localeCompare(vb):vb.localeCompare(va);
        });
        rows.forEach(function(r){table.appendChild(r);});
      });
    });
  }
  function makeTableSort(containerSel,colMap){
    var table=document.querySelector(containerSel+' table');
    if(!table)return;
    table.querySelectorAll('th.sortable-th').forEach(function(th){
      th.addEventListener('click',function(){
        var colIdx=parseInt(th.getAttribute('data-sort-col'),10), tbody=table.querySelector('tbody')||table;
        var rows=Array.from(tbody.querySelectorAll('tr')).filter(function(r){return r.querySelector('td');});
        var dir=th.getAttribute('data-sort-dir')==='asc'?'desc':'asc';
        th.setAttribute('data-sort-dir',dir);
        table.querySelectorAll('th.sortable-th').forEach(function(s){var a=s.querySelector('.sort-arrow');if(a)a.className='sort-arrow';});
        var arrow=th.querySelector('.sort-arrow');if(arrow)arrow.classList.add(dir);
        var getVal=colMap?colMap[colIdx]:null;
        rows.sort(function(a,b){
          var ca=a.querySelectorAll('td'),cb=b.querySelectorAll('td');
          var va=getVal?getVal(ca[colIdx]?ca[colIdx].textContent.trim():''):(ca[colIdx]?ca[colIdx].textContent.trim():'');
          var vb=getVal?getVal(cb[colIdx]?cb[colIdx].textContent.trim():''):(cb[colIdx]?cb[colIdx].textContent.trim():'');
          var na=parseFloat(va.replace(/[^0-9.-]/g,'')),nb=parseFloat(vb.replace(/[^0-9.-]/g,''));
          if(!isNaN(na)&&!isNaN(nb))return dir==='asc'?na-nb:nb-na;
          return dir==='asc'?va.localeCompare(vb):vb.localeCompare(va);
        });
        rows.forEach(function(r){tbody.appendChild(r);});
      });
    });
  }
  makeDivSort('#analysis-top5');
  makeDivSort('#analysis-suspended');
  makeDivSort('#analysis-combined');
  makeDivSort('#analysis-overdue');
  makeTableSort('#detail-cn',{2:function(v){return String(extractPct(v));}});
  makeTableSort('#detail-foreign',{2:function(v){return String(extractPct(v));}});
})();

// ========== 期数网格交互 ==========
(function(){
  var overlay=null, popup=null;
  function ensurePopup(){
    if(popup)return;
    overlay=document.createElement('div');overlay.className='grid-popup-overlay';document.body.appendChild(overlay);
    popup=document.createElement('div');popup.className='grid-popup';
    popup.innerHTML='<button class="gp-close" onclick="hideGridPopup()">✕</button><div class="gp-head"><div class="gp-color-indicator" id="gpColor">1</div><div><div class="gp-title" id="gpTitle"></div><div class="gp-meta" id="gpMeta"></div></div></div><div class="gp-body" id="gpBody"></div>';
    document.body.appendChild(popup);overlay.addEventListener('click',hideGridPopup);
  }
  // 从时间线中查找到刊时间
  function findCheckInDate(name, issue){
    var items=document.querySelectorAll('.timeline-item');
    var n=name.toLowerCase();
    for(var i=0;i<items.length;i++){
      var txt=items[i].textContent.trim();
      var nm=txt.split(':')[0].trim().toLowerCase();
      if(nm!==n)continue;
      var im=txt.match(/(\d+)\s*期/);
      if(!im||im[1]!==issue)continue;
      var p=items[i].parentElement;
      while(p&&!p.classList.contains('timeline-date'))p=p.previousElementSibling;
      if(p&&p.classList.contains('timeline-date'))return p.textContent.trim();
    }
    return '—';
  }

  window.showGridDetail=function(el){
    ensurePopup();
    var title=el.getAttribute('title')||'第X期：未知',row=el.closest('.grid-row');
    var journalName=row?row.querySelector('.grid-label').textContent.trim():'',issueNum=el.textContent.trim(),bgColor=el.style.backgroundColor||'#d0d0d0';
    var statusText='未到';
    if(title.indexOf('已签收')!==-1)statusText='✓ 已签收';
    else if(title.indexOf('合刊')!==-1)statusText='≋ 合刊';
    else if(title.indexOf('停刊')!==-1)statusText='⊗ 停刊';
    var checkinDate=findCheckInDate(journalName, issueNum);
    document.getElementById('gpColor').textContent=issueNum;document.getElementById('gpColor').style.background=bgColor;
    document.getElementById('gpTitle').textContent=journalName;document.getElementById('gpMeta').textContent='第'+issueNum+'期';
    document.getElementById('gpBody').innerHTML='<div style="display:flex;flex-direction:column;gap:8px"><span class="gp-status">'+statusText+'</span><div style="font-size:13px;color:#888"><span style="color:#555;font-weight:500">到刊时间：</span>'+checkinDate+'</div></div>';
    popup.classList.add('show');overlay.classList.add('show');
  };
  window.hideGridPopup=function(){if(popup)popup.classList.remove('show');if(overlay)overlay.classList.remove('show');};
  document.addEventListener('keydown',function(e){if(e.key==='Escape')hideGridPopup();});
})();

// ========== 时间线增强 ==========
(function(){
  var search=document.getElementById('tlSearch'),monthSel=document.getElementById('tlMonth'),stats=document.getElementById('tlStats');
  if(!search)return;
  var dateHeaders=document.querySelectorAll('.timeline-date'),months=new Set();
  dateHeaders.forEach(function(d){
    var m=d.textContent.trim().match(/^(\d{4})[-年](\d{1,2})/);
    if(m)months.add(m[1]+'-'+m[2]);
    d.setAttribute('data-orig',d.textContent);
  });
  Array.from(months).sort().forEach(function(m){var opt=document.createElement('option');opt.value=m;opt.textContent=m.replace('-','年')+'月';monthSel.appendChild(opt);});
  function extractName(text){return text.split(':')[0].trim().toLowerCase();}
  function filterTimeline(){
    var q=search.value.trim().toLowerCase(),mo=monthSel.value,totalSpecies=new Set(),totalCount=0;
    dateHeaders.forEach(function(dateEl){
      var wrapper=dateEl.nextElementSibling,items=wrapper?wrapper.querySelectorAll('.timeline-item'):[],visibleCount=0,visibleSpecies=new Set();
      items.forEach(function(item){
        var name=extractName(item.textContent),show=true;
        if(q&&name.indexOf(q)===-1)show=false;
        if(mo){var m2=dateEl.textContent.match(/^(\d{4})[-年](\d{1,2})/);if(!m2||(m2[1]+'-'+m2[2])!==mo)show=false;}
        item.classList.toggle('hidden-by-tl',!show);
        if(show){visibleCount++;visibleSpecies.add(name);}
      });
      var orig=dateEl.getAttribute('data-orig')||dateEl.textContent;
      dateEl.textContent=(q||mo)?orig.replace(/（\d+）/,'（'+visibleCount+'）'):orig;
      dateEl.classList.toggle('hidden-by-tl',(q||mo)&&visibleCount===0);
      visibleSpecies.forEach(function(s){totalSpecies.add(s);});totalCount+=visibleCount;
    });
    if(stats)stats.textContent=totalCount?' '+totalSpecies.size+'种 '+totalCount+'期':'';
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
