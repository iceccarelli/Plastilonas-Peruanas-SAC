/** Departamentos del Perú para el formulario de envío. */
export const PERU_DEPARTMENTS = [
  'Amazonas', 'Áncash', 'Apurímac', 'Arequipa', 'Ayacucho', 'Cajamarca',
  'Callao', 'Cusco', 'Huancavelica', 'Huánuco', 'Ica', 'Junín',
  'La Libertad', 'Lambayeque', 'Lima', 'Loreto', 'Madre de Dios',
  'Moquegua', 'Pasco', 'Piura', 'Puno', 'San Martín', 'Tacna',
  'Tumbes', 'Ucayali',
] as const;

export type PeruDepartment = (typeof PERU_DEPARTMENTS)[number];

export interface ShippingDetails {
  name: string;
  email: string;
  phone: string;
  ruc?: string;
  address: string;
  district: string;
  province: string;
  department: string;
  reference?: string;
  notes?: string;
}
