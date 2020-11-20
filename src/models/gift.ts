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
    public statusText: string;

    constructor(props: IGift) {
        this.id = props.id;
        this.name = props.name;
        this.userId = props.userId;
        this.userIdentifier = props.userIdentifier;
        this.price = props.price;
        this.webUrl = props.webUrl;
        this.status = props.status;
        this.note = props.note;
        this.statusText = props.statusText;
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
    statusText: string;
}

export class UserGift {
    public id: string;
    public userId: string;
    public name: string;
    public price: string;
    public webUrl: string;
    public note: string;

    constructor(props: IGift) {
        const { id, userId, name, price, webUrl, note } = props;
        this.id = id;
        this.userId = userId;
        this.name = name;
        this.price = price;
        this.webUrl = webUrl;
        this.note = note;
    }
}

export class GiftUpateOrCreate {
    public name: string;
    public price: string;
    public webUrl: string;
    public note: string;

    constructor(props: UserGift | undefined) {
        if (props) {
            const { name, price, webUrl, note } = props;
            this.name = name;
            this.price = price;
            this.webUrl = webUrl;
            this.note = note;
        } else {
            this.name = '';
            this.price = '';
            this.webUrl = '';
            this.note = '';
        }
    }
}

export const mapGiftToUserGift = (gift: IGift) => new UserGift(gift);

export const mapToGiftForCreation = (gift: GiftUpateOrCreate, userId: string) =>
    new Gift({
        ...gift,
        userId,
        userIdentifier: '',
        id: '',
        statusText: '',
        status: GiftStatus.Available,
    });

export const getStatus = (
    next: boolean,
    status: GiftStatus,
): GiftStatus | null => {
    if (next) {
        return status === GiftStatus.Available
            ? GiftStatus.Claimed
            : status === GiftStatus.Claimed
            ? GiftStatus.Purchased
            : null;
    } else {
        return status === GiftStatus.Purchased
            ? GiftStatus.Claimed
            : status === GiftStatus.Claimed
            ? GiftStatus.Available
            : null;
    }
};
