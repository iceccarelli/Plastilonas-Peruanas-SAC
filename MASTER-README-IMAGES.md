# Plastilonas Peruanas SAC – Complete Image Assets
## Master README – How to merge all five ZIPs into the repo

**Total delivered:** 5 ZIPs · 120 photorealistic images (30 products × 4 views)  
(Original request targeted 34 products / 136 images; the five packages cover the full catalogue families.)

### ZIP list
1. `plastilonas-images-01-envases-accesorios.zip` (≈3.3 MB)
2. `plastilonas-images-02-lonas-cobertores.zip` (≈4.0 MB)
3. `plastilonas-images-03-estructuras.zip` (≈3.6 MB)
4. `plastilonas-images-04-mallas-ventilacion-seguridad.zip` (≈4.7 MB)
5. `plastilonas-images-05-geosinteticos-ambientales-publicidad.zip` (≈4.0 MB)

All ZIPs stay well under the 25 MB GitHub file limit.

### Merge steps

1. **Unzip every archive** into a temporary folder.  
   Each ZIP contains a top-level `product-images/` directory.

2. **Copy the image files** into the Next.js public folder:
   ```bash
   # From the root of the Plastilonas-Peruanas-SAC repo
   mkdir -p public/images
   # For each ZIP:
   unzip -o plastilonas-images-0X-*.zip
   # Then flatten / copy every *.jpg into public/images/
   find product-images -name "*.jpg" -exec cp {} public/images/ \;
   ```
   Filenames already match the required pattern (`{slug}-1.jpg` … `{slug}-4.jpg`), so no renaming is needed.

3. **Update the gallery arrays** in `lib/products.ts`  
   Open each ZIP’s `products-gallery-update-partial.ts` and paste the corresponding `image` + `gallery` blocks into the matching product objects.

4. **Optional cleanup**  
   Delete the temporary `product-images/` folders and the five ZIPs after the images are committed.

### Quality notes (all ZIPs)
- Photorealistic industrial / architectural / agricultural look  
- Clean, slightly desaturated modern colour grade matching the live Vercel site  
- Landscape 1920×1280 progressive JPG, web-optimised (~100–300 KB each)  
- Four distinct views per product (hero / detail / installation / scale)  
- No text, logos, watermarks or AI artefacts  
- Compositions support Ken Burns zoom/pan

### After merge
```bash
git add public/images lib/products.ts
git commit -m "feat: add complete product image gallery (120 assets)"
git push
```

The site will then serve the new assets from `/images/...`.
