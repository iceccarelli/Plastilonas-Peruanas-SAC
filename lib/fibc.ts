/** FIBC configurator — builds an RFQ spec. Not a price engine. */
export const FIBC_CAPACITY = [
  { value: "1000", label: "1 000 kg (1 t)" },
  { value: "1500", label: "1 500 kg" },
  { value: "2000", label: "2 000 kg (2 t)" },
  { value: "otro", label: "Otra capacidad (especificar)" },
] as const;

export const FIBC_TOP = [
  { value: "abierta", label: "Boca abierta" },
  { value: "boquilla", label: "Con boquilla de carga" },
  { value: "falda", label: "Con falda" },
  { value: "cierre", label: "Con cierre / velcro" },
] as const;

export const FIBC_BOTTOM = [
  { value: "plano", label: "Fondo plano" },
  { value: "boquilla", label: "Boquilla de descarga" },
  { value: "falda", label: "Falda de descarga" },
  { value: "cierre", label: "Con cierre" },
] as const;

export const FIBC_LOOPS = [
  { value: "4-corner", label: "4 asas de esquina" },
  { value: "2-loop", label: "2 asas" },
  { value: "stevedore", label: "Stevedore / cruzadas" },
] as const;

export const FIBC_SF = [
  { value: "5:1", label: "5:1 (punto de partida)" },
  { value: "6:1", label: "6:1 (a confirmar)" },
  { value: "definir", label: "Lo define el expediente" },
] as const;

export const FIBC_EXTRAS = [
  { id: "liner", label: "Liner de PE" },
  { id: "coating", label: "Tejido recubierto" },
  { id: "uv", label: "Tratamiento UV" },
  { id: "antistatic", label: "Opción antiestática" },
  { id: "print", label: "Impresión / identificación" },
] as const;

export interface FibcSpec {
  capacity: string;
  length: string;
  width: string;
  height: string;
  top: string;
  bottom: string;
  loops: string;
  sf: string;
  extras: string[];
  product: string;
  quantity: string;
  notes: string;
}

export const emptyFibc = (): FibcSpec => ({
  capacity: "1000",
  length: "90",
  width: "90",
  height: "110",
  top: "abierta",
  bottom: "plano",
  loops: "4-corner",
  sf: "5:1",
  extras: ["uv"],
  product: "",
  quantity: "",
  notes: "",
});

export function fibcSummary(s: FibcSpec): string {
  return [
    "Configuración FIBC / Big Bag (preliminar, sin precio)",
    `Capacidad: ${s.capacity} kg`,
    `Dimensiones pedidas: ${s.length} × ${s.width} × ${s.height} cm`,
    `Boca: ${s.top}`,
    `Fondo: ${s.bottom}`,
    `Asas: ${s.loops}`,
    `Factor de seguridad pedido: ${s.sf} (a confirmar en cotización)`,
    s.extras.length ? `Opciones: ${s.extras.join(", ")}` : "",
    s.product ? `Producto a envasar: ${s.product}` : "",
    s.quantity ? `Cantidad: ${s.quantity}` : "",
    s.notes ? `Notas: ${s.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
