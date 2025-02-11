export interface OrgData {
  name: string;
  description?: string;
  //   logo?: File | null;
}

export interface GetOrganziationData {
  id: string;
  name: string;
  slug: string;
  created_by: string;
  description: string;
  members: string[];
  created_at: string;
}
