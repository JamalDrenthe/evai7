import type { OrgRoleType } from "./schema";

export type OrgNode = {
  role: string;
  type: OrgRoleType;
  isEntry?: boolean;
  left?: Array<{ role: string; type: OrgRoleType }>;
  right?: Array<{ role: string; type: OrgRoleType }>;
  children?: OrgNode[];
};

export const organizationData: OrgNode = {
  role: "Founder",
  type: "founder",
  children: [
    {
      role: "Co-founder",
      type: "cofounder",
      left: [{ role: "Co-founder", type: "cofounder" }],
      right: [{ role: "Co-founder", type: "cofounder" }],
      children: [
        {
          role: "Partner",
          type: "partner",
          left: [{ role: "Senior Partner", type: "partner" }],
          right: [{ role: "Passive Partner", type: "partner" }],
          children: [
            {
              role: "CEO",
              type: "csuite",
              left: [{ role: "CTO", type: "csuite" }],
              right: [{ role: "COO", type: "csuite" }],
              children: [
                {
                  role: "Senior Director",
                  type: "director",
                  children: [
                    {
                      role: "Director",
                      type: "director",
                      children: [
                        {
                          role: "Senior Manager Director",
                          type: "director",
                          children: [
                            {
                              role: "Regio Manager",
                              type: "manager",
                              left: [{ role: "Team Manager", type: "manager" }],
                              right: [{ role: "Filiaal Manager", type: "manager" }],
                              children: [
                                {
                                  role: "Senior Consultant",
                                  type: "senior",
                                  left: [{ role: "Senior Closer", type: "senior" }],
                                  right: [{ role: "Consultant", type: "senior" }],
                                  children: [
                                    {
                                      role: "Head Hunter",
                                      type: "recruitment",
                                      children: [
                                        {
                                          role: "Trainee",
                                          type: "recruitment",
                                          children: [
                                            {
                                              role: "Ambassadeur",
                                              type: "recruitment",
                                              children: [
                                                {
                                                  role: "Kandidaat",
                                                  type: "recruitment",
                                                  isEntry: true,
                                                },
                                              ],
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export function findRolePath(
  root: OrgNode,
  roleName: string,
  path: string[] = [],
): { node: OrgNode; path: string[]; level: number } | null {
  const target = roleName.toLowerCase().trim();
  if (root.role.toLowerCase() === target) {
    return { node: root, path: [...path, root.role], level: path.length };
  }
  for (const sib of [...(root.left ?? []), ...(root.right ?? [])]) {
    if (sib.role.toLowerCase() === target) {
      return {
        node: { ...sib },
        path: [...path, root.role, sib.role],
        level: path.length + 1,
      };
    }
  }
  for (const child of root.children ?? []) {
    const found = findRolePath(child, roleName, [...path, root.role]);
    if (found) return found;
  }
  return null;
}

export function summarizeTree(root: OrgNode): {
  totalNodes: number;
  maxDepth: number;
  rolesByType: Record<string, string[]>;
} {
  const rolesByType: Record<string, string[]> = {};
  let total = 0;
  let maxDepth = 0;

  const visit = (node: OrgNode, depth: number) => {
    total += 1;
    maxDepth = Math.max(maxDepth, depth);
    rolesByType[node.type] = rolesByType[node.type] ?? [];
    rolesByType[node.type].push(node.role);
    for (const sib of [...(node.left ?? []), ...(node.right ?? [])]) {
      total += 1;
      rolesByType[sib.type] = rolesByType[sib.type] ?? [];
      rolesByType[sib.type].push(sib.role);
    }
    for (const child of node.children ?? []) visit(child, depth + 1);
  };
  visit(root, 0);

  return { totalNodes: total, maxDepth, rolesByType };
}
