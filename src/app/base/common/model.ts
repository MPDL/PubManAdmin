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