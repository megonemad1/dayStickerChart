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


function update_catagories() {
    var params = Object.fromEntries((new URL(window.location.href)).searchParams.entries())
    data = new Cookie("catagories");
    data.setMany(params, 99999);
}

function str_to_color(str) {
    return '#fff';
}
function format_sticker_category(sticker_category) {
    return sticker_category.reduce((sticker_html, s) => sticker_html + `\n<img class='sticker' src='${s}'></img>`, '');
}
function format_category(type, value, sticker_category) {
    const primary_color = str_to_color(type + "_primary");
    const secondary_color = str_to_color(type + "_secondary");
    return `
            <div 
                class='category col card ${type}' 
                data-category-total-value='${sticker_category.length * value}'
                data-category-value='${value}'
                style='--primary-color: "${primary_color}"; --secondary-color: "${secondary_color}"'>
                <span>${type}</span>
                <div class="sticker_container flex-container">${format_sticker_category(sticker_category)}</div>
            </div>`;

}

function format_day(date, day) {
    const catagories = new Cookie("catagories");
    let catagories_html = "";
    let day_value = 0;
    for (let [type, value] of catagories.getAllItems()) {
        const category = day.catagories[type] ?? [];
        catagories_html += format_category(type, value, category);
        day_value += category.length * value;
    }
    return `
         <div class='day row jumbotron' data-timestamp='${date}' data-day-value='${day_value}'>
           ${catagories_html}
        </div>`;
}


function getDateString(day) {
    var dd = String(day.getDate()).padStart(2, '0');
    var mm = String(day.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = day.getFullYear();
    return day = `${dd}/${mm}/${yyyy}`;
}
update_catagories();
const days = Object.fromEntries(new Cookie("day").getAllItems());
const today = getDateString(new Date());
if (!days[today])
    days[today] = { catagories: {} };
var days_html = "";
for (const [date, day] of Object.entries(days)) {
    days_html += format_day(date, day)
}
document.querySelector(".board").innerHTML = days_html;

