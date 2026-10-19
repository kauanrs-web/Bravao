
'use strict';
(() => {
  const $ = (s,root=document) => root.querySelector(s);
  const $$ = (s,root=document) => [...root.querySelectorAll(s)];
  const cfg = window.BRAVO_CONFIG;
  const services={corte:{name:'Corte masculino',price:45,duration:40},combo:{name:'Corte + barba',price:75,duration:70},barba:{name:'Barba na régua',price:35,duration:30},infantil:{name:'Corte infantil',price:40,duration:40}};
  const money = value => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(value);
  $('#year').textContent = new Date().getFullYear();
  const menu=$('.menu-toggle'),nav=$('#main-nav');
  function closeMenu(){menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Abrir menu');nav.classList.remove('is-open');}
  menu.addEventListener('click',()=>{const opened=menu.getAttribute('aria-expanded')==='true';menu.setAttribute('aria-expanded',String(!opened));menu.setAttribute('aria-label',opened?'Abrir menu':'Fechar menu');nav.classList.toggle('is-open',!opened)});
  $$('.nav a').forEach(a=>a.addEventListener('click',closeMenu));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('is-open')){closeMenu();menu.focus()}});
  document.addEventListener('click',e=>{if(!e.target.closest('.header'))closeMenu()});
  $$('.faq-question').forEach(button=>button.addEventListener('click',()=>{const open=button.getAttribute('aria-expanded')==='true';$$('.faq-question').forEach(b=>{b.setAttribute('aria-expanded','false');$('#'+b.getAttribute('aria-controls')).hidden=true});if(!open){button.setAttribute('aria-expanded','true');$('#'+button.getAttribute('aria-controls')).hidden=false}}));
  let lastFocus=null;
  function openModal(modal){lastFocus=document.activeElement;closeMenu();modal.showModal();document.body.classList.add('no-scroll');}
  $$('dialog').forEach(modal=>{modal.addEventListener('close',()=>{document.body.classList.remove('no-scroll');lastFocus?.focus()});modal.addEventListener('click',e=>{if(e.target===modal){const r=modal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)modal.close()}});$$('[data-close]',modal).forEach(b=>b.addEventListener('click',()=>modal.close()));});
  const booking=$('#booking-modal');let step=0,selectedTime='';
  const todayInBrazil=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const dateISO=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  function updateDateBounds(){const today=todayInBrazil();$('#date').min=today;const end=new Date(today+'T12:00:00');end.setDate(end.getDate()+60);$('#date').max=dateISO(end);return today;}
  function validDate(){const value=$('#date').value;return Boolean(value&&value>=$('#date').min&&value<=$('#date').max&&new Date(value+'T12:00:00').getDay()!==0);}
  function renderTimes(){
    selectedTime='';$('#time-grid').replaceChildren();const date=$('#date').value;
    if(!date)return;
    const day=new Date(date+'T12:00:00').getDay();
    if(day===0){$('#availability-note').textContent='Aos domingos fazemos uma pausa. Escolha outro dia.';return;}
    if(!validDate()){$('#availability-note').textContent='Escolha uma data entre hoje e os próximos 60 dias.';return;}
    const duration=services[$('#service').value].duration;
    const closing=day===6?18*60:20*60;
    const nowParts=new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date());
    const currentMinutes=Number(nowParts.find(x=>x.type==='hour').value)*60+Number(nowParts.find(x=>x.type==='minute').value);
    let available=0;
    for(let minute=9*60;minute+duration<=closing;minute+=60){if(date===todayInBrazil()&&minute<=currentMinutes+30)continue;const t=`${String(Math.floor(minute/60)).padStart(2,'0')}:${String(minute%60).padStart(2,'0')}`;const b=document.createElement('button');b.type='button';b.className='time-btn';b.textContent=t;b.setAttribute('aria-pressed','false');b.addEventListener('click',()=>{selectedTime=t;$$('.time-btn').forEach(item=>{item.classList.toggle('selected',item===b);item.setAttribute('aria-pressed',String(item===b))});$('#booking-error').hidden=true});$('#time-grid').append(b);available++;}
    $('#availability-note').textContent=available?'Demonstração: estes horários não consultam uma agenda real.':'Não há horários de exemplo restantes neste dia. Escolha outra data.';
  }
  function showError(text){$('#booking-error').textContent=text;$('#booking-error').hidden=false;}
  function renderSummary(){const s=services[$('#service').value];const date=new Intl.DateTimeFormat('pt-BR',{dateStyle:'medium'}).format(new Date($('#date').value+'T12:00:00'));const rows=[['Serviço',s.name],['Profissional',$('#professional').value],['Data e horário',date+' às '+selectedTime],['Duração',s.duration+' minutos'],['Valor',money(s.price)]];$('#booking-summary').replaceChildren();rows.forEach(([label,value])=>{const row=document.createElement('div');row.className='summary-row';const key=document.createElement('span');key.textContent=label;const val=document.createElement('strong');val.textContent=value;row.append(key,val);$('#booking-summary').append(row)});}
  function showStep(){
    $('#booking-step-label').hidden=false;$('#booking-step-label').textContent='Etapa '+(step+1)+' de 3 · '+['Serviço','Horário','Resumo'][step];const chosen=services[$('#service').value];$('#booking-service-name').textContent=chosen.name;$('#booking-service-value').textContent=money(chosen.price)+' · '+chosen.duration+' min';
    $$('[data-step]').forEach(el=>el.hidden=Number(el.dataset.step)!==step);$$('.steps li').forEach((el,i)=>{el.classList.toggle('current',i<=step);if(i===step)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current')});$('#prev-step').hidden=step===0;$('#booking-error').hidden=true;$('#booking-title').textContent=['Escolha o serviço.','Escolha o horário.','Confira seu agendamento.'][step];$('#next-step').textContent=['Escolher horário','Revisar agendamento',cfg.demo?'Concluir simulação':'Solicitar pelo WhatsApp'][step];if(step===2)renderSummary();
    const focus=$('[data-step="'+step+'"] select, [data-step="'+step+'"] input');focus?.focus({preventScroll:true});
  }
  $$('[data-book]').forEach(button=>button.addEventListener('click',()=>{step=0;$('#booking-form').reset();$('#service').value=button.dataset.book||'corte';const today=updateDateBounds();const start=new Date(today+'T12:00:00');if(start.getDay()===0)start.setDate(start.getDate()+1);$('#date').value=dateISO(start);renderTimes();$('#booking-form').hidden=false;$('.steps').hidden=false;$('#booking-success').hidden=true;$('#confirm-note').textContent=cfg.demo?'Você está testando uma barbearia fictícia. Nenhuma reserva será criada e seus dados não serão enviados.':'Ao continuar, o WhatsApp abrirá com seu pedido. Envie a mensagem e aguarde a equipe confirmar a disponibilidade.';openModal(booking);showStep();}));
  $('#date').addEventListener('change',renderTimes);$('#service').addEventListener('change',renderTimes);$('#professional').addEventListener('change',renderTimes);
  $('#prev-step').addEventListener('click',()=>{step=Math.max(0,step-1);showStep()});
  function advance(){
    if(step===0){step=1;showStep();return;}
    if(step===1){updateDateBounds();if(!validDate()){showError('Escolha uma data válida. Não atendemos aos domingos.');return;}if(!selectedTime){showError('Escolha um dos horários para continuar.');return;}step=2;showStep();return;}
    if(cfg.demo){$('#booking-step-label').hidden=true;$('#booking-form').hidden=true;$('.steps').hidden=true;$('#booking-title').textContent='Simulação concluída.';$('#booking-success').hidden=false;$('#booking-success button').focus();return;}
    if(!validWhatsApp()){showError('O atendimento ainda não está conectado. Peça ao responsável para configurar o WhatsApp.');return;}
    const s=services[$('#service').value];const name=$('#client-name').value.trim();const message=`Olá, Bravo! ${name?'Meu nome é '+name+'. ':''}Gostaria de solicitar: ${s.name} (${money(s.price)}), dia ${$('#date').value.split('-').reverse().join('/')} às ${selectedTime}, com ${$('#professional').value}. Podem confirmar a disponibilidade?`;
    const a=document.createElement('a');a.href='https://wa.me/'+cfg.whatsapp+'?text='+encodeURIComponent(message);a.target='_blank';a.rel='noopener noreferrer';document.body.append(a);a.click();a.remove();
  }
  $('#next-step').addEventListener('click',advance);$('#booking-form').addEventListener('submit',e=>{e.preventDefault();advance()});
  function info(title,html){$('#info-title').textContent=title;$('#info-content').innerHTML=html;openModal($('#info-modal'));}
  function validWhatsApp(){return /^\d{10,15}$/.test(cfg.whatsapp);}
  $$('[data-whatsapp]').forEach(b=>b.addEventListener('click',()=>{if(!cfg.demo&&validWhatsApp()){window.open('https://wa.me/'+cfg.whatsapp+'?text='+encodeURIComponent('Olá! Quero saber mais sobre os serviços da Bravo.'),'_blank','noopener,noreferrer');}else info('Uma conversa muda o visual.','<p>Esta é a Bravo, uma barbearia fictícia. O atendimento pelo WhatsApp está preparado para ser conectado ao número de uma barbearia real.</p><p style="margin-top:16px">Enquanto isso, explore os serviços e teste a escolha de horários.</p>');}));
  $('[data-route]')?.addEventListener('click',()=>{if(!cfg.demo&&/^https:\/\/(www\.)?(google\.com\/maps|maps\.google\.com|maps\.app\.goo\.gl)\//.test(cfg.maps)){window.open(cfg.maps,'_blank','noopener,noreferrer');}else info('Um endereço para o seu estilo.','<p>Rua do Estilo, 120 · Centro · Tubarão, SC.</p><p style="margin-top:16px">Este endereço é fictício e não representa um estabelecimento real. O mapa pode ser conectado à localização da sua barbearia.</p>');});
  $('[data-privacy]').addEventListener('click',()=>info('Sua privacidade.','<h3>Dados da simulação</h3><p>As escolhas e o nome digitado permanecem apenas na memória desta página durante a visita. A demonstração não envia nem armazena reservas.</p><h3>Cookies opcionais</h3><p>Google Analytics e Microsoft Clarity só são carregados quando você aceita análise e os IDs reais estão configurados. Formulários são mascarados para o Clarity. Sua preferência de cookies é salva neste navegador por até 180 dias. A escolha de pausar animações também é salva neste dispositivo, até ser alterada ou os dados do site serem apagados.</p><h3>Contato pelo WhatsApp</h3><p>Quando configurado para uma empresa real, o botão abre o WhatsApp com uma mensagem que você decide enviar. O tratamento dos dados nesse serviço segue a política do próprio WhatsApp.</p><h3>Alterar sua escolha</h3><p>Use “Preferências de cookies” no rodapé para aceitar ou recusar análise. Esta demonstração não possui ferramentas de análise ativas.</p>'));

  $('.strip-toggle')?.addEventListener('click',()=>{const strip=$('.strip');const paused=strip.classList.toggle('is-paused');$('.strip-toggle').setAttribute('aria-pressed',String(paused));$('.strip-toggle').setAttribute('aria-label',paused?'Retomar animação da faixa':'Pausar animação da faixa');});
  const copyAddress=$('[data-copy-address]');
  copyAddress?.addEventListener('click',async()=>{const text='Rua do Estilo, 120 · Centro · Tubarão, SC (endereço fictício)';try{await navigator.clipboard.writeText(text);$('#address-feedback').textContent='Endereço copiado. Lembre-se: é um endereço fictício.';}catch{$('#address-feedback').textContent=text;}});
  function updateOpeningStatus(){
    const parts=new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',weekday:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date());
    const read=type=>parts.find(p=>p.type===type)?.value;
    const day=read('weekday');const minutes=Number(read('hour'))*60+Number(read('minute'));const sunday=day.startsWith('dom'),saturday=day.startsWith('sáb');const closing=saturday?18*60:20*60;
    const open=!sunday&&minutes>=540&&minutes<closing;
    $$('[data-opening-status]').forEach(el=>{el.classList.toggle('is-open',open);el.querySelector('span:last-child').textContent=sunday?'Domingo · retornamos segunda às 09h':open?'Hoje · atendimento até '+(saturday?'18h':'20h'):minutes<540?'Hoje · abrimos às 09h':'Atendimento encerrado por hoje';});
    $$('[data-hours]').forEach(el=>el.classList.toggle('is-today',el.dataset.hours===(sunday?'domingo':saturday?'sabado':'semana')));
  }
  updateOpeningStatus();
  const contactForm=$('#contact-form');
  if(contactForm){
    const message=$('#contact-message'),counter=$('#message-count'),result=$('#contact-result');
    $('.contact-privacy').textContent=cfg.demo?'Nesta demonstração, a mensagem não é enviada nem armazenada. Seus dados permanecem nesta página durante a visita.':'Ao continuar, o WhatsApp abrirá com a mensagem preparada. Você decide enviá-la para iniciar a conversa.';
    const submit=$('#contact-submit');submit.textContent=cfg.demo?'Testar envio da mensagem':'Continuar no WhatsApp';
    message.addEventListener('input',()=>{counter.textContent=message.value.length+' / 1000';result.hidden=true;});
    contactForm.addEventListener('submit',event=>{
      event.preventDefault();if(!contactForm.reportValidity())return;
      if($('#contact-name').value.trim().length<2||message.value.trim().length<10){result.textContent='Informe um nome com pelo menos 2 letras e uma mensagem com pelo menos 10 caracteres.';result.hidden=false;return;}
      if(cfg.demo){result.textContent='Simulação concluída! Sua mensagem foi validada, mas não foi enviada. Esta é uma barbearia fictícia.';result.hidden=false;result.focus();return;}
      if(!validWhatsApp()){result.textContent='O canal de atendimento ainda não foi conectado. Tente novamente após a configuração da barbearia.';result.hidden=false;return;}
      const text='Olá, Bravo! Meu nome é '+$('#contact-name').value.trim()+'. Assunto: '+$('#contact-subject').value+'. '+message.value.trim();
      const link=document.createElement('a');link.href='https://wa.me/'+cfg.whatsapp+'?text='+encodeURIComponent(text);link.target='_blank';link.rel='noopener noreferrer';document.body.append(link);link.click();link.remove();result.textContent='Continue no WhatsApp e envie a mensagem para iniciar a conversa.';result.hidden=false;
    });
  }

  let consent=null;try{const stored=JSON.parse(localStorage.getItem('bravo-consent')||'null');if(stored&&Date.now()-stored.time<180*86400000)consent=stored.value;}catch{}
  const configured=(cfg.ga4!=='G-XXXXXXXXXX'||cfg.clarity!=='SEU_ID_CLARITY');
  if(consent==='accepted')window.startBravoAnalytics();else if(!consent&&configured)$('#cookie-banner').hidden=false;
  function setConsent(value){if(value==='accepted')window['ga-disable-'+cfg.ga4]=false;try{localStorage.setItem('bravo-consent',JSON.stringify({value,time:Date.now()}));}catch{}$('#cookie-banner').hidden=true;if(value==='accepted'){window.startBravoAnalytics();}else{window['ga-disable-'+cfg.ga4]=true;gtag('consent','update',{analytics_storage:'denied',ad_storage:'denied'});if(window.clarity)window.clarity('consentv2',{ad_Storage:'denied',analytics_Storage:'denied'});if(window.bravoAnalyticsLoaded)location.reload();}consent=value;}
  if(document.modelContext?.registerTool){
    const lifecycle=new AbortController();
    window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
    try{Promise.resolve(document.modelContext.registerTool({
      name:'start_booking_demo',title:'Abrir simulação de agendamento',
      description:'Abre a escolha de serviço da Bravo. Não reserva horário nem envia mensagens.',
      inputSchema:{type:'object',properties:{service:{type:'string',enum:['corte','combo','barba','infantil']}},required:['service'],additionalProperties:false},
      annotations:{readOnlyHint:false,untrustedContentHint:false},
      execute(input){if(!input||typeof input!=='object'||Object.keys(input).some(k=>k!=='service')||!Object.hasOwn(services,input.service))throw new Error('Serviço inválido.');if(booking.open)booking.close();(document.querySelector('[data-book="'+input.service+'"]')||document.querySelector('[data-book]')).click();$('#service').value=input.service;renderTimes();showStep();return {status:'flow_opened',service:$('#service').value,reservationCreated:false};}
    },{signal:lifecycle.signal})).catch(()=>{});}catch{}
  }
  $('#accept-cookies').addEventListener('click',()=>setConsent('accepted'));$('#reject-cookies').addEventListener('click',()=>setConsent('rejected'));$('#cookie-settings').addEventListener('click',()=>{$('#cookie-banner').hidden=false;$('#reject-cookies').focus()});
})();
