export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  sector: string[];
  shortDescription: string;
  description: string;
  specifications: Array<{
    label: string;
    value: string;
  }>;
  applications: string[];
  benefits: string[];
  image: string;
  gallery: string[];
  featured: boolean;
  popular: boolean;
}

export interface Testimonial {
  id: number;
  name: string;
  company: string;
  role: string;
  content: string;
  rating: number;
  sector: string;
}

export interface Service {
  id: number;
  title: string;
  description: string;
  icon: string;
  features: string[];
  benefits: string[];
}
