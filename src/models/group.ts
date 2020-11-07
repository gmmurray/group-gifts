import { Gift } from './gift';
import { Participant } from './participant';
export class Group {
    public id: string;
    public name: string;
    public participants: Array<Participant>;
    public code: string;
    public isPublic: boolean;
    public gifts: Array<Gift>;

    constructor(props: undefined | IGroup) {
        if (props !== undefined) {
            this.id = props.id;
            this.name = props.name;
            this.participants = props.participants;
            this.code = props.code;
            this.isPublic = props.isPublic;
            this.gifts = props.gifts;
        } else {
            this.id = '';
            this.name = '';
            this.participants = new Array<Participant>();
            this.code = '';
            this.isPublic = false;
            this.gifts = new Array<Gift>();
        }
    }
}

export interface IGroup {
    gifts: Array<Gift>;
    id: string;
    name: string;
    participants: Array<Participant>;
    code: string;
    isPublic: boolean;
}
