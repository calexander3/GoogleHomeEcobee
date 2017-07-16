import * as pg from 'pg'

export class DatabaseService {
    private pool = new pg.Pool({
        database: process.env.DATABASE_NAME,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        port: 5432,
        host: process.env.DATABASE_HOST,
        ssl: true,
        max: 20,
        min: 4,
        idleTimeoutMillis: 1000
    });

    saveRefreshToken(refreshToken: string): Promise<boolean> {
        return new Promise((resolve:any, reject:any) => {
            this.pool.connect().then(client => {
                client.query(`update public."RefreshToken" set "Token" = '${refreshToken}'`)
                .then(res => {
                    client.release()
                    resolve(true);
                })
                .catch(err => {
                    client.release()
                    console.error('update error', err.message, err.stack)
                    reject(err);
                })
            });
        });
    }

    loadRefreshToken(): Promise<string> {
        return new Promise((resolve:any, reject:any) => {
            this.pool.connect().then(client => {
                client.query('select "Token" from public."RefreshToken" limit 1')
                .then(res => {
                    client.release()
                    resolve(res.rows[0].Token);
                })
                .catch(err => {
                    client.release()
                    console.error('select error', err.message, err.stack)
                    reject(err);
                })
            });
        });
    }
}