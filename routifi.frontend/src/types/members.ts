export interface MemberData {
  orgId: string;
  memberId: string;
}

export interface GetMemberTag {
  orgId: string;
  memberId: string;
  tags: [string, string][]; // Array of tuples
}
