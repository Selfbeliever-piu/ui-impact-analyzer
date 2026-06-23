import { buildDependencyGraph, buildReverseGraph, findImpactedFiles, getImpactByLevel, validateGraph } from "./componentRelations.js";
import { buildSeverityImpact } from "./severityImpactCheck.js";

const graph = await buildDependencyGraph('./sample-app/src'); 
validateGraph(graph)
const reverseGraph = buildReverseGraph(graph);
console.log('----Reverse Graph----- \n')
console.log(reverseGraph)
validateGraph(reverseGraph)
const impactedFiles = findImpactedFiles(
  reverseGraph,
  'sample-app/src/components/Button.tsx'
);

console.log('impact files')

console.log(impactedFiles);
console.log('........................\n')


console.log('---- Impact levels --------\n')
const impactResult = getImpactByLevel(reverseGraph, 'sample-app/src/components/Button.tsx')

console.log('impactByLevel: ', impactResult)

const severityResult = buildSeverityImpact(impactResult)

console.log('severityResult: ', severityResult)

console.log('........................\n')


