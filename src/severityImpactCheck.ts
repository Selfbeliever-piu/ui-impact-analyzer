import type { ImpactByLevel, ImpactNode, Severity, SeverityImpactResult } from "./types.js";

export function getSeverity(level: number): Severity {
    if (level === 1 || level === 0) return 'HIGH';
    if (level === 2) return 'MEDIUM';
    return 'LOW';
}

export function buildSeverityImpact(
    impactByLevel: ImpactByLevel
  ): SeverityImpactResult {
    const impacted: ImpactNode[] = [];
  
    for (const levelGroup of impactByLevel.levels) {
    //   if (levelGroup.level === 0) continue; // skip source
  
      for (const file of levelGroup.files) {
        impacted.push({
          file,
          level: levelGroup.level,
          severity: getSeverity(levelGroup.level),
        });
      }
    }
  
    return {
      source: impactByLevel.source,
      impacted,
    };
  }