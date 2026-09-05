const DEFAULT_PDF='./biblia.pdf';
const PAGE_KEY='voz-do-pai-biblia-page';
const canvas=document.getElementById('pdfCanvas');
const ctx=canvas.getContext('2d');
const loading=document.getElementById('loading');
const pageNumber=document.getElementById('pageNumber');
const pageCount=document.getElementById('pageCount');
const resumeLabel=document.getElementById('resumeLabel');
let pdfDoc=null,pageNum=Math.max(1,parseInt(localStorage.getItem(PAGE_KEY)||'1',10)||1),rendering=false,pendingPage=null;

pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

function savePage(){if(pdfDoc)localStorage.setItem(PAGE_KEY,String(pageNum));}
function updateControls(){pageNumber.value=pageNum;pageCount.textContent=`/ ${pdfDoc?pdfDoc.numPages:'—'}`;resumeLabel.textContent=`Página ${pageNum}${pdfDoc?' de '+pdfDoc.numPages:''} · salva automaticamente`;}
async function renderPage(num){
  if(!pdfDoc)return;
  if(num<1)num=1;if(num>pdfDoc.numPages)num=pdfDoc.numPages;
  pageNum=num;savePage();updateControls();
  if(rendering){pendingPage=num;return;}
  rendering=true;loading.textContent='Abrindo página…';loading.style.display='block';
  try{
    const page=await pdfDoc.getPage(num);
    const base=page.getViewport({scale:1});
    const maxWidth=Math.max(280,Math.min(window.innerWidth-12,1100));
    const maxHeight=Math.max(400,window.innerHeight-135);
    const scale=Math.min(maxWidth/base.width,maxHeight/base.height);
    const viewport=page.getViewport({scale});
    const ratio=window.devicePixelRatio||1;
    canvas.width=Math.floor(viewport.width*ratio);canvas.height=Math.floor(viewport.height*ratio);
    canvas.style.width=`${viewport.width}px`;canvas.style.height=`${viewport.height}px`;
    ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,viewport.width,viewport.height);
    await page.render({canvasContext:ctx,viewport}).promise;
  }catch(e){loading.textContent='Não foi possível abrir esta página.';console.error(e)}
  finally{rendering=false;loading.style.display='none';if(pendingPage&&pendingPage!==pageNum){const next=pendingPage;pendingPage=null;renderPage(next)}else pendingPage=null;}
}
async function openSource(source){
  loading.textContent='Carregando a Bíblia…';loading.style.display='block';
  try{pdfDoc=await pdfjsLib.getDocument(source).promise;if(pageNum>pdfDoc.numPages)pageNum=pdfDoc.numPages;updateControls();await renderPage(pageNum)}
  catch(e){loading.textContent='Não foi possível carregar a Bíblia. Verifique se o arquivo biblia.pdf está no repositório.';console.error(e)}
}

document.getElementById('prevPage').onclick=()=>renderPage(pageNum-1);
document.getElementById('nextPage').onclick=()=>renderPage(pageNum+1);
pageNumber.onchange=()=>renderPage(parseInt(pageNumber.value,10)||1);
document.getElementById('backBible').onclick=()=>history.length>1?history.back():(location.href='index.html');

document.getElementById('fullscreenBtn').onclick=async()=>{
  try{
    if(!document.fullscreenElement){await document.documentElement.requestFullscreen();document.getElementById('fullscreenBtn').textContent='⛶'}
    else await document.exitFullscreen();
    setTimeout(()=>renderPage(pageNum),150);
  }catch(e){console.error(e)}
};
document.addEventListener('fullscreenchange',()=>setTimeout(()=>renderPage(pageNum),100));
window.addEventListener('resize',()=>{if(pdfDoc)renderPage(pageNum)});
window.addEventListener('beforeunload',savePage);
updateControls();
openSource(DEFAULT_PDF);