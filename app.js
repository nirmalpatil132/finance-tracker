const $ = (s) => document.querySelector(s);
const dialog = $('#invoiceDialog');
const form = $('#invoiceForm');
const categories = { food: ['restaurant','cafe','café','swiggy','zomato','grocery','food','pizza','bakery','market'], fuel: ['fuel','petrol','diesel','gas','shell','indian oil','hpcl','bpcl'], fun: ['movie','cinema','game','concert','fun','netflix','spotify','bookmyshow'] };
let expenses = JSON.parse(localStorage.getItem('ledgerly-expenses') || '[]');

function money(n){ return new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n); }
function suggest(text){ text=text.toLowerCase(); return Object.entries(categories).find(([,words])=>words.some(w=>text.includes(w)))?.[0] || 'fun'; }
function render(){
  const total=expenses.reduce((s,e)=>s+e.amount,0); $('#totalSpent').textContent=money(total); $('#invoiceCount').textContent=`${expenses.length} invoice${expenses.length===1?'':'s'} this month`;
  ['food','fuel','fun'].forEach(c=>{const amount=expenses.filter(e=>e.category===c).reduce((s,e)=>s+e.amount,0); $(`#${c}Total`).textContent=money(amount); $(`#${c}Share`).textContent=`${total?Math.round(amount/total*100):0}% of spending`;});
  const list=$('#expenseList'), empty=$('#emptyState'); empty.hidden=expenses.length>0; list.hidden=!expenses.length;
  list.innerHTML=expenses.slice().reverse().map(e=>`<article class="expense"><div class="file-badge">${e.fileType==='pdf'?'PDF':'▧'}</div><div><div class="expense-title">${escapeHtml(e.merchant)}</div><div class="expense-meta">${new Date(e.date+'T00:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})} · ${escapeHtml(e.fileName)}</div></div><div class="expense-amount">${money(e.amount)}<div class="tag">${e.category}</div></div></article>`).join('');
}
function escapeHtml(s){return s.replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function openDialog(){form.reset(); $('#expenseDate').value=new Date().toISOString().slice(0,10); $('#fileLabel').textContent='Choose an invoice'; dialog.showModal();}
$('#uploadButton').onclick=openDialog; document.querySelector('[data-upload]').onclick=openDialog; $('#closeDialog').onclick=()=>dialog.close();
$('#fileInput').onchange=(e)=>{const f=e.target.files[0]; if(!f)return; $('#fileLabel').textContent=f.name; const text=`${f.name} ${$('#merchant').value}`; $('#category').value=suggest(text); if(!$('#merchant').value) $('#merchant').value=f.name.replace(/\.[^.]+$/,'').replace(/[-_]/g,' ');};
$('#merchant').oninput=(e)=>$('#category').value=suggest(e.target.value+' '+$('#fileInput').value);
form.onsubmit=(e)=>{e.preventDefault(); const f=$('#fileInput').files[0]; if(!f){$('#fileLabel').textContent='Please choose an invoice first'; return;} if(f.size>10*1024*1024){$('#fileLabel').textContent='File must be under 10MB';return;} expenses.push({merchant:$('#merchant').value.trim(),amount:Number($('#amount').value),date:$('#expenseDate').value,category:$('#category').value,fileName:f.name,fileType:f.type==='application/pdf'?'pdf':'image'});localStorage.setItem('ledgerly-expenses',JSON.stringify(expenses));dialog.close();render();};
$('#clearButton').onclick=()=>{if(expenses.length&&confirm('Remove all saved expenses?')){expenses=[];localStorage.removeItem('ledgerly-expenses');render();}};
render();
