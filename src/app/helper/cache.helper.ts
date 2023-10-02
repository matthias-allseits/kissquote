
export class CacheHelper {

    public static get(name: string): any
    {
        const data = localStorage.getItem(name);
        const expire = localStorage.getItem(`${name}_expire`);
        if (data && expire && +expire > new Date().getTime()) {
            return JSON.parse(data);
        }
    }

    public static cache(name: string, data: any, ttl: number)
    {
        const expire = new Date().getTime() + ttl;
        localStorage.setItem(name, JSON.stringify(data));
        localStorage.setItem(`${name}_expire`, expire.toString());
    }

}
