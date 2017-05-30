class AbstractEntity {
    id: number;
    creationTime: Date;
    modificationTime: Date;
    createdByUser: string;
    modifiedByUser: string;
    version: number;
}

export class Role extends AbstractEntity {;
    name: string;
    constructor(name: string) {
        super();
        this.name = name;
    }
}

export class Grant extends AbstractEntity {
    role: Role;
    targetType: string;
    targetId: string;
}

export class User extends AbstractEntity {
    userid: string;
    password: string;
    firstName: string;
    lastName: string;
    email: string;
    ouid: string;
    exid: string;
    active: boolean;
    grants: Grant[];
}