// Mode hors connexion : tout est mis en cache à la première ouverture.
const V = 'implantation-ar-v9';
const CORE = ['./', 'index.html', 'pdf.min.js', 'pdf.worker.min.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'];
self.addEventListener('install', function(e){
  e.waitUntil(caches.open(V).then(function(c){ return c.addAll(CORE); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.filter(function(k){ return k !== V && k.indexOf('implantation-ar-') === 0; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener('fetch', function(e){
  var r = e.request; if(r.method !== 'GET') return;
  var u = new URL(r.url);
  if(u.origin === location.origin){
    e.respondWith(caches.match(r, { ignoreSearch: true }).then(function(hit){
      var net = fetch(r).then(function(res){
        if(res && res.ok){ var cp = res.clone(); caches.open(V).then(function(c){ c.put(r, cp); }); }
        return res;
      }).catch(function(){ return hit || caches.match('index.html'); });
      return hit || net;   // cache d'abord, mise à jour en arrière-plan
    }));
  } else if(/(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)){
    e.respondWith(caches.open(V).then(function(c){
      return c.match(r).then(function(hit){
        var net = fetch(r).then(function(res){ c.put(r, res.clone()); return res; }).catch(function(){ return hit; });
        return hit || net;
      });
    }));
  }
});
