export const template = {
    reference: {
    objectId: "",
    title: ""
  },
  name: "",
  type: "PubMan",
  state: "CLOSED",
  description: "",
  creator: {
    objectId: ""
  },
  creationDate: "",
  lastModificationDate: "",
  modifiedBy: {
    objectId: ""
  },
  validationPoints: [],
  responsibleAffiliations: [
    {
      objectId: "",
      title: ""
    }
  ],
  adminDescriptor: {
    allowedGenres: [],
    allowedSubjectClassifications: [],
    templateItem: {
      objectId: "",
      versionNumber: 0
    },
    validationSchema: "simple",
    visibilityOfReferences: null,
    workflow: "SIMPLE",
    contactEmail: ""
  }
};

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
};