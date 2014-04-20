/*jshint browser: true, devel: true */
function init() {
  "use strict";
  window.xtag.register('x-blog-posting', {
    // extend existing elements
    extends: 'div',
    mixins: ['request'],
    lifecycle: {
      created: function () {
        // fired once at the time a component
        // is initially created or parsed
        var self = this,
            proxy;
        this.dataready = function (xhr) {
          var article,
              type = xhr.getResponseHeader('content-type'),
              response, metas, tmp, title;
          try {
            if (type === "application/json") {
              article = JSON.parse(xhr.response);
              article.articleBody = window.markdown.toHTML(article.articleBody);
            } else {
              article = {};
              response = xhr.response.split(/^---$/m);
              tmp = document.createElement('div');
              tmp.innerHTML = window.markdown.toHTML(response.pop());
              if (response.length > 0) {
                metas = window.jsyaml.load(response.pop());
                article.headline = metas.title;
              } else {
                // extract first title from content
                title = tmp.querySelector("h1,h2,h3");
                if (title) {
                  article.headline = title.textContent;
                  tmp.removeChild(title);
                }
              }
              article.articleBody = tmp.innerHTML;
            }
            self.setContent(article);
          } catch (e) {
            console.log(e);
          }
        };
        this.innerHTML =
          "<article>\n" +
          "<h2>Title</h2>\n" +
          "<header></header>\n" +
          "<div class='content'></div>" +
          "<footer></footer>" +
          "</article>";
        proxy = this.getAttribute("src");
        if (proxy !== null) {
          proxy = proxy.split("://");
          if (proxy !== null) {
            this.src = window.location.protocol + "//www.corsproxy.com/" + proxy[1];
          }
        }
      }
    },
    methods: {
      setContent: function (article) {
        this.querySelector("h2").textContent = article.headline;
        this.querySelector('.content').innerHTML = article.articleBody;
      }
    }
  });
  window.xtag.register('x-blog', {
    // extend existing elements
    extends: 'div',
    mixins: ['request'],
    lifecycle: {
      created: function () {
        // fired once at the time a component
        // is initially created or parsed
        var self = this,
            src, proxy;
        this.dataready = function (xhr) {
          var tmp, src,
              section = self.querySelector('#main');
          try {
            tmp = window.jsyaml.load(xhr.response);
            self.querySelector("h1").textContent = tmp.title;
            tmp.articles.forEach(function (article) {
              var title = Object.keys(article)[0],
                  post  = document.createElement('x-blog-posting');
              src = article[title].split('://');
              post.src = "http://www.corsproxy.com/" + src.pop();
              section.appendChild(post);
            });
          } catch (e) {
            console.log(e);
          }
        };
        this.innerHTML =
          "<header><h1></h1></header>\n" +
          "<section id='main'>\n" +
          "</section>";
        console.log(this.src);
        src = this.getAttribute('src');
        if (src.substr(0, 4) !== 'http') {
          this.src = src;
        } else {
          proxy = src.split('://');
          if (proxy !== null) {
            this.src = "http://www.corsproxy.com/" + proxy[1];
          }
        }
      }
    }
  });
}
init();
