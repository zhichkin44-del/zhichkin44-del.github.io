// Правки данных /work/ под SPEC-03 (18.11.2026): барбершоп без «Telegram» (Bot API в проекте
// нет, FACTS R11), бот вакансий без LLM (сверка с открытым кодом), без цен и внутренних слов.
// Одноразовый скрипт: node tools/work/fix-data-2026-11-18.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DATA = path.join(path.dirname(fileURLToPath(import.meta.url)), 'data');
const edit = (file, fn) => {
  const p = path.join(DATA, file);
  const d = JSON.parse(readFileSync(p, 'utf8'));
  fn(d);
  writeFileSync(p, JSON.stringify(d, null, 2) + '\n');
};

edit('barbershop-booking-bot.ru.json', (d) => {
  d.title = 'Бот записи для барбершопа: услуги, мастера, слоты, отмена, напоминания';
  d.thumb.alt = d.title;
  d.lead =
    'Клиент сам выбирает услугу, мастера, день и время; занятое время закрыто, есть отмена, напоминания и таблица записей для администратора.';
  d.problem =
    'Барбершоп хочет, чтобы клиенты записывались сами: выбирали услугу, мастера, день и время, получали подтверждение и напоминания за сутки и за два часа. Администратору нужно получать уведомление о каждой записи и видеть все записи в одной таблице.';
  d.built = [
    'Запись кнопками от услуги до подтверждения; сценарий работает на странице в браузере.',
    'Занятое или прошедшее время нельзя выбрать; отмена записи освобождает слот.',
    'Администратор получает уведомление и видит все записи в одной таблице.',
    'Под ваш салон сценарий подключается к каналу, где пишут ваши клиенты: способ подключения согласуем на брифе.',
  ];
  d.shots[0].caption = 'Клиент выбирает услугу, мастера и день кнопками.';
  d.shots[0].alt = d.shots[0].caption;
  d.steps = [
    'Клиент выбирает услугу, мастера, день и время кнопками.',
    'Бот подтверждает запись.',
    'Напоминания уходят за день и за два часа до визита.',
    'Отмена освобождает слот; администратор получает уведомление и видит запись в таблице.',
  ];
  d.stack = ['Сценарий записи со слотами', 'Страница записи в браузере (HTML, CSS, JavaScript)'];
  d.offer = [
    'Бот записи для вашего салона, студии или частного мастера: услуги, мастера, рабочие часы.',
    'Напоминания, отмена и уведомление администратора.',
    'Таблица записей.',
    'Подключение к каналу ваших клиентов — согласуем на брифе.',
  ];
});

edit('barbershop-booking-bot.en.json', (d) => {
  d.title = 'A barbershop booking bot: services, masters, slots, cancellation, reminders';
  d.thumb.alt = d.title;
  d.lead =
    'Clients pick a service, a master, a day and a time themselves; taken slots are blocked, with cancellation, reminders and a bookings table for the admin.';
  d.problem =
    'A barbershop wants clients to book themselves: choose a service, a master, a day and a time, get a confirmation, and be reminded a day and two hours before. The admin needs to be told about each booking and to see all of them in a table.';
  d.built = [
    'Booking with buttons from service to confirmation; the scenario runs on a page in the browser.',
    'Times that are taken or already past cannot be chosen; cancelling a booking frees the slot.',
    'The admin gets a notification and sees all bookings in one table.',
    'For your salon the scenario connects to the channel your clients use: we agree how in the brief.',
  ];
  d.steps = [
    'The client picks a service, a master, a day and a time with buttons.',
    'The bot confirms the booking.',
    'Reminders go out a day and two hours before the visit.',
    'Cancelling frees the slot; the admin is notified and sees the booking in a table.',
  ];
  d.stack = ['Booking scenario with slots', 'Booking page in the browser (HTML, CSS, JavaScript)'];
  d.offer = [
    'A booking bot for your salon, studio or solo master: services, masters, working hours.',
    'Reminders, cancellation and an admin notification.',
    'A bookings table.',
    'Connection to your clients’ channel — agreed in the brief.',
  ];
});

edit('job-feed-bot.ru.json', (d) => {
  d.built[4] =
    'Письмо собирается из ваших утверждённых формулировок; цифры в письме автоматически сверяются с фразами.';
  d.built = [...new Set([...d.built, 'Код открыт на GitHub: github.com/zhichkin44-del/job-feed-bot.'])];
});
edit('job-feed-bot.en.json', (d) => {
  d.built[4] =
    'The letter is assembled from your approved wording; numbers in the letter are automatically checked against the phrases.';
  d.built = [...new Set([...d.built, 'The code is open on GitHub: github.com/zhichkin44-del/job-feed-bot.'])];
});

edit('owner-dashboard.en.json', (d) => {
  for (const s of d.shots) {
    if (s.caption) s.caption = s.caption.replace('Crew screen', 'Agents screen');
    if (s.alt) s.alt = s.alt.replace('Crew screen', 'Agents screen');
  }
});

edit('shorts-and-reels.en.json', (d) => {
  const second = d.shots.find((s) => s.src.endsWith('/02.webp'));
  if (second) {
    d.hero = second;
    d.thumb = { src: second.src, alt: second.caption };
    d.shots = d.shots.filter((s) => s !== second);
  }
});

// Цифры без даты среза — убрать или датировать (FACTS П1).
const sub = (file, from, to) =>
  edit(file, (d) => {
    const s = JSON.stringify(d);
    if (!s.includes(from)) return;
    Object.assign(d, JSON.parse(s.split(from).join(to)));
  });
sub('news-digest-bot.ru.json', '98 источников (92 ленты и 6 трендовых сигналов), опрос каждые 2 минуты.', 'Ленты новостей и трендовые сигналы, опрос каждые 2 минуты.');
sub('news-digest-bot.en.json', '98 sources (92 feeds and 6 trend signals), polled every 2 minutes.', 'News feeds and trend signals, polled every 2 minutes.');
sub('laptop-alarm.ru.json', ' Ещё 13 проверок на записанных звуках проходят.', '');
sub('laptop-alarm.en.json', ' 13 more tests on recorded sounds pass.', '');
sub('shorts-and-reels.ru.json', 'По моему замеру громкость -14.3, -14.0 и -13.8 LUFS', 'Замер трёх клипов на 14.11.2026: −14,3, −14,0 и −13,8 LUFS');
sub('shorts-and-reels.en.json', 'measured loudness of -14.3, -14.0 and -13.8 LUFS', 'three clips measured as of 14 Nov 2026: −14.3, −14.0 and −13.8 LUFS');
sub('youtube-video-production.ru.json', '−14.1 LUFS на готовом видео', '−14,1 LUFS на готовом выпуске (14.11.2026)');
sub('youtube-video-production.en.json', '-14.1 LUFS on the finished video', '−14.1 LUFS on the finished episode (14 Nov 2026)');

// Один продукт — одно имя (SPEC-00 п.2): Pulse AI, а не «Панель владельца».
edit('owner-dashboard.ru.json', (d) => {
  d.title = 'Pulse AI: проекты, задачи агентам и решения одним касанием';
  if (d.thumb.alt?.startsWith('Панель владельца')) d.thumb.alt = d.title;
});
edit('owner-dashboard.en.json', (d) => {
  d.title = 'Pulse AI: projects, agent tasks and one-tap decisions';
  if (d.thumb.alt?.startsWith('Owner dashboard')) d.thumb.alt = d.title;
});
// Обложка новостного бота: кадр канала без рубрики «космос» (слово из запретного списка).
edit('news-digest-bot.ru.json', (d) => {
  const shot = d.shots.find((s) => s.src.endsWith('/ru-02.webp'));
  if (!shot) return;
  d.thumb = { src: shot.src, alt: shot.caption };
  d.hero = shot;
  d.shots = d.shots.filter((s) => s !== shot);
});
sub('team-messenger.ru.json', 'Панель владельца:', 'Панель администратора:');
sub('team-messenger.en.json', 'Owner panel:', 'Admin panel:');
