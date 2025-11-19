// Debug block for hitbox validation in AVToELKConverter.js
// This function should be called in convert() if in dev mode or debug

function validateELKGraphForHitboxIssues(elkGraph) {
  const issues = [];
  function traverse(node) {
    if (node.ports && node.ports.length > 20) {
      issues.push(`Node ${node.id} has ${node.ports.length} ports - may cause hitbox issues`);
    }
    if (node.width && node.width < 50) {
      issues.push(`Node ${node.id} width ${node.width} is very small`);
    }
    if (node.children) {
      node.children.forEach(traverse);
    }
  }
  traverse(elkGraph);
  if (issues.length > 0 && typeof window !== 'undefined' && window.console) {
    window.console.warn('⚠️ Potential ELK layout issues (hitboxes):', issues);
  }
}

export { validateELKGraphForHitboxIssues };
