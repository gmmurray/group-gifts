import Gifts from './pages/Gifts';
import Group from './pages/Groups';
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
        path: '/groups/:groupId/gifts/',
        exact: true,
        component: Gifts,
    },
];
