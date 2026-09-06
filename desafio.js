// Desafio 7 Dias com Deus — progresso salvo no aparelho
(function(){
  const KEY='voz-do-pai-desafio-7-dias';
  const days=[
    ['Dia 1','Começar com gratidão','Agradeça a Deus por três coisas.'],
    ['Dia 2','Entregar as preocupações','Faça uma oração entregando a Deus aquilo que pesa no coração.'],
    ['Dia 3','Orar pela família','Separe alguns minutos para apresentar sua família a Deus.'],
    ['Dia 4','Ler a Palavra','Leia um capítulo da Bíblia com calma e atenção.'],
    ['Dia 5','Pedir direção','Peça sabedoria para suas decisões e para os próximos passos.'],
    ['Dia 6','Praticar o amor','Faça hoje uma atitude de bondade por alguém.'],
    ['Dia 7','Celebrar e continuar','Agradeça por estes sete dias e entregue o próximo ciclo a Deus.']
  ];
  function load(){try{return JSON.parse(localStorage.getItem(KEY))||{done:[]}}catch(e){return{done:[]}}}
  function save(s){localStorage.setItem(KEY,JSON.stringify(s))}
  function render(){
    const wrap=document.getElementById('challengeDays'),bar=document.getElementById('challengeBar'),pct=document.getElementById('challengePercent'),status=document.getElementById('challengeStatus');
    if(!wrap)return;
    const state=load(); const done=new Set(state.done||[]); const count=done.size; const percent=Math.round(count/7*100);
    wrap.innerHTML=days.map((d,i)=>`<button class="challenge-day ${done.has(i)?'done':''}" data-day="${i}" aria-label="${d[0]}: ${d[1]}"><span class="day-circle">${done.has(i)?'✓':i+1}</span><b>${d[0]}</b><small>${d[1]}</small></button>`).join('');
    if(bar)bar.style.width=percent+'%'; if(pct)pct.textContent=percent+'%';
    if(status)status.textContent=count===7?'🎉 Desafio concluído! Você completou os 7 dias.':count===0?'Comece hoje. Um dia de cada vez.':`${count} de 7 dias concluídos. Continue firme!`;
    wrap.querySelectorAll('.challenge-day').forEach(btn=>btn.addEventListener('click',()=>toggle(Number(btn.dataset.day))));
  }
  function toggle(i){const s=load();let a=new Set(s.done||[]);if(a.has(i))a.delete(i);else a.add(i);s.done=[...a].sort((x,y)=>x-y);save(s);render();}
  function reset(){if(confirm('Deseja recomeçar o desafio de 7 dias?')){save({done:[]});render()}}
  document.addEventListener('DOMContentLoaded',()=>{render();document.getElementById('challengeReset')?.addEventListener('click',reset)});
})();