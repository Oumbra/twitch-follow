'use strict'

const IS_MOZILLA = typeof window.browser !== 'undefined';
const API = IS_MOZILLA ? window.browser : chrome;

const STREAM_URL = 'https://api.twitch.tv/helix/streams';
const VALIDATE_URL = 'https://id.twitch.tv/oauth2/validate';
const TOKEN_URL = 'https://id.twitch.tv/oauth2/token';
const CLIENT_ID = 'krgx6qmt69q7s5z4mea0tkbivl0cqf';
const CLIENT_SECRET = 'uv83caoum0ny2x9ihtnad50m5dsehx';
const APP_NAME = 'TWITCH_FOLLOW';
const TWITCH_TOKEN_NAME = `${APP_NAME}_TOKEN`;

// Ajout du listener sur le bouton de la notif
API.notifications.onButtonClicked.addListener((notifId, btnIndex) => {
    switch(btnIndex) {
        case 0:
            window.open(`https://twitch.tv/${notifId}`, "_blank");
        case 1:
        default:
            API.notifications.clear(notifId);
            break;
    }
});

const log = (message, ...args) => {
    const now = new Date();
    const format = `${now.toLocaleDateString('fr-FR')} ${now.toLocaleTimeString('fr-FR')}`;
    console.log(`${format} | ${message}`, ...args);
}
const obj = (key, value) => {
    const _ = {};
    _[key] = value;
    return _;
}
const standardCatchError = error => log('error', error);

class NativeHttpService {

    get(url, options) {
        return this.request('get', url, options);
    }
    
    post(url, body, options) {
        return this.request('post', url, options, body);
    }

    request(method, url, opts, data) {
        const parameters = Object.entries(opts.params || {})
            .map(([key, values]) => Array.isArray(values)
                ? values.map(value => `${key}=${value}`).join('&')
                : `${key}=${values}`
            )
            .join('&');

        const xhr = new XMLHttpRequest();
        xhr.responseType = opts.responseType || 'json';
        xhr.open((method || 'get').toUpperCase(), `${url}${parameters ? '?'+ parameters : ''}`, true);
        
        xhr.addEventListener("load", (ev) => opts.success(ev.target.response));
        xhr.addEventListener("error", (ev) => opts.error(ev.target.response));
        
        Object.entries(opts.headers || {})
            .forEach(([k, v]) => xhr.setRequestHeader(k, `${v}`))

        
        xhr.send(data);
    }

}

class NativeTokenService {

    httpSrv;

    constructor() {
        this.httpSrv = new NativeHttpService();
    }

    getToken(success, error) {
        this.recoverToken(token => !!token
            ? this.validToken(token, success)
            : this.refreshToken(success, error)
        );
    }

    validToken(token, success) {
        this.httpSrv.get(
            VALIDATE_URL,
            {
                headers: { 'Authorization': `OAuth ${token}` },
                success: datas => datas.client_id
                    ? success(token)
                    : this.refreshToken(success, standardCatchError),
                error: standardCatchError
            },
        );
    }

    refreshToken(success, error) {
        return this.httpSrv.post(
            TOKEN_URL,
            null,
            {
                responseType: 'json',
                params: {
                    client_id: CLIENT_ID,
                    client_secret: CLIENT_SECRET,
                    grant_type: 'client_credentials',
                },
                error,
                success: datas => {
                    const token = datas.access_token;
                    API.storage.sync.set(obj(TWITCH_TOKEN_NAME, token));
                    success(token);
                }
            }
        );
    }

    recoverToken(success) {
        API.storage.local.get(TWITCH_TOKEN_NAME, items => success(items[TWITCH_TOKEN_NAME]));
    }

}

class NativeTwitchService {
    
    httpSrv;
    tokenSrv;

    constructor() {
        this.httpSrv = new NativeHttpService();
        this.tokenSrv = new NativeTokenService();
    }

    searchStream(query, success, error) {
        this.tokenSrv.getToken(
            token => this.httpSrv.get(
                STREAM_URL, 
                {
                    headers: {
                        'Client-ID': CLIENT_ID,
                        'Authorization': `Bearer ${token}`
                    },
                    params: query,
                    success: datas => success({ data: datas.data, pagination: datas.pagination }),
                    error,
                }
            ),
            error
        );
    }

}

class NativeStorageService {

    SKELETON = { 
        streamers: [],
        settings: {
            refreshTime: 5000,
            infiniteNotif: true,
        }
    };
    twitchSrv;

    constructor() {
        this.twitchSrv = new NativeTwitchService();
    }

    /**
     * liste de streamer à jour
     */
    streamer$(success) {
        this.storage$(storage => {
            let tmpList = storage.streamers;
            const ids = storage.streamers.map(streamer => `${streamer.id}`);

            this.twitchSrv.searchStream(
                {user_id: ids},
                response => {
                    const streamers = response.data.map(stream => this.convert(stream));
                    const convertedObj = tmpList.map(s => {
                        const streamer = streamers.find(streamer => streamer.id === s.id);
                        return {
                            ...s,
                            is_live: streamer && streamer.is_live,
                            title: streamer && streamer.title,
                            game_id: streamer && streamer.game_id,
                            started_at: streamer && streamer.started_at,
                            viewer_count: streamer && streamer.viewer_count,
                        };
                    });
                    success(convertedObj);
                },
                standardCatchError
            );
        });
    }

    settings$(success) {
        this.storage$(storage => success(storage.settings));
    }

    storage$(success) {
        API.storage.local.get(APP_NAME, items => success(items[APP_NAME] || this.SKELETON));
    }

    convert(input) {
        if ('is_live' in input) {
            const channel = input;
            
            return {
                id: `${channel.id}`,
                name: channel.display_name,
                thumbnail_url: channel.thumbnail_url,
                language: channel.broadcaster_language,
                title: channel.title,
                started_at: channel.started_at,
                is_live: channel.is_live,
            };
        } else {
            const stream = input;
    
            return {
                id: stream.user_id,
                name: stream.user_name,
                thumbnail_url: stream.thumbnail_url,
                language: stream.language,
                title: stream.title,
                started_at: stream.started_at,
                viewer_count: stream.viewer_count,
                game_id: stream.game_id,
                is_live: true,
            };
        }
    }

}

class NativeScheduleService {

    list = [];
    storageSrv;
    httpSrv;

    constructor() {
        this.httpSrv = new NativeHttpService();
        this.storageSrv = new NativeStorageService();
        this.storageSrv.streamer$(streamers => this.list = streamers);
    }

    schedule() {
        this.storageSrv.settings$(settings => {
            const millis = settings ? settings.refreshTime : 5000;
            console.log(`schedule(${millis}) | starting...`, settings);

            setTimeout(() => {
                this.refreshDatas();
                this.schedule();
            }, millis);
        });
    }

    refreshDatas() {
        this.storageSrv.streamer$(streamers => {
            // Referencer les streamers qui étaient en live
            const lived = this.list.filter(i => i.is_live).map(i => i.id);
            
            // Referencer les streamers qui sont en live
            const lives = streamers.filter(i => i.is_live);
            
            // faire la diff des deux listes
            const newLivingStreamers = lives.filter(i => !lived.includes(i.id));
            // lancer une notif si un live a démarré
            newLivingStreamers.forEach(streamer => this.createNotification(streamer));

            if (newLivingStreamers.length > 0) {
                console.log(`${newLivingStreamers.length} new living streamer`);
            }

            // mettre à jour les nouveaux status
            this.list = streamers;
        });
    }

    createNotification(streamer) {
        // chargement asynchrone de l'image
        this.httpSrv.get(
            streamer.thumbnail_url.replace(/\{[^}]+\}/g, '300'),
            {
                responseType: 'blob',
                error: e => {
                    this.list
                        .filter(s => s.id === streamer.id)
                        .forEach(item => item.is_live = false);
                    console.warn(`Notification de live pour ${streamer.name} avortée !`, e);
                },
                success: blob => this.storageSrv.settings$(settings => {
                    const iconUrl = window.URL.createObjectURL(blob);
                    const opts = {
                        type: "basic",
                        iconUrl,
                        title: `${streamer.name} Live`,
                        message: streamer.title,
                    };

                    if (IS_MOZILLA) {
                        API.notifications.create(streamer.name, opts);
                    } else {
                        API.notifications.create(streamer.name, {
                            ...opts,
                            requireInteraction: settings.infiniteNotif,
                            buttons: [
                                {  title: 'Rejoindre' },
                                {  title: 'Pas maintenant' }
                            ],
                        });
                    }
                })
            }
        )
    }
}

const scheduleSrv = new NativeScheduleService();
scheduleSrv.schedule(5000);