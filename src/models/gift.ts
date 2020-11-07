export class Gift {
    public id: string;
    public name: string;
    public userId: string;
    public userIdentifier: string;
    public price: string;
    public webUrl: string;
    public status: GiftStatus;

    constructor(props: IGift) {
        this.id = props.id;
        this.name = props.name;
        this.userId = props.userId;
        this.userIdentifier = props.userIdentifier;
        this.price = props.price;
        this.webUrl = props.webUrl;
        this.status = props.status;
    }
}

export interface IGift {
    status: GiftStatus;
    price: string;
    webUrl: string;
    userId: string;
    userIdentifier: string;
    id: string;
    name: string;
}

export enum GiftStatus {
    Available = 'Available',
    Claimed = 'Claimed',
    Purchased = 'Purchased',
}
