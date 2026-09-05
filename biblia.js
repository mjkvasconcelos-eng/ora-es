const DEFAULT_PDF='https://archive.org/download/bibliasagradacon00alme/bibliasagradacon00alme.pdf';
const PAGE_KEY='voz-do-pai-biblia-page';
const PDF_KEY='voz-do-pai-biblia-source';
const canvas=document.getElementById('pdfCanvas');
const ctx=canvas.getContext('2d');
const loading=document.getElementById('loading');
const pageNumber=document.getElementById('pageNumber');
const pageCount=document.getElementById('pageCount');
const resumeLabel=document.getElementById('resumeLabel');
let pdfDoc=null,pageNum=Math.max(1,parseInt(localStorage.getItem(PAGE_KEY)||'1',10)||1),rendering=false,pendingPage=null,objectUrl=null;

if(window.pdfjsLib){pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';}

function savePage(){if(pdfDoc)localStorage.setItem(PAGE_KEY,String(pageNum));}
function updateControls(){pageNumber.value=pageNum;pageCount.textContent=`/ ${pdfDoc?pdfDoc.numPages:'—'}`;resumeLabel.textContent=`Página ${pageNum}${pdfDoc?' de '+pdfDoc.numPages:''} · salva automaticamente`;}
async function renderPage(num){
  if(!pdfDoc)return;
  if(num<1)num=1;if(num>pdfDoc.numPages)num=pdfDoc.numPages;
  pageNum=num;savePage();updateControls();
  if(rendering){pendingPage=num;return;}
  rendering=true;loading.textContent='Abrindo página…';loading.style.display='block';
  try{
    const page=await pdfDoc.getPage(num);const viewport=page.getViewport({scale:1.45});
    const maxWidth=Math.min(window.innerWidth-24,900);const scale=Math.min(1.45,maxWidth/viewport.width);const v=page.getViewport({scale});
    const ratio=window.devicePixelRatio||1;canvas.width=Math.floor(v.width*ratio);canvas.height=Math.floor(v.height*ratio);canvas.style.width=`${v.width}px`;canvas.style.height=`${v.height}px`;
    ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,v.width,v.height);
    await page.render({canvasContext:ctx,viewport:v}).promise;
  }catch(e){loading.textContent='Não foi possível abrir esta página. Tente novamente.';console.error(e)}
  finally{rendering=false;loading.style.display='none';if(pendingPage&&pendingPage!==pageNum){const next=pendingPage;pendingPage=null;renderPage(next)}else pendingPage=null;}
}
async function openSource(source){
  loading.textContent='Carregando a Bíblia…';loading.style.display='block';
  try{pdfDoc=await pdfjsLib.getDocument(source).promise;if(pageNum>pdfDoc.numPages)pageNum=pdfDoc.numPages;updateControls();await renderPage(pageNum);}catch(e){loading.textContent='Não foi possível carregar este PDF. Você pode selecionar um PDF da Bíblia no botão ＋.';console.error(e)}
}

document.getElementById('prevPage').onclick=()=>renderPage(pageNum-1);
document.getElementById('nextPage').onclick=()=>renderPage(pageNum+1);
pageNumber.onchange=()=>renderPage(parseInt(pageNumber.value,10)||1);
document.getElementById('continueBtn').onclick=()=>renderPage(parseInt(localStorage.getItem(PAGE_KEY)||'1',10)||1);
document.getElementById('resetBtn').onclick=()=>{pageNum=1;savePage();renderPage(1)};
document.getElementById('backBible').onclick=()=>history.length>1?history.back():(location.href='index.html');
document.getElementById('pdfFile').onchange=e=>{const file=e.target.files&&e.target.files[0];if(!file)return;if(objectUrl)URL.revokeObjectURL(objectUrl);objectUrl=URL.createObjectURL(file);pageNum=1;localStorage.setItem(PAGE_KEY,'1');localStorage.setItem(PDF_KEY,file.name);openSource(objectUrl)};
window.addEventListener('resize',()=>{if(pdfDoc)renderPage(pageNum)});
window.addEventListener('beforeunload',savePage);
updateControls();
openSource(DEFAULT_PDF);