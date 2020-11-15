export class UserDetail {
    public id: string;
    public email: string;
    public allow: boolean;

    constructor(props: IUserDetail) {
        this.id = props.id;
        this.email = props.email;
        this.allow = props.allow;
    }
}

export interface IUserDetail {
    id: string;
    email: string;
    allow: boolean;
}
