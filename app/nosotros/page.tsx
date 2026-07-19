import Link from 'next/link';

export default function NosotrosPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-14">
      <div className="max-w-3xl">
        <div className="uppercase tracking-[0.15em] text-xs text-[#059669] font-semibold mb-3">DESDE 2009</div>
        <h1 className="t-display font-semibold text-[#0A2540]">Más de 15 años fabricando confianza en el Perú.</h1>
      </div>

      <div className="prose prose-lg max-w-3xl mt-10 text-gray-700">
        <p>Plastilonas Peruanas SAC nació en 2009 con una misión clara: fabricar productos textiles industriales a la medida exacta de cada proyecto, con precio directo de fabricante y respaldo técnico real.</p>
        
        <p>Hoy, con 34 soluciones en 11 líneas de producto, abastecemos a minería, agricultura, construcción, transporte e industria en todo el Perú. Fabricamos e instalamos con equipo propio: una sola responsabilidad, del diseño técnico a la obra.</p>
      </div>

      <div className="mt-14 grid md:grid-cols-3 gap-6">
        {[
          { title: "Misión", text: "Fabricar y comercializar soluciones textiles industriales de alta calidad que contribuyan al desarrollo productivo de nuestros clientes, buscando siempre el equilibrio entre calidad, precio y plazo de entrega." },
          { title: "Visión", text: "Ser el proveedor de referencia en soluciones textiles e industriales del Perú, respondiendo por cada pieza que fabricamos e instalamos." },
          { title: "Valores", text: "Calidad sin concesiones • Transparencia y honestidad • Compromiso con el cliente • Mejora continua • Responsabilidad social y ambiental." },
        ].map((v, i) => (
          <div key={i} className="bg-white border border-gray-100 p-8 rounded-3xl">
            <div className="font-semibold text-xl tracking-tight mb-4 text-[#0A2540]">{v.title}</div>
            <p className="text-gray-600 leading-relaxed t-body">{v.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 bg-[#0A2540] text-white rounded-3xl p-12 text-center">
        <div className="max-w-md mx-auto">
          <h3 className="t-h2 font-semibold mb-4">¿Listo para trabajar con nosotros?</h3>
          <p className="text-white/80 mb-8">Únase a más de 500 empresas que ya confían en Plastilonas Peruanas para sus proyectos más importantes.</p>
          <Link href="/contacto" className="inline-block bg-white text-[#0A2540] btn btn-lg btn-primary font-semibold hover:bg-white/90 transition-all">Contáctenos hoy</Link>
        </div>
      </div>
    </div>
  );
}
