export class UserDetail {
    public id: string;
    public email: string;
    public allow: boolean;
    public admin: boolean;
    public displayName: string;
    public photoURL: string;
    public favoriteGroup: string;

    constructor(props: IUserDetail | undefined) {
        if (props === undefined) {
            this.id = '';
            this.email = '';
            this.allow = false;
            this.admin = false;
            this.displayName = '';
            this.photoURL = '';
            this.favoriteGroup = '';
        } else {
            this.id = props.id;
            this.email = props.email;
            this.allow = props.allow;
            this.admin = props.admin;
            this.displayName = props.displayName;
            this.photoURL = props.photoURL;
            this.favoriteGroup = props.favoriteGroup;
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
    favoriteGroup: string;
}
