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
