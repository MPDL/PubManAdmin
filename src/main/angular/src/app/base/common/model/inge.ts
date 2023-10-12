/* eslint-disable no-unused-vars */
export class UserRO {
  objectId: string;
  name: string;
}

export class BasicRO {
  objectId: string;
  name: string;
  creationDate: Date;
  lastModificationDate: Date;
  creator: UserRO;
  modifier: UserRO;
}

export class Grant {
  role: string;
  grantType: string;
  objectRef: string;
  objectStatus: string;
  objectName: string;
  parentName: string;
}

export class User extends BasicRO {
  loginname: string;
  password: string;
  email: string;
  affiliation: BasicRO;
  active: boolean;
  grantList: Grant[];
  topLevelOuIds: string[];
}

export class Ou extends BasicRO {
  predecessorAffiliations: BasicRO[];
  hasChildren: boolean = false;
  childAffiliations: BasicRO[];
  hasPredecessors: boolean = false;
  parentAffiliation: BasicRO;
  publicStatus: string;
  metadata: OuMetadata;
}

export class OuMetadata {
  alternativeNames: string[];
  city: string;
  countryCode: string;
  coordinates: Coordinates;
  identifiers: Identifier[];
  name: string;
  type: string;
  descriptions: string[];
  startDate: string;
  endDate: string;
}

export class Identifier {
  typeString: string;
  id: string;
}

export class Coordinates {
  altitude: number;
  latitude: number;
  longitude: number;
}

export class Ctx extends BasicRO {
  state: string;
  description: string;
  responsibleAffiliations: BasicRO[];
  allowedGenres: string[];
  allowedSubjectClassifications: string[];
  workflow: string;
  contactEmail: string;
}

export enum workflow {
  SIMPLE,
  STANDARD
}

export enum subjects {
  DDC,
  ISO639_3,
  JEL,
  MPICC_PROJECTS,
  MPINP,
  MPIPKS,
  MPIRG,
  MPIS_GROUPS,
  MPIS_PROJECTS,
  MPIWG_PROJECTS
}

export enum genres {
  ARTICLE,
  BLOG_POST,
  BOOK,
  BOOK_ITEM,
  BOOK_REVIEW,
  CASE_NOTE,
  CASE_STUDY,
  COLLECTED_EDITION,
  COMMENTARY,
  CONFERENCE_PAPER,
  CONFERENCE_REPORT,
  CONTRIBUTION_TO_COLLECTED_EDITION,
  CONTRIBUTION_TO_COMMENTARY,
  CONTRIBUTION_TO_ENCYCLOPEDIA,
  CONTRIBUTION_TO_FESTSCHRIFT,
  CONTRIBUTION_TO_HANDBOOK,
  COURSEWARE_LECTURE,
  DATA_PUBLICATION,
  EDITORIAL,
  ENCYCLOPEDIA,
  FESTSCHRIFT,
  FILM,
  HANDBOOK,
  INTERVIEW,
  ISSUE,
  JOURNAL,
  MAGAZINE_ARTICLE,
  MANUAL,
  MANUSCRIPT,
  MEETING_ABSTRACT,
  MONOGRAPH,
  MULTI_VOLUME,
  NEWSPAPER,
  NEWSPAPER_ARTICLE,
  OPINION,
  OTHER,
  PAPER,
  PATENT,
  POSTER,
  PREPRINT,
  PRE_REGISTRATION_PAPER,
  PROCEEDINGS,
  REGISTERED_REPORT,
  REPORT,
  REVIEW_ARTICLE,
  SERIES,
  SOFTWARE,
  TALK_AT_EVENT,
  THESIS
}

export class SearchResult {
  numberOfRecords: number;
  records: any[];
}

