/* Homepage contact action; copy only the user-approved phone number. */
(() => {
  const button = document.querySelector('.contact-outline');
  if (!button) return;
  const status = button.querySelector('.contact-address');
  const phone = '13121664213';
  let busy = false, timer;
  function fallbackCopy() {
    const input = document.createElement('textarea');
    input.value = phone; input.readOnly = true;
    input.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
    document.body.append(input);input.select();input.setSelectionRange(0,phone.length);
    try { return document.execCommand('copy'); }
    finally { input.remove();button.focus({preventScroll:true}); }
  }
  button.addEventListener('click',async () => {
    if (busy) return;
    busy = true;clearTimeout(timer);
    let copied = false;
    try {
      if (navigator.clipboard?.writeText) {
        try { await navigator.clipboard.writeText(phone);copied = true; }
        catch { copied = fallbackCopy(); }
      } else copied = fallbackCopy();
    } catch { copied = false; }
    finally { busy = false; }
    status.textContent = copied ? '已复制手机号' : phone;
    button.title = copied ? '已复制手机号' : '复制未成功，请手动复制手机号：13121664213';
    button.setAttribute('aria-label',copied ? '已复制手机号' : '复制未成功，请手动复制手机号 13121664213');
    timer = setTimeout(() => {
      status.textContent = phone;
      button.title = '点击复制手机号（微信同号）';
      button.setAttribute('aria-label','复制手机号 13121664213');
    },3000);
  });
})();
