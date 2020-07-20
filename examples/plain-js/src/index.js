import './index.css';

let builderApiKey = 'bb209db71e62412dbe0114bdae18fd15';

updatePage();

function updatePage() {
  if (location.pathname === '/') {
    setHtml('<h2>Welcome to the home page!</h2><p>This page comes from our code.</p>');
  } else if (location.pathname === '/about') {
    setHtml('<h2>Welcome to the about page!</h2><p>This page comes from our code too.</p>');
  } else {
    fetch(
      `https://cdn.builder.io/api/v1/html/page?url=${encodeURI(
        location.href
      )}&apiKey=${builderApiKey}`
    )
      .then(res => res.json())
      .then(data => {
        if (data && data.data && data.data.html) {
          setHtml('<h2>This page is from Builder!</h2>' + data.data.html);
        } else {
          setHtml('No page found for this URL');
        }
      });
  }
}

function setHtml(html) {
  document.querySelector('#app').innerHTML = html;
}

// Listen to clicks of any link, and route client side instead of server side
for (let link of document.querySelectorAll('.link')) {
  link.addEventListener('click', a => {
    a.preventDefault();
    history.pushState({}, '', a.target.getAttribute('href'));
    updatePage();
  });
}
