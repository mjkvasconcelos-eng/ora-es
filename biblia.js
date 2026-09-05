const DEFAULT_PDF='./biblia.pdf';
const PAGE_KEY='voz-do-pai-biblia-page';
const canvas=document.getElementById('pdfCanvas');
const ctx=canvas.getContext('2d');
const loading=document.getElementById('loading');
const pageNumber=document.getElementById('pageNumber');
const pageCount=document.getElementById('pageCount');
const resumeLabel=document.getElementById('resumeLabel');
const page=document.querySelector('.bible-page');
let pdfDoc=null,pageNum=Math.max(1,parseInt(localStorage.getItem(PAGE_KEY)||'1',10)||1),rendering=false,pendingPage=null,hideTimer=null;
pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
function savePage(){if(pdfDoc)localStorage.setItem(PAGE_KEY,String(pageNum));}
function updateControls(){pageNumber.value=pageNum;pageCount.textContent=`/ ${pdfDoc?pdfDoc.numPages:'—'}`;resumeLabel.textContent=`Página ${pageNum}${pdfDoc?' de '+pdfDoc.numPages:''} · salva automaticamente`;}
function showControls(){page.classList.remove('controls-hidden');clearTimeout(hideTimer);hideTimer=setTimeout(()=>page.classList.add('controls-hidden'),4000)}
function hideControls(){clearTimeout(hideTimer);page.classList.add('controls-hidden')}
function toggleControls(){page.classList.contains('controls-hidden')?showControls():hideControls()}
async function renderPage(num){if(!pdfDoc)return;if(num<1)num=1;if(num>pdfDoc.numPages)num=pdfDoc.numPages;pageNum=num;savePage();updateControls();if(rendering){pendingPage=num;return}rendering=true;loading.textContent='Abrindo página…';loading.style.display='block';try{const pdfPage=await pdfDoc.getPage(num);const base=pdfPage.getViewport({scale:1});const maxWidth=Math.max(280,Math.min(window.innerWidth-12,1100));const maxHeight=Math.max(400,window.innerHeight-12);const scale=Math.min(maxWidth/base.width,maxHeight/base.height);const viewport=pdfPage.getViewport({scale});const ratio=window.devicePixelRatio||1;canvas.width=Math.floor(viewport.width*ratio);canvas.height=Math.floor(viewport.height*ratio);canvas.style.width=`${viewport.width}px`;canvas.style.height=`${viewport.height}px`;ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,viewport.width,viewport.height);await pdfPage.render({canvasContext:ctx,viewport}).promise}catch(e){loading.textContent='Não foi possível abrir esta página.';console.error(e)}finally{rendering=false;loading.style.display='none';if(pendingPage&&pendingPage!==pageNum){const next=pendingPage;pendingPage=null;renderPage(next)}else pendingPage=null}}
async function openSource(source){loading.textContent='Carregando a Bíblia…';loading.style.display='block';try{pdfDoc=await pdfjsLib.getDocument(source).promise;if(pageNum>pdfDoc.numPages)pageNum=pdfDoc.numPages;updateControls();await renderPage(pageNum);showControls()}catch(e){loading.textContent='Não foi possível carregar a Bíblia. Verifique se o arquivo biblia.pdf está no repositório.';console.error(e)}}
document.getElementById('prevPage').onclick=e=>{e.stopPropagation();renderPage(pageNum-1);showControls()};
document.getElementById('nextPage').onclick=e=>{e.stopPropagation();renderPage(pageNum+1);showControls()};
pageNumber.onchange=e=>{e.stopPropagation();renderPage(parseInt(pageNumber.value,10)||1);showControls()};
document.getElementById('backBible').onclick=e=>{e.stopPropagation();history.length>1?history.back():(location.href='index.html')};
document.getElementById('fullscreenBtn').onclick=async e=>{e.stopPropagation();try{if(!document.fullscreenElement)await document.documentElement.requestFullscreen();else await document.exitFullscreen();setTimeout(()=>renderPage(pageNum),150);showControls()}catch(err){console.error(err)}};
document.getElementById('reader').addEventListener('click',e=>{if(e.target===canvas||e.target.id==='reader')toggleControls()});
document.addEventListener('touchend',e=>{if(e.target.closest('.bible-overlay'))return;toggleControls()},{passive:true});
document.addEventListener('fullscreenchange',()=>setTimeout(()=>renderPage(pageNum),100));
window.addEventListener('resize',()=>{if(pdfDoc)renderPage(pageNum)});window.addEventListener('beforeunload',savePage);updateControls();hideControls();openSource(DEFAULT_PDF);