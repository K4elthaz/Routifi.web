export interface OrgData {
  name: string;
  description?: string;
  //   logo?: File | null;
}

export interface OrganizationMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface GetOrganizationData {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string | null;
  created_at: string;
  created_by?: string;
  api_key?: string;
  members?: OrganizationMember[];
}
