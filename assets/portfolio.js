document.addEventListener('DOMContentLoaded', () => {
  const filterButtons = Array.from(document.querySelectorAll('[data-portfolio-filter]'));
  const cards = Array.from(document.querySelectorAll('[data-project-category]'));
  if (!filterButtons.length || !cards.length) return;

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.getAttribute('data-portfolio-filter') || 'all';
      filterButtons.forEach(candidate => candidate.setAttribute('aria-pressed', String(candidate === button)));
      cards.forEach(card => {
        const categories = (card.getAttribute('data-project-category') || '').split(' ');
        card.hidden = filter !== 'all' && !categories.includes(filter);
      });
      const count = cards.filter(card => !card.hidden).length;
      const status = document.querySelector('[data-filter-status]');
      if (status) status.textContent = `${count} project${count === 1 ? '' : 's'} shown`;
    });
  });
});
