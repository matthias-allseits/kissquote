
export class CacheHelper {

    private static ttl: number = 60 * 60 * 1000;

    public static get(name: string): any
    {
        this.cleanUp();
        const data = localStorage.getItem(name);
        const timeLimit = localStorage.getItem(`${name}_expire`);
        if (data && timeLimit && +timeLimit > new Date().getTime()) {
            return JSON.parse(data);
        }
    }

    public static cache(name: string, data: any)
    {
        this.cleanUp();
        const expire = new Date().getTime() + this.ttl;
        localStorage.setItem(name, JSON.stringify(data));
        localStorage.setItem(`${name}_expire`, expire.toString());
    }

    public static cleanUp(): void {
        const timeLimit = new Date().getTime();
        Object.keys(localStorage).forEach(function(key) {
            const expireKey = key + '_expire';
            const ttlive = localStorage.getItem(expireKey);
            if (ttlive && +ttlive < timeLimit) {
                // console.log('cache_key: ' + key);
                // console.log('kill it!');
                localStorage.removeItem(key);
                localStorage.removeItem(expireKey);
            }
        });
    }

}
