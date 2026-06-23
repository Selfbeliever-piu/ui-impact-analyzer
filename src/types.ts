export type LevelImpact = {
    level: number;
    files: string[];
  };
  
export type ImpactByLevel = {
    source: string;
    levels: LevelImpact[];
  };

export type Severity = 'HIGH' | 'MEDIUM' | 'LOW';

export type ImpactNode = {
    file: string;
    level: number;
    severity: Severity;
  };
  
export type SeverityImpactResult = {
    source: string;
    impacted: ImpactNode[];
  };