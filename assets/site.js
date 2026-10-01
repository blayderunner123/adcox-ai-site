document.addEventListener('DOMContentLoaded',()=>{
  document.body.classList.add('adcox-site');
  const path=location.pathname.replace(/\/+$/,'')||'/';
  const active=(href)=>{const target=href.replace(/\/+$/,'')||'/';return path===target||(target!=='/'&&path.startsWith(`${target}/`))?' aria-current="page"':''};
  const header=`<header id="adx-site-header"><div class="adx-shell adx-nav"><a class="adx-brand" href="/"><span class="adx-brand-mark" style="width:42px!important;height:42px!important;min-width:42px!important;max-width:42px!important;overflow:hidden!important;flex:0 0 42px!important"><img src="/favicon/favicon-256x256.png" alt="" width="42" height="42" style="width:42px!important;height:42px!important;min-width:42px!important;max-width:42px!important;display:block!important;object-fit:cover!important;border-radius:50%!important"></span><span class="adx-brand-copy"><strong>Adcox.AI</strong><span>Systems for what’s next</span></span></a><button class="adx-menu-toggle" type="button" aria-expanded="false" aria-controls="adx-site-links">Menu</button><nav class="adx-links" id="adx-site-links" aria-label="Primary navigation"><a href="/"${active('/')}>Home</a><a href="/about/"${active('/about')}>About</a><a href="/portfolio/"${active('/portfolio')}>Portfolio</a><a href="/#work">Work</a><a href="/#writing">Writing</a><span class="adx-dropdown"><button type="button" aria-expanded="false">Tools ▾</button><span class="adx-dropdown-menu"><a href="/ask-ai/"><strong>Ask Adcox AI</strong><small>Ask anything · no saved history</small></a><a href="/keyforge/">KeyForge<small>Password derivation</small></a><a href="/url-parser/">URL Parser<small>Inspect and decode</small></a><a href="/qr-brand/">QR Maker<small>Branded QR exports</small></a><a href="/metrics-api/">Metrics Console<small>API observability</small></a></span></span><a href="/ask-ai/"${active('/ask-ai')}>Ask AI</a><a href="/#contact">Contact</a></nav></div></header><div id="adx-status-strip"><div class="adx-shell"><span class="adx-status-dot"></span> Systems connected · Evidence verified</div></div>`;
  const footer=`<footer class="site-footer"><div class="site-shell"><div class="footer-grid"><div><div class="footer-title">Adcox.AI</div><p class="footer-copy">The canonical professional home of Jonathan R. Adcox—application architecture, integration, identity, automation, and practical tools.</p></div><div><div class="footer-heading">Explore</div><div class="footer-list"><a class="footer-link" href="/about/">About Jonathan</a><a class="footer-link" href="/portfolio/">Portfolio</a><a class="footer-link" href="/#work">Selected work</a><a class="footer-link" href="/#tools">Tools</a><a class="footer-link" href="/ask-ai/">Ask AI</a></div></div><div><div class="footer-heading">Public footprint</div><div class="footer-list"><a class="footer-link" href="https://github.com/blayderunner123" rel="me noopener" target="_blank">GitHub</a><a class="footer-link" href="https://www.linkedin.com/in/blayderunner123" rel="me noopener" target="_blank">LinkedIn</a><a class="footer-link" href="https://stackoverflow.com/users/4014161/blayderunner123" rel="me noopener" target="_blank">Stack Overflow</a></div></div></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} Jonathan R. Adcox</span><span>Architecture builds opportunity</span></div></div></footer>`;
  const oldNav=document.querySelector('body > nav, body > header nav, nav.navbar');
  if(oldNav){const wrapper=document.createElement('div');wrapper.innerHTML=header;oldNav.replaceWith(...wrapper.children)}else document.body.insertAdjacentHTML('afterbegin',header);
  const oldFooter=document.querySelector('body > footer, footer');
  if(oldFooter)oldFooter.outerHTML=footer;else document.body.insertAdjacentHTML('beforeend',footer);
  const button=document.querySelector('.adx-menu-toggle');const links=document.querySelector('.adx-links');
  const toolMenu=document.querySelector('.adx-dropdown');const toolButton=toolMenu?.querySelector('button');toolButton?.addEventListener('click',()=>{const open=toolMenu.classList.toggle('open');toolButton.setAttribute('aria-expanded',String(open))});
  button?.addEventListener('click',()=>{const open=links?.classList.toggle('open');button.setAttribute('aria-expanded',String(Boolean(open)))});
  links?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{links.classList.remove('open');button?.setAttribute('aria-expanded','false')}));

  const lightboxImages=[...document.querySelectorAll('.project-sidebar-preview img,.project-gallery img')];
  if(lightboxImages.length){
    document.body.insertAdjacentHTML('beforeend',`<dialog class="image-lightbox" aria-label="Image preview"><div class="image-lightbox-toolbar"><span class="image-lightbox-label"></span><div><button type="button" data-lightbox-action="out" aria-label="Zoom out">−</button><button type="button" data-lightbox-action="reset" aria-label="Reset zoom">100%</button><button type="button" data-lightbox-action="in" aria-label="Zoom in">+</button><button type="button" data-lightbox-action="close" aria-label="Close image preview">×</button></div></div><div class="image-lightbox-stage"><img alt=""></div></dialog>`);
    const dialog=document.querySelector('.image-lightbox');
    const stage=dialog.querySelector('.image-lightbox-stage');
    const preview=stage.querySelector('img');
    const label=dialog.querySelector('.image-lightbox-label');
    const resetButton=dialog.querySelector('[data-lightbox-action="reset"]');
    let scale=1;
    let trigger=null;
    const applyScale=()=>{preview.style.transform=`scale(${scale})`;resetButton.textContent=`${Math.round(scale*100)}%`};
    const reset=()=>{scale=1;applyScale();stage.scrollTo(0,0)};
    const close=()=>dialog.close();
    lightboxImages.forEach(img=>{
      img.tabIndex=0;
      img.setAttribute('role','button');
      img.setAttribute('aria-haspopup','dialog');
      img.setAttribute('aria-label',`Enlarge image: ${img.alt}`);
      const open=()=>{trigger=img;preview.src=img.currentSrc||img.src;preview.alt=img.alt;label.textContent=img.alt;reset();dialog.showModal();dialog.querySelector('[data-lightbox-action="close"]').focus()};
      img.addEventListener('click',open);
      img.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();open()}});
    });
    dialog.addEventListener('click',event=>{if(event.target===dialog)close()});
    stage.addEventListener('click',event=>{if(event.target===stage)close()});
    dialog.addEventListener('close',()=>{preview.removeAttribute('src');trigger?.focus()});
    dialog.querySelector('.image-lightbox-toolbar').addEventListener('click',event=>{
      const action=event.target.closest('button')?.dataset.lightboxAction;
      if(action==='close')close();
      if(action==='reset')reset();
      if(action==='in'){scale=Math.min(3,scale+.25);applyScale()}
      if(action==='out'){scale=Math.max(.5,scale-.25);applyScale()}
    });
    stage.addEventListener('wheel',event=>{
      if(!event.ctrlKey)return;
      event.preventDefault();
      scale=Math.max(.5,Math.min(3,scale+(event.deltaY<0?.1:-.1)));
      applyScale();
    },{passive:false});
  }
});
