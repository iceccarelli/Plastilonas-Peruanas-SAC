import Link from 'next/link';

export default function NosotrosPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-14">
      <div className="max-w-3xl">
        <div className="uppercase tracking-[0.15em] text-xs text-[#059669] font-semibold mb-3">DESDE 2009</div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl tracking-tighter font-semibold leading-tight md:leading-none text-[#0A2540]">Más de 15 años fabricando confianza en el Perú.</h1>
      </div>

      <div className="prose prose-lg max-w-3xl mt-10 text-gray-700">
        <p>Plastilonas Peruanas SAC nació en 2009 con una misión clara: ofrecer al mercado peruano productos textiles industriales de la más alta calidad, con precios justos y un servicio que realmente haga la diferencia.</p>
        
        <p>Hoy, más de 15 años después, nos hemos consolidado como uno de los proveedores de referencia para los sectores de minería, agricultura, construcción, transporte e industria en todo el país. Nuestra capacidad de fabricación a medida, combinada con un profundo conocimiento técnico, nos permite entregar soluciones que superan las expectativas de nuestros clientes más exigentes.</p>
      </div>

      <div className="mt-14 grid md:grid-cols-3 gap-6">
        {[
          { title: "Misión", text: "Fabricar y comercializar soluciones textiles industriales de alta calidad que contribuyan al desarrollo productivo de nuestros clientes, ofreciendo siempre el mejor balance entre calidad, precio y servicio." },
          { title: "Visión", text: "Ser reconocidos como el proveedor líder de soluciones textiles industriales en el Perú, distinguiéndonos por nuestra innovación, confiabilidad y compromiso con la satisfacción total del cliente." },
          { title: "Valores", text: "Calidad sin concesiones • Transparencia y honestidad • Compromiso con el cliente • Mejora continua • Responsabilidad social y ambiental." },
        ].map((v, i) => (
          <div key={i} className="bg-white border border-gray-100 p-8 rounded-3xl">
            <div className="font-semibold text-xl tracking-tight mb-4 text-[#0A2540]">{v.title}</div>
            <p className="text-gray-600 leading-relaxed text-[15px]">{v.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 bg-[#0A2540] text-white rounded-3xl p-12 text-center">
        <div className="max-w-md mx-auto">
          <h3 className="text-3xl tracking-tight font-semibold mb-4">¿Listo para trabajar con nosotros?</h3>
          <p className="text-white/80 mb-8">Únase a más de 500 empresas que ya confían en Plastilonas Peruanas para sus proyectos más importantes.</p>
          <Link href="/contacto" className="inline-block bg-white text-[#0A2540] px-10 py-3.5 rounded-2xl font-semibold hover:bg-white/90 transition-all">Contáctenos hoy</Link>
        </div>
      </div>
    </div>
  );
}
