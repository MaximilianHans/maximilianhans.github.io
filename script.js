(() => {
  const order = ['main', 'research', 'teaching', 'organisation', 'notes'];
  const panels = new Map([...document.querySelectorAll('.site-panel')].map(p => [p.dataset.page, p]));
  const links = [...document.querySelectorAll('[data-page-link]')];
  const menu = document.querySelector('.nav-links');
  const toggle = document.querySelector('.nav-toggle');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scrollTopControl = document.getElementById('scroll-top-control');
  let current = 'main';
  let moving = false;

  const validPage = value => order.includes(value) ? value : 'main';

  function updateScrollTopControl() {
    const panel = panels.get(current);
    const shouldShow = panel && panel.scrollTop > 160;
    scrollTopControl.hidden = !shouldShow;
    scrollTopControl.setAttribute('aria-label', `Scroll ${current} page to top`);
  }

  panels.forEach(panel => panel.addEventListener('scroll', updateScrollTopControl, {passive:true}));
  scrollTopControl?.addEventListener('click', () => {
    const panel = panels.get(current);
    panel?.scrollTo({top:0, behavior:reducedMotion ? 'auto' : 'smooth'});
    panel?.focus({preventScroll:true});
  });

  function updateNavigation(page) {
    links.forEach(link => {
      const active = link.dataset.pageLink === page;
      link.classList.toggle('is-active', active);
      if (active && link.closest('.nav-links')) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }

  function clean(panel) {
    panel.classList.remove('is-entering-forward','is-leaving-forward','is-entering-back','is-leaving-back');
  }

  function showPage(target, push = true) {
    target = validPage(target);
    if (target === current || moving) return;
    const oldPanel = panels.get(current);
    const newPanel = panels.get(target);
    const forward = order.indexOf(target) > order.indexOf(current);
    const enterClass = forward ? 'is-entering-forward' : 'is-entering-back';
    const leaveClass = forward ? 'is-leaving-forward' : 'is-leaving-back';
    moving = true;
    newPanel.scrollTop = 0;
    newPanel.classList.add('is-active', enterClass);
    newPanel.setAttribute('aria-hidden','false');
    oldPanel.classList.add(leaveClass);
    oldPanel.setAttribute('aria-hidden','true');
    updateNavigation(target);
    if (push) history.pushState({page:target}, '', `#${target}`);

    const finish = () => {
      clean(oldPanel); clean(newPanel);
      oldPanel.classList.remove('is-active');
      current = target;
      moving = false;
      newPanel.focus({preventScroll:true});
      updateScrollTopControl();
    };
    if (reducedMotion) finish();
    else setTimeout(finish, 300);
  }

  links.forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    menu?.classList.remove('open');
    toggle?.setAttribute('aria-expanded','false');
    showPage(link.dataset.pageLink);
  }));

  toggle?.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  addEventListener('popstate', () => showPage(location.hash.slice(1), false));
  addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const i = order.indexOf(current);
    if (event.key === 'ArrowRight' && i < order.length - 1) showPage(order[i + 1]);
    if (event.key === 'ArrowLeft' && i > 0) showPage(order[i - 1]);
  });

  const initial = validPage(location.hash.slice(1));
  if (initial !== 'main') {
    panels.get('main').classList.remove('is-active');
    panels.get('main').setAttribute('aria-hidden','true');
    panels.get(initial).classList.add('is-active');
    panels.get(initial).setAttribute('aria-hidden','false');
    current = initial;
    updateNavigation(initial);
    updateScrollTopControl();
  } else if (!location.hash) {
    history.replaceState({page:'main'}, '', '#main');
  }
  updateScrollTopControl();
})();
