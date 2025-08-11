const STORAGE_KEY = 'kayan_miya_items_v2';

const DEFAULT_ITEMS = [
  { name: 'Attaruhu', purchasePrice: 1000, portionPrice: 50, qty: 0 },
  { name: 'Tumatur', purchasePrice: 1000, portionPrice: 150, qty: 0 },
  { name: 'Tattasai', purchasePrice: 1500, portionPrice: 100, qty: 0 },
  { name: 'Albasa me laushi', purchasePrice: 500, portionPrice: 50, qty: 0 },
  { name: 'Albasa', purchasePrice: 500, portionPrice: 50, qty: 0 },
  { name: 'Latas', purchasePrice: 500, portionPrice: 50, qty: 0 },
  { name: 'Alayyahu', purchasePrice: 300, portionPrice: 50, qty: 0 },
  { name: 'Spices Mix', purchasePrice: 400, portionPrice: 50, qty: 0 }
];

let items = loadItems();

function loadItems(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw) return JSON.parse(raw);
  }catch(e){ console.warn('load error', e); }
  return JSON.parse(JSON.stringify(DEFAULT_ITEMS));
}

function saveItems(){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }
  catch(e){ console.error('save failed', e); }
}

function currency(v){ return '₦' + Number(v||0).toLocaleString(); }

function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[c]); }

function render(){
  const tbody = document.querySelector('#itemsTable tbody');
  tbody.innerHTML = '';
  items.forEach((it, idx) => {
    const totalSales = (it.qty||0)*(it.portionPrice||0);
    const profit = (it.qty||0)*((it.portionPrice||0)-(it.purchasePrice||0));
    const tr = document.createElement('tr');
    tr.dataset.idx = idx;
    tr.innerHTML = `
      <td>${escapeHtml(it.name)}</td>
      <td>
        <input class="price-edit" data-idx="${idx}" type="number" value="${it.portionPrice||0}" min="0" step="1"/>
        <div style="color:#6b7280;font-size:12px">cost ₦${it.purchasePrice||0}</div>
      </td>
      <td>
        <div class="qtybox">
          <button class="iconbtn" data-action="minus" data-idx="${idx}">−</button>
          <div style="min-width:48px;text-align:center;font-weight:700" id="qty-${idx}">${it.qty||0}</div>
          <button class="iconbtn" data-action="plus" data-idx="${idx}">+</button>
          <input class="small" style="width:72px;margin-left:6px" data-idx="${idx}" type="number" min="0" value="${it.qty||0}" title="Set qty directly"/>
        </div>
      </td>
      <td class="right">${currency(totalSales)}</td>
      <td class="right">${currency(profit)}</td>
      <td class="right">
        <button class="small" data-action="editCost" data-idx="${idx}">Edit Cost</button>
        <button class="small" data-action="delete" data-idx="${idx}">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // attach events
  tbody.querySelectorAll('button[data-action]').forEach(b=> b.onclick = onActionClick);
  tbody.querySelectorAll('.price-edit').forEach(i=> i.onchange = onPriceChange);
  tbody.querySelectorAll('input[title]').forEach(i=> i.onchange = onQtyInput);

  updateTotals();
  saveItems();
}

function onQtyInput(e){
  const idx = Number(e.target.dataset.idx);
  const v = Math.max(0, Math.floor(Number(e.target.value)||0));
  items[idx].qty = v; render();
}

function onPriceChange(e){
  const idx = Number(e.target.dataset.idx);
  const v = Math.max(0, Math.round(Number(e.target.value)||0));
  items[idx].portionPrice = v; render();
}

function onActionClick(e){
  const idx = Number(e.target.dataset.idx);
  const action = e.target.dataset.action;
  if(action === 'plus'){ items[idx].qty = (items[idx].qty||0)+1; render(); }
  else if(action === 'minus'){ items[idx].qty = Math.max(0,(items[idx].qty||0)-1); render(); }
  else if(action === 'delete'){ if(confirm('Delete this item?')){ items.splice(idx,1); render(); } }
  else if(action === 'editCost'){ const v = prompt('Enter purchase cost (₦):', items[idx].purchasePrice||0); if(v!==null){ items[idx].purchasePrice = Math.round(Number(v)||0); render(); } }
}

function updateTotals(){
  const tot = items.reduce((a,it)=>{ a.qty+=it.qty||0; a.sales+= (it.qty||0)*(it.portionPrice||0); a.profit += (it.qty||0)*((it.portionPrice||0)-(it.purchasePrice||0)); return a; }, {qty:0,sales:0,profit:0});
  document.getElementById('totalQty').textContent = tot.qty;
  document.getElementById('totalSales').textContent = currency(tot.sales);
  document.getElementById('totalProfit').textContent = currency(tot.profit);
}

/* actions */
document.getElementById('addBtn').addEventListener('click', ()=>{
  const n = document.getElementById('newName').value.trim();
  const p = Math.round(Number(document.getElementById('newPrice').value)||0);
  if(!n || p<=0){ alert('Please enter a valid name and price (>=1).'); return; }
  items.push({ name: n, purchasePrice: 0, portionPrice: p, qty: 0 });
  document.getElementById('newName').value=''; document.getElementById('newPrice').value='';
  render();
});

document.getElementById('resetBtn').addEventListener('click', ()=>{
  if(!confirm('Reset all portion counts to zero?')) return;
  items.forEach(it=>it.qty=0); render();
});

document.getElementById('clearAllBtn').addEventListener('click', ()=>{
  if(!confirm('Clear all data (items and counts)?')) return;
  localStorage.removeItem(STORAGE_KEY); items = loadItems(); render();
});

document.getElementById('exportCsv').addEventListener('click', ()=>{
  const rows = [['name','purchasePrice','portionPrice','qty','totalSales','profit']];
  items.forEach(it=> rows.push([it.name, it.purchasePrice||0, it.portionPrice||0, it.qty||0, (it.qty||0)*(it.portionPrice||0), (it.qty||0)*((it.portionPrice||0)-(it.purchasePrice||0)) ]));
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'portion_export_'+new Date().toISOString().slice(0,10)+'.csv';
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
});

/* boot */
document.addEventListener('DOMContentLoaded', ()=>{ render(); document.getElementById('newName').focus(); });
