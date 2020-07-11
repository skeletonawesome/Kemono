require.config({
  paths: {
    oboe: 'https://unpkg.com/oboe@2.1.5/dist/oboe-browser.min'
  }
});

function loadQuery () {
  const query = document.getElementById('search-input').value;
  const pathname = window.location.pathname.split('/');
  const contentView = document.getElementById('content');
  contentView.innerHTML = '';
  let api;
  switch (document.getElementsByName('service')[0].content) {
    case 'patreon':
      api = `/api/user/${pathname[2]}/lookup?q=${query}`;
      break;
    case 'fanbox':
      api = `/api/fanbox/user/${pathname[3]}/lookup?q=${query}`;
      break;
    case 'gumroad':
      api = `/api/gumroad/user/${pathname[3]}/lookup?q=${query}`;
      break;
    case 'subscribestar':
      api = `/api/subscribestar/user/${pathname[3]}/lookup?q=${query}`;
      break;
  }
  require(['oboe'], oboe => {
    oboe(api)
      .node('!.*', post => renderPost(post));
  });
}

function loadUserInfo () {
  let service, api, proxy, href;
  const infoView = document.getElementById('info-block');
  const patreonView = document.getElementById('extra-info-block');
  const pathname = window.location.pathname.split('/');
  switch (document.getElementsByName('service')[0].content) {
    case 'patreon':
      service = 'Patreon';
      api = `/api/lookup/cache/${pathname[2]}?service=patreon`;
      proxy = `/proxy/user/${pathname[2]}`;
      href = `https://www.patreon.com/user?u=${pathname[2]}`;
      break;
    case 'fanbox':
      service = 'Fanbox';
      api = `/api/lookup/cache/${pathname[3]}?service=fanbox`;
      href = `https://www.pixiv.net/fanbox/creator/${pathname[3]}`;
      break;
    case 'gumroad':
      service = 'Gumroad';
      api = `/api/lookup/cache/${pathname[3]}?service=gumroad`;
      href = `https://gumroad.com/${pathname[3]}`;
      break;
    case 'subscribestar':
      service = 'SubscribeStar';
      api = `/api/lookup/cache/${pathname[3]}?service=subscribestar`;
      href = `https://subscribestar.adult/${pathname[3]}`;
      break;
  }
  fetch(api)
    .then(res => res.json())
    .then(cache => {
      document.title = `${cache.name} | Kemono`;
      infoView.innerHTML += `
        <li>
          Service: <a href="${href}" target="_blank" rel="noreferrer">${service}</a>
        </li>
        <li>
          User: <a href="${window.location.href.split('?')[0]}">${cache.name}</a>
        </li>
      `;
    });
  if (document.getElementsByName('service')[0].content === 'patreon') {
    fetch(proxy)
      .then(res => res.json())
      .then(user => {
        patreonView.innerHTML += `
          <li>
            Tagline: ${user.included[0].attributes.creation_name}
          </li>
          <li>
            CUF Enabled: ${user.included[0].attributes.is_charge_upfront ? 'Yes' : '<span style="color: #0f0">No</span>'}
          </li>
        `;
      });
  }
}

function main () {
  loadUserInfo();
  document.getElementById('search-input').addEventListener('keyup', debounce(() => loadQuery(), 350));
}

window.onload = () => main();
