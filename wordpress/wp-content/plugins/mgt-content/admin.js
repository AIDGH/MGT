document.addEventListener('DOMContentLoaded',()=>{
  const title=document.querySelector('#title'),persianName=document.querySelector('[name="mgt[nameFa]"], [name="mgt[titleFa]"]');
  if(title&&persianName){
    persianName.addEventListener('input',()=>{title.value=persianName.value;document.querySelector('#title-prompt-text')?.classList.add('screen-reader-text');});
    title.addEventListener('input',()=>{persianName.value=title.value;});
  }
  document.querySelectorAll('.mgt-image-picker').forEach(picker=>{
    const field=picker.querySelector('input'),previews=picker.querySelector('.mgt-image-previews');
    picker.querySelector('.mgt-pick-images').addEventListener('click',()=>{
      const frame=wp.media({title:'انتخاب تصاویر',button:{text:'استفاده از تصاویر'},library:{type:'image'},multiple:picker.dataset.multiple==='1'});
      frame.on('open',()=>{field.value.split(',').filter(Boolean).forEach(id=>frame.state().get('selection').add(wp.media.attachment(Number(id))));});
      frame.on('select',()=>{const images=frame.state().get('selection').toJSON();field.value=images.map(image=>image.id).join(',');previews.replaceChildren();images.forEach(image=>{const img=document.createElement('img');img.src=image.sizes?.thumbnail?.url||image.url;img.alt=image.alt||'';previews.append(img);});});
      frame.open();
    });
    picker.querySelector('.mgt-clear-images').addEventListener('click',()=>{field.value='';previews.replaceChildren();});
  });
});
