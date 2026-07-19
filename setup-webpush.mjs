import fs from 'fs';
// #4 — Web push (OneSignal). Componente + service worker + montaje en layout.
// Inerte hasta definir NEXT_PUBLIC_ONESIGNAL_APP_ID en Vercel.
fs.writeFileSync('components/WebPush.tsx', Buffer.from('J3VzZSBjbGllbnQnOwoKaW1wb3J0IFNjcmlwdCBmcm9tICduZXh0L3NjcmlwdCc7CmltcG9ydCB7IHVzZUVmZmVjdCwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7Cgpjb25zdCBBUFBfSUQgPSBwcm9jZXNzLmVudi5ORVhUX1BVQkxJQ19PTkVTSUdOQUxfQVBQX0lEOwpjb25zdCBSRVFVSVJFX0NPTlNFTlQgPSBwcm9jZXNzLmVudi5ORVhUX1BVQkxJQ19SRVFVSVJFX0NPTlNFTlQgPT09ICd0cnVlJzsKCi8qKgogKiBOb3RpZmljYWNpb25lcyB3ZWIgcHVzaCAoT25lU2lnbmFsKS4gU2UgYWN0aXZhIHNvbG8gc2k6CiAqICAtIE5FWFRfUFVCTElDX09ORVNJR05BTF9BUFBfSUQgZXN0w6EgZGVmaW5pZG8sIHkKICogIC0gaGF5IGNvbnNlbnRpbWllbnRvIChvIFJFUVVJUkVfQ09OU0VOVCAhPT0gJ3RydWUnKS4KICogU2luIEFwcCBJRCBubyBjYXJnYSBuYWRhOiBpbmVydGUgaGFzdGEgcGVnYXIgZWwgSUQgZW4gVmVyY2VsLiBSZXF1aWVyZSBlbAogKiBzZXJ2aWNlIHdvcmtlciBwdWJsaWMvT25lU2lnbmFsU0RLV29ya2VyLmpzIChpbmNsdWlkbykuIEVsIG5hdmVnYWRvciBwaWRlIHN1CiAqIHByb3BpbyBwZXJtaXNvIGRlIG5vdGlmaWNhY2lvbmVzLCBhc8OtIHF1ZSBudW5jYSBub3RpZmljYSBzaW4gb3B0LWluIGV4cGzDrWNpdG8uCiAqLwpleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBXZWJQdXNoKCkgewogIGNvbnN0IFthbGxvd2VkLCBzZXRBbGxvd2VkXSA9IHVzZVN0YXRlKCFSRVFVSVJFX0NPTlNFTlQpOwoKICB1c2VFZmZlY3QoKCkgPT4gewogICAgaWYgKCFSRVFVSVJFX0NPTlNFTlQpIHJldHVybjsKICAgIGNvbnN0IHJlYWQgPSAoKSA9PiB7CiAgICAgIHRyeSB7CiAgICAgICAgc2V0QWxsb3dlZChsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgncHAtY29uc2VudCcpID09PSAnZ3JhbnRlZCcpOwogICAgICB9IGNhdGNoIHsKICAgICAgICAvKiBsb2NhbFN0b3JhZ2Ugbm8gZGlzcG9uaWJsZSAqLwogICAgICB9CiAgICB9OwogICAgcmVhZCgpOwogICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3BwLWNvbnNlbnQtY2hhbmdlJywgcmVhZCk7CiAgICByZXR1cm4gKCkgPT4gd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3BwLWNvbnNlbnQtY2hhbmdlJywgcmVhZCk7CiAgfSwgW10pOwoKICBpZiAoIUFQUF9JRCB8fCAhYWxsb3dlZCkgcmV0dXJuIG51bGw7CgogIHJldHVybiAoCiAgICA8PgogICAgICA8U2NyaXB0IHNyYz0iaHR0cHM6Ly9jZG4ub25lc2lnbmFsLmNvbS9zZGtzL3dlYi92MTYvT25lU2lnbmFsU0RLLnBhZ2UuanMiIHN0cmF0ZWd5PSJhZnRlckludGVyYWN0aXZlIiAvPgogICAgICA8U2NyaXB0IGlkPSJvbmVzaWduYWwtaW5pdCIgc3RyYXRlZ3k9ImFmdGVySW50ZXJhY3RpdmUiPgogICAgICAgIHtgd2luZG93Lk9uZVNpZ25hbERlZmVycmVkPXdpbmRvdy5PbmVTaWduYWxEZWZlcnJlZHx8W107T25lU2lnbmFsRGVmZXJyZWQucHVzaChhc3luYyBmdW5jdGlvbihPbmVTaWduYWwpe2F3YWl0IE9uZVNpZ25hbC5pbml0KHthcHBJZDoiJHtBUFBfSUR9In0pO30pO2B9CiAgICAgIDwvU2NyaXB0PgogICAgPC8+CiAgKTsKfQo=','base64').toString('utf8'));
fs.writeFileSync('public/OneSignalSDKWorker.js', Buffer.from('aW1wb3J0U2NyaXB0cygiaHR0cHM6Ly9jZG4ub25lc2lnbmFsLmNvbS9zZGtzL3dlYi92MTYvT25lU2lnbmFsU0RLLnN3LmpzIik7Cg==','base64').toString('utf8'));
console.log('  escrito components/WebPush.tsx + public/OneSignalSDKWorker.js');

let L = fs.readFileSync('app/layout.tsx','utf8');
if (!L.includes('WebPush')) {
  L = L.replace("import Analytics from '@/components/Analytics';",
    "import Analytics from '@/components/Analytics';\nimport WebPush from '@/components/WebPush';");
  L = L.replace('        <Analytics />\n', '        <Analytics />\n        <WebPush />\n');
  fs.writeFileSync('app/layout.tsx', L);
  console.log('  montado <WebPush /> en layout');
} else console.log('  layout ya tenía WebPush — omitido');

let E = fs.readFileSync('.env.example','utf8');
if (!E.includes('NEXT_PUBLIC_ONESIGNAL_APP_ID')) {
  E += "\n# --- Notificaciones web push (OneSignal) ---\n# App ID de OneSignal (publico, SDK de cliente). Sin el, no se carga nada.\nNEXT_PUBLIC_ONESIGNAL_APP_ID=\n";
  fs.writeFileSync('.env.example', E);
  console.log('  .env.example actualizado');
} else console.log('  .env.example ya tenía la var — omitido');
console.log('LISTO: web push (OneSignal) instalado');
