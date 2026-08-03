export function createRootLanguageRedirect(origin = "https://spaplus.co") {
  const routes = {
    en: "/en/",
    he: "/he/",
    "fr-ca": "/fr-ca/",
    fr: "/fr-ca/",
    ru: "/ru/",
    el: "/el/",
    it: "/it/",
    hu: "/hu/",
    pl: "/pl/",
    es: "/es/",
  };

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,follow">
  <meta http-equiv="refresh" content="0;url=${origin}/en/">
  <link rel="canonical" href="${origin}/en/">
  <title>SpaPlus Global</title>
  <script>
    (function () {
      var routes = ${JSON.stringify(routes)};
      var params = new URLSearchParams(window.location.search);
      var requested = (params.get("lang") || "").toLowerCase();
      var preferred = requested || (navigator.languages && navigator.languages[0]) || navigator.language || "en";
      preferred = preferred.toLowerCase();
      var key = Object.keys(routes).find(function (code) { return preferred === code || preferred.indexOf(code + "-") === 0; }) || "en";
      window.location.replace(routes[key]);
    }());
  </script>
</head>
<body>
  <p><a href="${origin}/en/">Continue to SpaPlus Global</a></p>
</body>
</html>`;
}
