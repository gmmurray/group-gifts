export enum GiftStatus {
    Available = 'Available',
    Claimed = 'Claimed',
    Purchased = 'Purchased',
}

export class Gift {
    public id: string;
    public name: string;
    public userId: string;
    public userIdentifier: string;
    public price: string;
    public webUrl: string;
    public status: GiftStatus;
    public note: string;

    constructor(props: IGift) {
        this.id = props.id;
        this.name = props.name;
        this.userId = props.userId;
        this.userIdentifier = props.userIdentifier;
        this.price = props.price;
        this.webUrl = props.webUrl;
        this.status = props.status;
        this.note = props.note;
    }

    public static forCreation(
        gift: ICreatedGift,
        userId: string,
        userIdentifier: string,
    ): Gift {
        return new this({
            ...gift,
            userId,
            userIdentifier,
            status: GiftStatus.Available,
            id: '',
        });
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
    note: string;
}

export interface ICreatedGift {
    name: string;
    webUrl: string;
    price: string;
    note: string;
}
