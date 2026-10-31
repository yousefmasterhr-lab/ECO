// ====================================================================
// ECO ERP - Project Correspondence Management System (PCMS / CTS)
// Multi-Turn Correspondence Graph & Synchronous Thread Engine
// ====================================================================

import { Correspondence } from './types';

export interface ThreadNode {
  doc: Correspondence;
  turn_number: number;
  depth: number;
  party_side: 'A' | 'B';
  party_name: string;
  recipient_name: string;
  parent_serial: string | null;
  days_from_parent: number | null;
  sibling_index: number;
  sibling_total: number;
  is_branch: boolean;
  branch_label?: string;
  has_children: boolean;
}

export interface CorrespondenceThread {
  root_doc: Correspondence;
  nodes: ThreadNode[];
  total_turns: number;
  party_a_name: string;
  party_b_name: string;
  is_closed: boolean;
  latest_doc: Correspondence;
  has_branches: boolean;
}

export function calculateDaysBetween(fromDateStr: string, toDateStr: string): number {
  try {
    const from = new Date(fromDateStr.split('T')[0]);
    const to = new Date(toDateStr.split('T')[0]);
    const diffMs = to.getTime() - from.getTime();
    return Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
  } catch {
    return 0;
  }
}

export function buildCorrespondenceThread(
  currentDocId: string,
  allDocs: Correspondence[]
): CorrespondenceThread | null {
  const target = allDocs.find(d => d.doc_id === currentDocId);
  if (!target) return null;

  // 1. Trace upward to root document
  let root = target;
  const visitedAscent = new Set<string>();
  while (root.parent_doc_id && !visitedAscent.has(root.doc_id)) {
    visitedAscent.add(root.doc_id);
    const parent = allDocs.find(d => d.doc_id === root.parent_doc_id);
    if (!parent) break;
    root = parent;
  }

  // Define Party A as root sender, Party B as root receiver
  const partyAName = root.sender_entity;
  const partyBName = root.receiver_entity;

  // 2. Discover tree via Breadth-First-Search
  const nodes: ThreadNode[] = [];
  let turnCounter = 1;
  let hasBranches = false;

  interface QueueItem {
    doc: Correspondence;
    depth: number;
    parentDoc: Correspondence | null;
    siblingIndex: number;
    siblingTotal: number;
  }

  const queue: QueueItem[] = [
    { doc: root, depth: 0, parentDoc: null, siblingIndex: 0, siblingTotal: 1 }
  ];
  const visitedBfs = new Set<string>();

  while (queue.length > 0) {
    const { doc, depth, parentDoc, siblingIndex, siblingTotal } = queue.shift()!;
    if (visitedBfs.has(doc.doc_id)) continue;
    visitedBfs.add(doc.doc_id);

    // Determine party side: matches root sender -> Side A, else Side B
    const isPartyA = doc.sender_entity.toLowerCase().includes(partyAName.toLowerCase()) ||
                     partyAName.toLowerCase().includes(doc.sender_entity.toLowerCase());
    const partySide: 'A' | 'B' = isPartyA ? 'A' : 'B';

    // Calculate days elapsed from parent
    let daysFromParent: number | null = null;
    if (parentDoc) {
      daysFromParent = calculateDaysBetween(parentDoc.issue_date, doc.issue_date);
    }

    // Direct children
    const children = allDocs
      .filter(d => d.parent_doc_id === doc.doc_id)
      .sort((a, b) => new Date(a.issue_date).getTime() - new Date(b.issue_date).getTime());

    const isBranch = siblingTotal > 1;
    if (isBranch) hasBranches = true;

    const branchLabel = isBranch ? `فرع (${siblingIndex + 1}/${siblingTotal})` : undefined;

    nodes.push({
      doc,
      turn_number: turnCounter++,
      depth,
      party_side: partySide,
      party_name: doc.sender_entity,
      recipient_name: doc.receiver_entity,
      parent_serial: parentDoc ? parentDoc.serial_number : null,
      days_from_parent: daysFromParent,
      sibling_index: siblingIndex,
      sibling_total: siblingTotal,
      is_branch: isBranch,
      branch_label: branchLabel,
      has_children: children.length > 0
    });

    children.forEach((child, idx) => {
      queue.push({
        doc: child,
        depth: depth + 1,
        parentDoc: doc,
        siblingIndex: idx,
        siblingTotal: children.length
      });
    });
  }

  // Sort nodes chronologically
  nodes.sort((a, b) => new Date(a.doc.issue_date).getTime() - new Date(b.doc.issue_date).getTime());
  nodes.forEach((n, idx) => {
    n.turn_number = idx + 1;
  });

  const latestDoc = nodes[nodes.length - 1].doc;
  const isClosed = latestDoc.status === 'Closed' || latestDoc.status === 'Approved';

  return {
    root_doc: root,
    nodes,
    total_turns: nodes.length,
    party_a_name: partyAName,
    party_b_name: partyBName,
    is_closed: isClosed,
    latest_doc: latestDoc,
    has_branches: hasBranches
  };
}

