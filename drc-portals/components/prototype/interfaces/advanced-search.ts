export interface AdvancedSearchValues {
  query: string;
  anyQuery: string;
  phraseQuery: string;
  allQuery: string;
  noneQuery: string;
  searchFile: boolean;
  searchSubject: boolean;
  searchBiosample: boolean;
  subjectGenders: string[];
  subjectRaces: string[];
  dccNames: string[];
}
