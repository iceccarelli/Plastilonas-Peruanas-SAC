INTEGRACIÓN GALERÍA DE MAQUINARIA — Plastilonas Peruanas SAC
============================================================

Dos archivos:
  gallery-code.patch  → los 3 archivos de código (page.tsx + 2 nuevos)
  stage-images.sh     → coloca las 71 imágenes desde los dos ZIP del repo

El .patch NO incluye las imágenes (son binarias): el script las coloca.
Verificado: git apply --check pasa limpio sobre main; el script produce
71 imágenes y es idempotente.
