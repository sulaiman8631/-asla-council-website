export interface Category {
  id: number;
  name: string;
  kind: "news" | "report";
}

export interface NewsImage {
  id: number;
  newsId: number;
  url: string;
  isMain: boolean;
  sortOrder: number;
}

export interface News {
  id: number;
  title: string;
  body: string;
  coverImage: string | null;
  categoryId: number | null;
  category?: Category | null;
  createdBy: number;
  isPublished: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  images?: NewsImage[];
}

export interface Job {
  id: number;
  title: string;
  description: string;
  requirements: string | null;
  type: string | null;
  location: string;
  deadline: string;
  status: "open" | "closed";
  attachment: string | null;
  createdAt: string;
}

export interface Tender {
  id: number;
  referenceNo: string;
  title: string;
  description: string | null;
  document: string | null;
  publishDate: string;
  deadline: string;
  status: "open" | "closed";
  createdAt: string;
}

export interface Report {
  id: number;
  title: string;
  description: string | null;
  file: string;
  categoryId: number | null;
  category?: Category | null;
  year: number | null;
  publishedAt: string;
}

export interface GalleryImage {
  id: number;
  url: string;
  caption: string | null;
  sortOrder: number;
}

export interface TownStatistic {
  id: number;
  label: string;
  value: string;
  sortOrder: number;
}

export interface TownInfo {
  id: number;
  name: string;
  tagline: string | null;
  about: string | null;
  history: string | null;
  population: number | null;
  area: string | null;
  established: string | null;
  mayorName: string | null;
  logo: string | null;
  statistics: TownStatistic[];
}

export interface ContactInfo {
  id: number;
  address: string | null;
  phone: string | null;
  email: string | null;
  workingHours: string | null;
  mapEmbedUrl: string | null;
  lat: number | null;
  lng: number | null;
  facebook: string | null;
  instagram: string | null;
  twitter: string | null;
  youtube: string | null;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string | null;
  subject: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Admin {
  id: number;
  username: string;
  role: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}
