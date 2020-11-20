export class Participant {
    public userId: string;
    public identifier: string;

    constructor(props: IParticipant) {
        this.userId = props.userId;
        this.identifier = props.identifier;
    }
}

export interface IParticipant {
    userId: string;
    identifier: string;
}

export class ParticipantUserDetail {
    constructor(
        public participant?: IParticipant,
        public displayName?: string,
        public photoURL?: string,
        public email?: string,
    ) {}
}

export interface IParticipantUserDetail {
    participant: IParticipant;
    displayName: string;
    photoURL: string;
    email: string;
}
