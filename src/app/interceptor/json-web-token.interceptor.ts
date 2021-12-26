import {Injectable} from '@angular/core';
import {HttpEvent, HttpInterceptor, HttpHandler, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';


@Injectable()
export class JsonWebTokenInterceptor implements HttpInterceptor {

    public constructor(
    ) { }

    public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const myKey = localStorage.getItem('my-key');
        if (!myKey) {
            return next.handle(req);
        }

        const headerWithJsonWebToken = req.headers.set('Authorization', myKey);

        const requestWithJwt = req.clone({
            headers: headerWithJsonWebToken,
        });

        return next.handle(requestWithJwt);
    }
}
