export class UserDetail {
    public id: string;
    public email: string;
    public allow: boolean;
    public admin: boolean;
    public displayName: string;
    public photoURL: string;

    constructor(props: IUserDetail | undefined) {
        if (props === undefined) {
            this.id = '';
            this.email = '';
            this.allow = false;
            this.admin = false;
            this.displayName = '';
            this.photoURL = '';
        } else {
            this.id = props.id;
            this.email = props.email;
            this.allow = props.allow;
            this.admin = props.admin;
            this.displayName = props.displayName;
            this.photoURL = props.photoURL;
        }
    }
}

export interface IUserDetail {
    id: string;
    email: string;
    allow: boolean;
    admin: boolean;
    displayName: string;
    photoURL: string;
}
