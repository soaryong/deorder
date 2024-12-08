import PocketBase from 'pocketbase';

const pb = new PocketBase("https://api.tuktuk.today");

if (process.env.NODE_ENV === 'development') pb.autoCancellation(false);

export default pb;
