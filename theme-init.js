// Применяет сохранённую тему до первой отрисовки (без мигания).
// Отдельным файлом, а не встроенным скриптом: строгий CSP без unsafe-inline (06).
try {
  var theme = localStorage.getItem('theme');
  if (theme === 'light' || theme === 'dark') document.documentElement.dataset.theme = theme;
} catch {
  // localStorage недоступен: остаётся системная тема
}
