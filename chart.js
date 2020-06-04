class Cookie {
    constructor(type) {
        this.type = encodeURI(type);
    }
    get(key) {
        return Cookie.get(`${this.type}:${key}`)
    }
    static get(key) {
        if (document.cookie == "")
            return undefined;
        return JSON.parse(
            decodeURIComponent(
                document.cookie.split(';')
                    .find(row => row.trim().startsWith(encodeURIComponent(key)))
                    .split('=')[1]
            )
        );
    }

    getAllItems() {
        return Cookie.getAllItems()
            .filter(i => i[0].startsWith(this.type))
            .map(i => [i[0].replace(`${this.type}:`, ''), i[1]]);
    }
    static getAllItems(key) {
        if (document.cookie == "")
            return [];
        return document.cookie.split(';')
            .map(row => row.trim())
            .map(i => {
                const pair = i.split("=")
                if (pair[1] == "")
                    return [pair[0], undefined];
                try {
                    return [
                        decodeURIComponent(pair[0]),
                        JSON.parse(decodeURIComponent(pair[1]))
                    ]
                }
                catch (e) {
                    return pair;
                }
            });
    }
    has(key) {
        return Cookie.has(`${this.type}:${key}`)
    }
    static has(key) {
        if (document.cookie == "")
            return false;
        return document.cookie.split(';')
            .some((item) => item
                .trim()
                .startsWith(`${encodeURIComponent(key)}=`)
            );
    }
    set(key, value, exdays = 1) {
        return Cookie.set(`${this.type}:${key}`, value, exdays)
    }
    static set(key, value, exdays = 1) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        const str_value = encodeURIComponent(JSON.stringify(value))
        document.cookie = `${encodeURIComponent(key)}=${str_value};expires=${d.toUTCString()};path=/`;
    }
    getAllKeys() {
        return Cookie.getAllKeys()
            .filter(i => i.startsWith(this.type))
            .map(i => i.replace(`${this.type}:`, ''));
    }
    static getAllKeys() {
        return document.cookie.match(/[A-Za-z0-9\-_.!~\*'\(\)]*(?==)/g) ?? []
    }
    setMany(cookies, exdays = 1) {
        for (const [key, value] of Object.entries(cookies))
            this.set(key, value, exdays)
    }
    static setMany(cookies, exdays = 1) {
        for (const [key, value] of Object.entries(cookies))
            this.set(key, value, exdays)
    }
}


const get_cookie = () => JSON.parse(document.cookie ? document.cookie : '{}');
function update_cookies(update) {
    data = get_cookie()
    for (const [key, value] of Object.entries(update)) {
        data[key] = value
    }
    console.log(JSON.stringify(data));
    document.cookie = JSON.stringify(data);
}

function update_catagories() {
    var params = Object.fromEntries((new URL(window.location.href)).searchParams.entries())
    data = get_cookie();
    if (!data.catagories)
        data.catagories = {}
    Object.assign(data.catagories, params);
    update_cookies({ catagories: data.catagories });
}

function str_to_color(str) {
    return '#fff';
}
function format_sticker_category(sticker_category) {
    return sticker_category.stickers.reduce((sticker_html, s) => sticker_html + `\n<img class='sticker' src='${s}'></img>`, '');
}
function format_category(type, value) {
    const primary_color = str_to_color(type + "_primary");
    const secondary_color = str_to_color(type + "_secondary");
    if (type in day.sticker_catagories) {
        const categories = day.sticker_catagories[type]
        stickers = categories.reduce((category_html, sticker_category) =>
            category_html + format_sticker_category(sticker_category) + '\n', '');
        return `
            <div 
                class='category ${type}' 
                data-category-value='${categories.length * value}'
                style='--primary-color: "${primary_color}"; --secondary-color: "${secondary_color}"'>
                    ${stickers}
            </div>`;
    }
    else {
        return `
            <div 
                class='category ${type}' 
                data-category-value='0'
                style='--primary-color: "${primary_color}"; --secondary-color: "${secondary_color}"'>
            </div>`;
    }
}
function format_day(date, data) {
    const day = data.days[date];
    const catagories = data.catagories;
    if (!day.catagories)
        day.catagories = {}
    let catagories_html = "";
    let day_value = 0;
    for (let [type, value] of Object.entries(catagories)) {
        catagories_html += format_category(type, value);
        day_value += (day.catagories[type] ?? []).length * value;
    }
    return `
         <div class='day' data-timestamp='${day.timestamp}' data-day-value='${day.stickers.length}'data-day-value=${day_value}>
           ${catagories_html}
        </div>`;
}
update_catagories();
var data = get_cookie();
const today = new Date().getDate();
if (!data.days)
    data.days = { [today]: {} };
else if (!data.days[today])
    data.days[today] = {};
var days_html = "";
for (const date in data.days) {
    days_html += format_day(date, data)
}
document.querySelector(".board").innerHTML = days_html;

