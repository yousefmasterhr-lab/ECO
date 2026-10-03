import { AccountNode, RawAccountRecord, StatementType, AccountNature } from './types';

export function buildAccountTree(rawRecords: RawAccountRecord[]): AccountNode[] {
  // Use maps to deduplicate each level
  const level1Map = new Map<string, AccountNode>();
  const level2Map = new Map<string, AccountNode>();
  const level3Map = new Map<string, AccountNode>();
  const level4Map = new Map<string, AccountNode>();
  const level5Map = new Map<string, AccountNode>();

  const getStatementType = (level1Id: string): StatementType => {
    const id = String(level1Id).trim();
    if (id === '1' || id === '2') {
      return 'BALANCE_SHEET';
    }
    return 'INCOME_STATEMENT';
  };

  const getNatureLabel = (nature: AccountNature): string => {
    return nature === 0 ? 'مدين' : 'دائن';
  };

  rawRecords.forEach(rec => {
    const l1Id = String(rec.Level1_ID || '1').trim();
    const l1Name = (rec.Level1_Name_A || 'الاصول').trim();

    const l2Id = String(rec.Level2_ID || l1Id).trim();
    const l2Name = (rec.Level2_Name_A || l1Name).trim();

    const l3Id = String(rec.Level3_ID || l2Id).trim();
    const l3Name = (rec.Level3_Name_A || l2Name).trim();

    const l4Id = String(rec.Level4_ID || l3Id).trim();
    const l4Name = (rec.Level4_Name_A || l3Name).trim();

    const l5Id = String(rec.Level5_ID || '').trim();
    const l5NameA = (rec.Level5_Name_A || '').trim();
    const l5NameE = (rec.Level5_Name_E || l5NameA).trim();

    const nature: AccountNature = Number(rec.Account_Nature) === 1 ? 1 : 0;
    const stmtType = getStatementType(l1Id);

    // 1. Level 1 Node
    if (!level1Map.has(l1Id)) {
      level1Map.set(l1Id, {
        id: `L1-${l1Id}`,
        code: l1Id,
        nameAr: l1Name,
        nameEn: l1Id === '1' ? 'Assets' : l1Id === '2' ? 'Liabilities & Equity' : 'Expenses & Costs',
        level: 1,
        nature: l1Id === '1' || l1Id === '3' ? 0 : 1,
        natureLabelAr: l1Id === '1' || l1Id === '3' ? 'مدين' : 'دائن',
        statementType: stmtType,
        children: [],
        leafCount: 0,
        isActive: true,
      });
    }

    // 2. Level 2 Node
    const l2Key = `${l1Id}-${l2Id}`;
    if (!level2Map.has(l2Key)) {
      const l2Node: AccountNode = {
        id: `L2-${l2Key}`,
        code: l2Id,
        nameAr: l2Name,
        nameEn: l2Name,
        level: 2,
        nature: l1Id === '1' || l1Id === '3' ? 0 : 1,
        natureLabelAr: l1Id === '1' || l1Id === '3' ? 'مدين' : 'دائن',
        statementType: stmtType,
        parentId: `L1-${l1Id}`,
        parentNameAr: l1Name,
        children: [],
        leafCount: 0,
        isActive: true,
      };
      level2Map.set(l2Key, l2Node);
      level1Map.get(l1Id)?.children.push(l2Node);
    }

    // 3. Level 3 Node
    const l3Key = `${l2Key}-${l3Id}`;
    if (!level3Map.has(l3Key)) {
      const l3Node: AccountNode = {
        id: `L3-${l3Key}`,
        code: l3Id,
        nameAr: l3Name,
        nameEn: l3Name,
        level: 3,
        nature: l1Id === '1' || l1Id === '3' ? 0 : 1,
        natureLabelAr: l1Id === '1' || l1Id === '3' ? 'مدين' : 'دائن',
        statementType: stmtType,
        parentId: `L2-${l2Key}`,
        parentNameAr: l2Name,
        children: [],
        leafCount: 0,
        isActive: true,
      };
      level3Map.set(l3Key, l3Node);
      level2Map.get(l2Key)?.children.push(l3Node);
    }

    // 4. Level 4 Node
    const l4Key = `${l3Key}-${l4Id}`;
    if (!level4Map.has(l4Key)) {
      const l4Node: AccountNode = {
        id: `L4-${l4Key}`,
        code: l4Id,
        nameAr: l4Name,
        nameEn: l4Name,
        level: 4,
        nature: nature,
        natureLabelAr: getNatureLabel(nature),
        statementType: stmtType,
        parentId: `L3-${l3Key}`,
        parentNameAr: l3Name,
        children: [],
        leafCount: 0,
        isActive: true,
      };
      level4Map.set(l4Key, l4Node);
      level3Map.get(l3Key)?.children.push(l4Node);
    }

    // 5. Level 5 Node (Detail Leaf Account)
    if (l5Id && !level5Map.has(l5Id)) {
      const bal = Number(rec.Balance ?? rec.balance ?? 0);
      const l5Node: AccountNode = {
        id: `L5-${l5Id}`,
        code: l5Id,
        nameAr: l5NameA,
        nameEn: l5NameE,
        level: 5,
        nature: nature,
        natureLabelAr: getNatureLabel(nature),
        statementType: stmtType,
        parentId: `L4-${l4Key}`,
        parentNameAr: l4Name,
        children: [],
        leafCount: 1,
        balance: isNaN(bal) ? 0 : bal,
        currency: 'EGP',
        isActive: true,
      };
      level5Map.set(l5Id, l5Node);
      level4Map.get(l4Key)?.children.push(l5Node);
    }
  });

  // Flatten redundant single-child intermediate levels before leaf rollup
  const rootNodes = flattenAccountTree(Array.from(level1Map.values()));

  // Calculate leafCount and balance rollups recursively
  const rollupNodeData = (node: AccountNode): { count: number; balance: number } => {
    if (node.level === 5 || node.children.length === 0) {
      node.leafCount = 1;
      return { count: 1, balance: node.balance || 0 };
    }
    let totalCount = 0;
    let totalBalance = 0;
    node.children.forEach(child => {
      const res = rollupNodeData(child);
      totalCount += res.count;
      totalBalance += res.balance;
    });
    node.leafCount = totalCount;
    node.balance = Math.round(totalBalance * 100) / 100;
    return { count: totalCount, balance: totalBalance };
  };

  rootNodes.forEach(rollupNodeData);

  // Sort root nodes and children by code
  const sortRecursive = (nodes: AccountNode[]) => {
    nodes.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
    nodes.forEach(n => {
      if (n.children.length > 0) {
        sortRecursive(n.children);
      }
    });
  };

  sortRecursive(rootNodes);
  return rootNodes;
}

/**
 * Detects whether a child node is a redundant duplicate of its parent
 * (e.g. L1 '1 - الأصول' and sole child L2 '1 - الأصول').
 */
export function isRedundantSingleChild(parent: AccountNode, child: AccountNode): boolean {
  if (parent.code.trim() === child.code.trim()) return true;
  const normalize = (s: string) =>
    (s || '')
      .replace(/[\u064B-\u065F\s]/g, '')
      .replace(/[أإآ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي')
      .toLowerCase()
      .trim();
  return normalize(parent.nameAr) === normalize(child.nameAr);
}

/**
 * Smart Tree Hierarchy Flattening:
 * Collapses redundant single-child intermediate levels where a parent and its sole child
 * share identical codes or names, promoting functional branches directly under the root category.
 */
export function flattenAccountTree(nodes: AccountNode[]): AccountNode[] {
  return nodes.map(node => {
    let currentChildren = flattenAccountTree(node.children);
    while (currentChildren.length === 1 && currentChildren[0].children.length > 0) {
      const singleChild = currentChildren[0];
      if (isRedundantSingleChild(node, singleChild)) {
        currentChildren = singleChild.children.map(grandChild => ({
          ...grandChild,
          parentId: node.id,
          parentNameAr: node.nameAr,
        }));
      } else {
        break;
      }
    }
    return {
      ...node,
      children: currentChildren,
    };
  });
}
