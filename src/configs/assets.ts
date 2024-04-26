import { Asset } from '@zooizooi/asset-loader';

const models: Asset[] = [
];

const textures: Asset[] = [
    {
        name: 'image-01',
        path: './IMG-20170512-WA0004.jpg',
        type: 'image'
    },
    {
        name: 'image-02',
        path: './IMG-20170608-WA0006.jpg',
        type: 'image'
    },
    {
        name: 'image-03',
        path: './IMG-20170623-WA0020.jpg',
        type: 'image'
    },
    {
        name: 'image-04',
        path: './IMG-20170623-WA0022.jpg',
        type: 'image'
    },
    {
        name: 'image-05',
        path: './IMG-20170707-WA0005.jpg',
        type: 'image'
    },
    {
        name: 'image-06',
        path: './IMG-20170805-WA0000.jpg',
        type: 'image'
    },
    {
        name: 'image-07',
        path: './IMG-20171027-WA0011.jpg',
        type: 'image'
    },
    {
        name: 'image-08',
        path: './IMG-20171028-WA0003.jpg',
        type: 'image'
    },
    {
        name: 'image-09',
        path: './IMG-20171118-WA0008.jpg',
        type: 'image'
    },
];

const audio: Asset[] = [
];

const assets = [
    ...models,
    ...textures,
    ...audio
];

export default assets;