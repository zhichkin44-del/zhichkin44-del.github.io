(function(){
var chips=document.querySelectorAll('.chip'),cards=document.querySelectorAll('#grid .card'),empty=document.getElementById('empty');
function apply(f){var n=0;cards.forEach(function(c){var ok=f==='all'||c.dataset.cats.split('|').indexOf(f)>-1;c.hidden=!ok;if(ok)n++;});
chips.forEach(function(b){b.classList.toggle('on',b.dataset.f===f);b.setAttribute('aria-pressed',b.dataset.f===f);});
if(empty)empty.hidden=n>0;}
chips.forEach(function(b){b.addEventListener('click',function(){apply(b.dataset.f);try{history.replaceState(null,'','#'+(b.dataset.f==='all'?'':encodeURIComponent(b.dataset.f)));}catch(e){}});});
var h=decodeURIComponent(location.hash.slice(1));if(h&&h!=='contact'&&document.querySelector('.chip[data-f="'+h+'"]'))apply(h);
})();
