const express=require('express');
const {Pool}=require('pg');
const app=express();
const PORT=process.env.PORT||3000;
const pool=new Pool({connectionString:process.env.DATABASE_URL,ssl:process.env.DATABASE_SSL==='false'?false:{rejectUnauthorized:false}});
app.use(express.json({limit:'50kb'}));
app.use((req,res,next)=>{res.header('Access-Control-Allow-Origin','*');res.header('Access-Control-Allow-Headers','Content-Type');res.header('Access-Control-Allow-Methods','GET,POST,OPTIONS');if(req.method==='OPTIONS')return res.sendStatus(204);next()});
async function init(){if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL não configurada');await pool.query(`CREATE TABLE IF NOT EXISTS bible_videos(id BIGSERIAL PRIMARY KEY,livro TEXT NOT NULL,capitulo INTEGER NOT NULL,titulo TEXT DEFAULT '',url TEXT NOT NULL,created_at TIMESTAMPTZ DEFAULT NOW())`)}
app.get('/health',(req,res)=>res.json({ok:true,service:'voz-do-pai'}));
app.get('/videos-biblia',async(req,res)=>{try{const r=await pool.query('SELECT id,livro,capitulo,titulo,url,created_at FROM bible_videos ORDER BY CASE livro WHEN \'Gênesis\' THEN 1 WHEN \'Êxodo\' THEN 2 ELSE 999 END,capitulo,created_at');res.json(r.rows)}catch(e){console.error(e);res.status(500).json({error:'falha_no_banco'})}});
app.post('/videos-biblia',async(req,res)=>{try{const {livro,capitulo,titulo='',url}=req.body||{};if(!livro||!Number.isInteger(Number(capitulo))||Number(capitulo)<1||!url)return res.status(400).json({error:'dados_incompletos'});if(!/^https?:\\/\\/(www\\.)?tiktok\\.com\\//i.test(url))return res.status(400).json({error:'link_tiktok_invalido'});const r=await pool.query('INSERT INTO bible_videos(livro,capitulo,titulo,url) VALUES($1,$2,$3,$4) RETURNING id,livro,capitulo,titulo,url,created_at',[String(livro).slice(0,80),Number(capitulo),String(titulo).slice(0,120),String(url).slice(0,500)]);res.status(201).json(r.rows[0])}catch(e){console.error(e);res.status(500).json({error:'falha_no_banco'})}});
init().then(()=>app.listen(PORT,()=>console.log(`Voz do Pai backend na porta ${PORT}`))).catch(e=>{console.error(e);process.exit(1)});