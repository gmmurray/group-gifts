export class UserDetail {
    public id: string;
    public email: string;
    public allow: boolean;
    public displayName: string;
    public photoURL: string;

    constructor(props: IUserDetail) {
        this.id = props.id;
        this.email = props.email;
        this.allow = props.allow;
        this.displayName = props.displayName;
        this.photoURL = props.photoURL;
    }
}

export interface IUserDetail {
    id: string;
    email: string;
    allow: boolean;
    displayName: string;
    photoURL: string;
}
