import Gifts from './pages/Gifts';
import Group from './pages/Groups';
import JoinGroup from './pages/Groups/JoinGroup';
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
        path: '/groups/:groupId/gifts/',
        exact: true,
        component: Gifts,
    },
];
