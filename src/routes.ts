import Gifts from './pages/Gifts';
import Group from './pages/Groups';
import CreateGroup from './pages/Groups/CreateGroup';
import JoinGroup from './pages/Groups/JoinGroup';
import MyGroups from './pages/Groups/MyGroups';
import { Home } from './pages/Home';

export const authorizedRoutes = [
    {
        path: '/',
        exact: true,
        component: Home,
    },
    {
        path: '/groups/:groupId',
        exact: true,
        component: Group,
    },
    {
        path: '/join',
        exact: true,
        component: JoinGroup,
    },
    {
        path: '/create',
        exact: true,
        component: CreateGroup,
    },
    {
        path: '/groups',
        exact: true,
        component: MyGroups,
    },
    {
        path: '/groups/:groupId/gifts/',
        exact: true,
        component: Gifts,
    },
];
