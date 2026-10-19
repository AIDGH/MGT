(()=>{
  'use strict';
  const ui=window.mgtUI||{},slider=document.querySelector('.slider');
  if(slider){
    const slides=[...slider.querySelectorAll('.slide')],selectors=[...document.querySelectorAll('[data-slide]')],pause=slider.querySelector('.slider-pause'),reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
    let active=0,paused=reduced.matches,timer,touch;
    function render(){
      slides.forEach((slide,i)=>{const selected=i===active;slide.classList.toggle('is-active',selected);slide.setAttribute('aria-hidden',String(!selected));slide.querySelectorAll('a').forEach(link=>link.tabIndex=selected?0:-1);});
      selectors.forEach(button=>{const selected=Number(button.dataset.slide)===active;button.classList.toggle(button.closest('.category-strip')?'selected':'active',selected);button.setAttribute(button.closest('.category-strip')?'aria-pressed':'aria-current',String(selected));});
      slider.querySelector('[data-slide-current]').textContent=String(active+1).padStart(2,'0');
      if(pause){pause.textContent=paused?'▶':'Ⅱ';pause.setAttribute('aria-label',paused?ui.play:ui.pause);}
    }
    function schedule(){clearInterval(timer);if(!paused&&slides.length>1&&!document.hidden)timer=setInterval(()=>{active=(active+1)%slides.length;render();},5200);}
    function select(index,user=true){active=(index+slides.length)%slides.length;if(user)paused=true;render();schedule();}
    selectors.forEach(button=>button.addEventListener('click',()=>select(Number(button.dataset.slide))));
    slider.querySelector('.slider-prev')?.addEventListener('click',()=>select(active-1));
    slider.querySelector('.slider-next')?.addEventListener('click',()=>select(active+1));
    pause?.addEventListener('click',()=>{paused=!paused;render();schedule();});
    slider.addEventListener('keydown',event=>{if(event.target!==slider||!['ArrowLeft','ArrowRight'].includes(event.key))return;event.preventDefault();select(active+(event.key==='ArrowRight'?1:-1));});
    slider.addEventListener('touchstart',event=>{touch={x:event.touches[0].clientX,y:event.touches[0].clientY};},{passive:true});
    slider.addEventListener('touchend',event=>{if(!touch)return;const dx=event.changedTouches[0].clientX-touch.x,dy=event.changedTouches[0].clientY-touch.y;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy))select(active+(dx<0?1:-1)*(ui.en?1:-1));touch=null;},{passive:true});
    document.addEventListener('visibilitychange',schedule);
    reduced.addEventListener('change',event=>{if(event.matches)paused=true;render();schedule();});
    render();schedule();
  }
  document.querySelectorAll('[data-copy]').forEach(button=>button.addEventListener('click',async()=>{
    const notice=document.querySelector('.copy-notice');
    try{await navigator.clipboard.writeText(button.dataset.copy);const original=button.innerHTML;button.textContent='✓';if(notice)notice.textContent=ui.copied;setTimeout(()=>{button.innerHTML=original;if(notice)notice.textContent='';},2000);}
    catch{if(notice)notice.textContent=ui.copyFailed;}
  }));
  document.querySelectorAll('[data-gallery]').forEach(button=>button.addEventListener('click',()=>{
    const index=Number(button.dataset.gallery);
    document.querySelectorAll('.product-gallery-image').forEach((img,i)=>img.hidden=i!==index);
    document.querySelectorAll('[data-gallery]').forEach((item,i)=>{item.classList.toggle('selected',i===index);item.setAttribute('aria-pressed',String(i===index));});
  }));
})();
