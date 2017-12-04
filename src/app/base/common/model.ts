interface ro {
    objectId: string;
    title: string;
}

class AbstractEntity {
    creationDate: Date;
    lastModificationDate: Date;
    creator: ro;
    modifiedBy: ro;
    reference: ro;
}

export class Affiliation implements ro {
    objectId: string;
    title: string;
}

export class Grant {
    role: string;
    objectRef: string;
}

export class User extends AbstractEntity {
    userid: string;
    password: string;
    name: string;
    email: string;
    affiliations: Affiliation[];
    active: boolean;
    grants: Grant[];
}

export class Context extends AbstractEntity {
    name: string;
    type: string;
    state: string;
    description: string;
    validationPoints: any[];
    responsibleAffiliations: Affiliation[];
    adminDescriptor: AdminDescriptor;
}

export class AdminDescriptor {
    allowedGenres: string[];
    allowedSubjectClassifications: string[];
    templateItem: TemplateItem;
    validationSchema: string = "publication";
    visibilityOfReferences: null;
    workflow: string;
    contactEmail: string;
}

export class TemplateItem {
    objectId: string;
    versionNumber: number;
}

export enum workflow {
    SIMPLE,
    STANDARD
}

export enum subjects {
    DDC,
    ISO639_3,
    JEL,
    MPINP,
    MPIPKS,
    MPIRG,
    MPIS_GROUPS,
    MPIS_PROJECTS,
    MPIWG_PROJECTS
}

export enum genres {
    ARTICLE,
    CONFERENCE_PAPER,
    BOOK_ITEM,
    THESIS,
    TALK_AT_EVENT,
    POSTER,
    BOOK,
    CONTRIBUTION_TO_COLLECTED_EDITION,
    REPORT,
    OTHER,
    PAPER,
    MEETING_ABSTRACT,
    BOOK_REVIEW,
    COURSEWARE_LECTURE,
    MONOGRAPH,
    COLLECTED_EDITION,
    PROCEEDINGS,
    CONTRIBUTION_TO_FESTSCHRIFT,
    CONTRIBUTION_TO_ENCYCLOPEDIA,
    NEWSPAPER_ARTICLE,
    CASE_NOTE,
    ISSUE,
    CONTRIBUTION_TO_COMMENTARY,
    CONFERENCE_REPORT,
    JOURNAL,
    CONTRIBUTION_TO_HANDBOOK,
    EDITORIAL,
    SERIES,
    PATENT,
    FILM,
    MANUSCRIPT,
    COMMENTARY,
    FESTSCHRIFT,
    OPINION,
    HANDBOOK,
    CASE_STUDY,
    ENCYCLOPEDIA,
    MANUAL,
    MULTI_VOLUME,
    NEWSPAPER
}

export class SearchResult {
    version: number;
    numberOfRecords: number;
    records: any[];
    originalResponse: any;
}